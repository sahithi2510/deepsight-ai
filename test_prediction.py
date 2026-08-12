"""
Internal verification script for DeepSight AI model inference & preprocessing.
Tests two visually distinct images to verify:
1. Shape and pixel statistics (mean, std) of preprocessed tensors
2. Raw model output logits before softmax
3. Meaningful difference in logits between distinct inputs
4. Heatmap vs Overlay image separation
"""

import os
import io
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image, ImageDraw
import numpy as np

from backend.main import eval_transform, get_mobilenetv3_model, CLASS_MAPPING
from backend.image_analysis import analyze_image_dip
from backend.gradcam import generate_gradcam_visualizations

MODEL_PATH = "backend/models/deepsight_model.pt"

def create_test_image_1():
    """Generates a natural photographic style test image (landscape scene with texture)."""
    img = Image.new("RGB", (300, 300), color=(135, 206, 235)) # Sky blue
    draw = ImageDraw.Draw(img)
    # Add green hill
    draw.ellipse([(-50, 150), (350, 450)], fill=(34, 139, 34))
    # Add sun
    draw.ellipse([(200, 30), (260, 90)], fill=(255, 223, 0))
    # Add noise texture
    arr = np.array(img).astype(np.int16)
    noise = np.random.normal(0, 15, arr.shape).astype(np.int16)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def create_test_image_2():
    """Generates a synthetic geometric pattern image (high-frequency checkerboard & sharp gradients)."""
    arr = np.zeros((300, 300, 3), dtype=np.uint8)
    # Checkerboard
    for i in range(0, 300, 20):
        for j in range(0, 300, 20):
            if ((i // 20) + (j // 20)) % 2 == 0:
                arr[i:i+20, j:j+20] = [255, 0, 128] # Magenta
            else:
                arr[i:i+20, j:j+20] = [0, 255, 200] # Cyan
    return Image.fromarray(arr)

def run_test():
    print("=== DEEPSIGHT AI INTERNAL MODEL & INFERENCE VERIFICATION ===")
    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model checkpoint missing at {MODEL_PATH}")
        return False

    # Load model
    model = get_mobilenetv3_model(num_classes=2)
    result = model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"), strict=True)
    model.eval()
    print("1. Model loaded successfully:", result)

    img1 = create_test_image_1()
    img2 = create_test_image_2()

    # Preprocess Image 1
    t1 = eval_transform(img1).unsqueeze(0)
    # Preprocess Image 2
    t2 = eval_transform(img2).unsqueeze(0)

    print("\n--- Image 1 (Natural Landscape) ---")
    print(f"Tensor Shape: {list(t1.shape)}")
    print(f"Tensor Mean:  {t1.mean().item():.4f}")
    print(f"Tensor Std:   {t1.std().item():.4f}")

    print("\n--- Image 2 (Synthetic Checkerboard) ---")
    print(f"Tensor Shape: {list(t2.shape)}")
    print(f"Tensor Mean:  {t2.mean().item():.4f}")
    print(f"Tensor Std:   {t2.std().item():.4f}")

    # Inference Image 1
    with torch.no_grad():
        logits1 = model(t1).squeeze().tolist()
        probs1 = F.softmax(model(t1), dim=1).squeeze().tolist()

    # Inference Image 2
    with torch.no_grad():
        logits2 = model(t2).squeeze().tolist()
        probs2 = F.softmax(model(t2), dim=1).squeeze().tolist()

    print("\n--- Model Output Logits & Probabilities ---")
    print(f"Image 1 Logits: {logits1} | Probs (0=Real, 1=AI): [{probs1[0]:.4f}, {probs1[1]:.4f}]")
    print(f"Image 2 Logits: {logits2} | Probs (0=Real, 1=AI): [{probs2[0]:.4f}, {probs2[1]:.4f}]")

    # Check that logits differ meaningfully
    logit_diff_0 = abs(logits1[0] - logits2[0])
    logit_diff_1 = abs(logits1[1] - logits2[1])
    print(f"\nLogit Difference Class 0: {logit_diff_0:.4f}")
    print(f"Logit Difference Class 1: {logit_diff_1:.4f}")

    if logit_diff_0 > 0.05 or logit_diff_1 > 0.05:
        print("\nSUCCESS: Logits differ meaningfully between distinct image inputs! Preprocessing & Model handling verified.")
    else:
        print("\nWARNING: Logits are nearly identical! Check input tensor pipeline.")
        return False

    # Check Grad-CAM visualization output
    t1_grad = eval_transform(img1).unsqueeze(0)
    t1_grad.requires_grad = True
    pred_idx1 = 0 if probs1[0] > probs1[1] else 1
    
    gradcam_res = generate_gradcam_visualizations(
        model=model,
        input_tensor=t1_grad,
        original_pil_img=img1,
        target_class_idx=pred_idx1,
        prediction_label_name=CLASS_MAPPING[pred_idx1]
    )

    heatmap_b64 = gradcam_res["heatmap_b64"]
    overlay_b64 = gradcam_res["overlay_b64"]

    print(f"\nGrad-CAM Heatmap B64 Len: {len(heatmap_b64)}")
    print(f"Grad-CAM Overlay B64 Len: {len(overlay_b64)}")
    print(f"Heatmap and Overlay string equality check: {heatmap_b64 == overlay_b64}")

    if heatmap_b64 != overlay_b64:
        print("SUCCESS: Heatmap and Overlay image strings are distinct!")
    else:
        print("ERROR: Heatmap and Overlay images are identical!")
        return False

    return True

if __name__ == "__main__":
    run_test()
