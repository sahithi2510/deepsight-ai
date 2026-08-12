"""
Grad-CAM (Gradient-weighted Class Activation Mapping) Explainability Module for DeepSight AI.

Grad-CAM highlights the critical spatial regions in an input image that influenced
the model's classification decision (Real Photograph vs AI-Generated).

It operates by extracting gradients flowing into the final convolutional layer of MobileNetV3 Small
and weighting the layer's feature maps by their gradient importance.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
import base64
from PIL import Image
import io
from typing import Tuple, Dict, Any

class GradCAM:
    def __init__(self, model: nn.Module, target_layer: nn.Module):
        """
        Initializes Grad-CAM hooks on the specified target layer.
        For MobileNetV3 Small, target_layer is typically model.features[-1].
        """
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # Register forward hook to capture feature map activations
        self.target_layer.register_forward_hook(self._save_activations)
        # Register full backward hook to capture gradients
        self.target_layer.register_full_backward_hook(self._save_gradients)

    def _save_activations(self, module, input, output):
        self.activations = output.detach()

    def _save_gradients(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate_heatmap(self, input_tensor: torch.Tensor, class_idx: int) -> np.ndarray:
        """
        Generates 2D normalized Grad-CAM activation heatmap [0, 1] for class_idx.
        """
        self.model.zero_grad()
        
        # Forward pass logits
        logits = self.model(input_tensor)
        
        # Select target class logit score
        score = logits[0, class_idx]
        
        # Backward pass to compute target class gradients w.r.t feature map activations
        score.backward(retain_graph=True)
        
        # Global Average Pooling of gradients over spatial dimensions (height x width)
        # Alpha weight alpha_k = (1/Z) * sum_i sum_j (dScore / dA_k_ij)
        weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True) # shape: (1, C, 1, 1)
        
        # Weighted combination of feature maps
        # Cam = ReLU( sum_k (alpha_k * Activation_k) )
        cam = torch.sum(weights * self.activations, dim=1, keepdim=True)
        cam = F.relu(cam) # Apply ReLU to keep only positive contributions
        
        # Convert to numpy array
        cam = cam.squeeze().cpu().numpy()
        
        # Handle zero or uniform activation gracefully
        if np.max(cam) - np.min(cam) != 0:
            cam = (cam - np.min(cam)) / (np.max(cam) - np.min(cam))
        else:
            cam = np.zeros_like(cam)
            
        return cam

def generate_gradcam_visualizations(
    model: nn.Module,
    input_tensor: torch.Tensor,
    original_pil_img: Image.Image,
    target_class_idx: int,
    prediction_label_name: str
) -> Dict[str, Any]:
    """
    Computes Grad-CAM and generates three distinct base64 images:
    1. Original Image (unmodified)
    2. Raw Heatmap (pure jet color map, no original image visible)
    3. Overlay (0.6 original + 0.4 heatmap blend)
    
    Plus a human-readable explanation sentence describing attention focus.
    """
    model.eval()
    
    # Target MobileNetV3 small last feature layer
    target_layer = model.features[-1]
    cam_analyzer = GradCAM(model, target_layer)
    
    # Generate 2D numpy heatmap array
    raw_cam = cam_analyzer.generate_heatmap(input_tensor, target_class_idx)
    
    # Convert PIL original image to BGR numpy array matching size
    orig_bgr = cv2.cvtColor(np.array(original_pil_img.convert("RGB")), cv2.COLOR_RGB2BGR)
    h, w, _ = orig_bgr.shape
    
    # Resize raw CAM heatmap to match original image dimensions (h, w)
    cam_resized = cv2.resize(raw_cam, (w, h))
    heatmap_uint8 = np.uint8(255 * cam_resized)
    
    # 1. Raw Heatmap (Colorized JET colormap only, ZERO trace of original image)
    raw_heatmap_bgr = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    
    # 2. Overlay Blend (Original 60% + Raw Heatmap 40%)
    # Distinct arrays pass into cv2.addWeighted to prevent memory buffer aliasing
    overlay_bgr = cv2.addWeighted(orig_bgr, 0.6, raw_heatmap_bgr, 0.4, 0)
    
    # Encode all 3 images to PNG base64 strings
    def bgr_to_b64(bgr_array: np.ndarray) -> str:
        _, buffer = cv2.imencode('.png', bgr_array)
        return base64.b64encode(buffer).decode('utf-8')
    
    original_b64 = bgr_to_b64(orig_bgr)
    heatmap_b64 = bgr_to_b64(raw_heatmap_bgr)
    overlay_b64 = bgr_to_b64(overlay_bgr)
    
    # Determine dominant spatial region of activation to form explanation sentence
    top_half = cam_resized[:h//2, :].mean()
    bottom_half = cam_resized[h//2:, :].mean()
    center = cam_resized[h//4:3*h//4, w//4:3*w//4].mean()
    edges = cam_resized.mean() - center
    
    if center > top_half and center > bottom_half:
        spatial_desc = "central subject details and primary facial/texture features"
    elif top_half > bottom_half:
        spatial_desc = "upper regions including background lighting, hair, and top edges"
    elif bottom_half > top_half:
        spatial_desc = "lower regions including foreground textures and lower body boundaries"
    else:
        spatial_desc = "distributed edge micro-artifacts and surface consistency across the frame"
        
    if prediction_label_name == "AI-Generated":
        explanation = f"The AI detector focused heavily on {spatial_desc}, identifying synthetic blending artifacts and unnatural texture patterns."
    else:
        explanation = f"The AI detector evaluated {spatial_desc}, identifying natural sensor noise, organic edge contrast, and realistic optical lighting patterns."
        
    return {
        "original_b64": original_b64,
        "heatmap_b64": heatmap_b64,
        "overlay_b64": overlay_b64,
        "explanation": explanation
    }
