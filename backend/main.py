"""
DeepSight AI - Real inference backend (FastAPI)
Performs actual MobileNetV3 inference, digital image processing metrics,
and Grad-CAM explainability. Replaces any Gemini/heuristic mock logic.
"""

import io
import time
import base64
import numpy as np
import cv2
from PIL import Image

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cpu")
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
CLASS_MAPPING = {0: "Real Photograph", 1: "AI-Generated"}

eval_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


# ============================================================
# MODEL LOADING
# ============================================================
def get_mobilenetv3_model(num_classes=2):
    model = models.mobilenet_v3_small(weights=None)
    for param in model.features.parameters():
        param.requires_grad = False
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model


model = get_mobilenetv3_model(num_classes=2)
load_result = model.load_state_dict(
    torch.load("backend/models/deepsight_model.pt", map_location=DEVICE),
    strict=True,
)
model.to(DEVICE)
model.eval()
print("[Model] Loaded successfully:", load_result)

# Target layer for Grad-CAM: last conv block before pooling
TARGET_LAYER = model.features[-1]


# ============================================================
# GRAD-CAM
# ============================================================
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.activations = None
        self.gradients = None
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, input_tensor, class_idx):
        self.model.zero_grad()
        output = self.model(input_tensor)
        score = output[0, class_idx]
        score.backward()

        # Global-average-pool the gradients -> channel importance weights
        weights = self.gradients.mean(dim=(2, 3), keepdim=True)
        cam = (weights * self.activations).sum(dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = F.interpolate(cam, size=(224, 224), mode="bilinear", align_corners=False)
        cam = cam.squeeze().cpu().numpy()
        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)
        return cam, output


gradcam = GradCAM(model, TARGET_LAYER)


def cam_to_heatmap_and_overlay(cam, original_rgb_224):
    """
    original_rgb_224: numpy array (224, 224, 3), RGB, uint8
    Returns (heatmap_bgr, overlay_bgr) as numpy arrays, both uint8 BGR (for cv2 encoding)
    """
    heatmap_uint8 = np.uint8(255 * cam)
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)  # BGR, colorized

    original_bgr = cv2.cvtColor(original_rgb_224, cv2.COLOR_RGB2BGR)
    overlay = cv2.addWeighted(original_bgr, 0.6, heatmap_color, 0.4, 0)

    return heatmap_color, overlay


def encode_image_b64(img_bgr, mime="image/png"):
    success, buf = cv2.imencode(".png", img_bgr)
    if not success:
        raise RuntimeError("Failed to encode image")
    b64 = base64.b64encode(buf).decode("utf-8")
    return f"data:{mime};base64,{b64}"


# ============================================================
# DIGITAL IMAGE PROCESSING METRICS
# ============================================================
def analyze_image_dip(pil_img: Image.Image):
    """Computes brightness, contrast, sharpness, entropy, histogram, CLAHE from REAL decoded pixels."""
    rgb = np.array(pil_img.convert("RGB"))
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)

    # Brightness: mean pixel intensity
    brightness = float(np.mean(gray))

    # Contrast: standard deviation of pixel intensity
    contrast = float(np.std(gray))

    # Sharpness/Blur score: variance of Laplacian (higher = sharper)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    sharpness = float(laplacian.var())

    # Shannon entropy of grayscale histogram
    hist, _ = np.histogram(gray, bins=256, range=(0, 256))
    hist_norm = hist / (hist.sum() + 1e-8)
    entropy = float(-np.sum(hist_norm[hist_norm > 0] * np.log2(hist_norm[hist_norm > 0])))

    # Color histogram (32 bins per channel) for the frontend chart
    num_bins = 32
    bins = [round((i / num_bins) * 255) for i in range(num_bins)]
    red_hist, _ = np.histogram(rgb[:, :, 0], bins=num_bins, range=(0, 256))
    green_hist, _ = np.histogram(rgb[:, :, 1], bins=num_bins, range=(0, 256))
    blue_hist, _ = np.histogram(rgb[:, :, 2], bins=num_bins, range=(0, 256))

    # CLAHE-enhanced version
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    clahe_gray = clahe.apply(gray)
    clahe_bgr = cv2.cvtColor(clahe_gray, cv2.COLOR_GRAY2BGR)

    return {
        "brightness": round(brightness, 1),
        "contrast": round(contrast, 1),
        "sharpness": round(sharpness, 1),
        "entropy": round(entropy, 2),
        "color_histogram": {
            "bins": bins,
            "red": red_hist.tolist(),
            "green": green_hist.tolist(),
            "blue": blue_hist.tolist(),
        },
    }, clahe_bgr


# ============================================================
# PREDICTION ENDPOINT
# ============================================================
@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    start_time = time.time()

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 15MB limit.")

    try:
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode image file: {str(e)}")

    # Real DIP metrics from actually decoded pixels
    dip_metrics, clahe_bgr = analyze_image_dip(pil_img)

    # Real model inference
    input_tensor = eval_transform(pil_img).unsqueeze(0).to(DEVICE)
    input_tensor.requires_grad_(True)

    # One clean forward pass to get the prediction (no grad needed here)
    with torch.no_grad():
        probs = F.softmax(model(input_tensor), dim=1).squeeze()
    pred_idx = int(torch.argmax(probs).item())
    confidence = float(probs[pred_idx].item()) * 100.0

    # Separate forward+backward pass for Grad-CAM (needs gradients enabled)
    cam, _ = gradcam.generate(input_tensor, class_idx=pred_idx)
    prediction_name = CLASS_MAPPING[pred_idx]
    authenticity_score = confidence if pred_idx == 0 else round(100 - confidence, 1)

    # Build visualizations from the REAL image and REAL Grad-CAM output
    original_224 = np.array(pil_img.resize((224, 224)))
    heatmap_bgr, overlay_bgr = cam_to_heatmap_and_overlay(cam, original_224)

    original_bgr = cv2.cvtColor(original_224, cv2.COLOR_RGB2BGR)

    explanation = (
        f"Grad-CAM highlights the regions the model weighted most heavily when "
        f"predicting '{prediction_name}' with {confidence:.1f}% confidence."
    )

    elapsed_ms = int((time.time() - start_time) * 1000)

    return {
        "prediction": prediction_name,
        "prediction_label": pred_idx,
        "confidence": round(confidence, 1),
        "authenticity_score": round(authenticity_score, 1),
        "explanation": explanation,
        "prediction_time_ms": elapsed_ms,
        "dip_metrics": dip_metrics,
        "visualizations": {
            "original": encode_image_b64(original_bgr),
            "heatmap": encode_image_b64(heatmap_bgr),
            "overlay": encode_image_b64(overlay_bgr),
            "clahe": encode_image_b64(clahe_bgr),
        },
    }


@app.get("/health")
async def health():
    return {"status": "online", "model_loaded": True, "device": str(DEVICE)}
