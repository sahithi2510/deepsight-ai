"""
Digital Image Processing (DIP) Analysis Module for DeepSight AI.

This module provides classical image analysis metrics using OpenCV and NumPy
to evaluate physical image properties that often distinguish real photographs
from AI-generated images (e.g. noise distributions, sharpness, lighting contrast,
and color frequency distribution).
"""

import cv2
import numpy as np
import base64
from typing import Dict, Any, Tuple
from PIL import Image
import io

def calculate_brightness(gray_img: np.ndarray) -> float:
    """
    Computes average brightness (mean pixel intensity).
    
    Formula:
        Brightness = (1 / N) * sum(I_i) for i = 1..N
    
    What it detects:
        Mean luminosity across the image (0 = pure black, 255 = pure white).
        AI generators often produce images with hyper-balanced or unnatural lighting distributions.
    """
    return float(np.mean(gray_img))

def calculate_contrast(gray_img: np.ndarray) -> float:
    """
    Computes global contrast using standard deviation of pixel intensities.
    
    Formula:
        Contrast = sqrt( (1 / N) * sum((I_i - mean)^2) )
    
    What it detects:
        Dynamic range spread between dark and bright regions. Real photographs taken in sunlight
        or high dynamic range settings usually exhibit strong contrast variation compared to muted AI render outputs.
    """
    return float(np.std(gray_img))

def calculate_sharpness(gray_img: np.ndarray) -> float:
    """
    Computes image sharpness / blur score using the variance of the Laplacian operator.
    
    Formula:
        Laplacian Operator L = d^2I/dx^2 + d^2I/dy^2
        Sharpness Score = Variance(L(I))
    
    What it detects:
        High-frequency edge transitions. Real photographs captured with physical camera lenses
        and sensor noise have crisp high-frequency edge gradients, yielding higher Laplacian variance.
        Diffusion models often introduce subtle smooth blur or over-smoothed synthetic skin/textures.
    """
    laplacian = cv2.Laplacian(gray_img, cv2.CV_64F)
    return float(laplacian.var())

def calculate_shannon_entropy(gray_img: np.ndarray) -> float:
    """
    Computes Shannon Entropy of the image grayscale histogram.
    
    Formula:
        H(X) = - sum( p(i) * log2(p(i)) ) for i in 0..255 where p(i) is probability density
    
    What it detects:
        Information density and randomness in pixel values. Real camera images contain sensor noise
        and complex natural surface textures (high entropy, ~7.0-7.9 bits). AI-generated images
        sometimes compress texture detail or display repeating artifact patterns (lower entropy).
    """
    hist = cv2.calcHist([gray_img], [0], None, [256], [0, 256])
    hist_norm = hist.ravel() / hist.sum()
    # Filter out zero probabilities to avoid log2(0) undef
    hist_norm = hist_norm[hist_norm > 0]
    entropy = -np.sum(hist_norm * np.log2(hist_norm))
    return float(entropy)

def calculate_color_histogram(rgb_img: np.ndarray, bins: int = 32) -> Dict[str, list]:
    """
    Computes 32-bin normalized color histograms for Red, Green, and Blue channels.
    
    Formula:
        Hist_c(k) = count(pixel_c in bin_k) / Total_Pixels
    
    What it detects:
        Spectral distribution across color channels. Real photos follow natural optical light response,
        whereas AI models can exhibit unnatural color spikes or missing frequency ranges.
    """
    r_hist = cv2.calcHist([rgb_img], [0], None, [bins], [0, 256]).ravel()
    g_hist = cv2.calcHist([rgb_img], [1], None, [bins], [0, 256]).ravel()
    b_hist = cv2.calcHist([rgb_img], [2], None, [bins], [0, 256]).ravel()
    
    # Normalize to percentages
    total = rgb_img.shape[0] * rgb_img.shape[1]
    
    bin_centers = [int((i + 0.5) * (256 / bins)) for i in range(bins)]
    
    return {
        "bins": bin_centers,
        "red": (r_hist / total * 100).round(2).tolist(),
        "green": (g_hist / total * 100).round(2).tolist(),
        "blue": (b_hist / total * 100).round(2).tolist()
    }

def generate_clahe_image(gray_img: np.ndarray) -> str:
    """
    Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) to expose hidden micro-details.
    
    Formula:
        Divides image into contextual tiles (8x8), equalizes histograms locally,
        and clips histogram slope above clipLimit (2.0) to prevent over-amplifying noise.
    
    What it detects:
        Exposes subtle grid patterns, unnatural blending boundaries, or unnatural shadow gradients
        in synthetic images that are invisible in standard lighting.
    """
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced_gray = clahe.apply(gray_img)
    enhanced_bgr = cv2.cvtColor(enhanced_gray, cv2.COLOR_GRAY2BGR)
    
    _, buffer = cv2.imencode('.png', enhanced_bgr)
    return base64.b64encode(buffer).decode('utf-8')

def analyze_image_dip(image_bytes: bytes) -> Dict[str, Any]:
    """
    Main DIP pipeline accepting raw upload bytes and returning full JSON analysis structure.
    """
    # Load image from bytes into OpenCV RGB and Grayscale format
    np_arr = np.frombuffer(image_bytes, np.uint8)
    bgr_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if bgr_img is None:
        raise ValueError("Invalid or corrupted image format")
        
    rgb_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)
    gray_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
    
    brightness = calculate_brightness(gray_img)
    contrast = calculate_contrast(gray_img)
    sharpness = calculate_sharpness(gray_img)
    entropy = calculate_shannon_entropy(gray_img)
    color_hist = calculate_color_histogram(rgb_img)
    clahe_b64 = generate_clahe_image(gray_img)
    
    return {
        "brightness": round(brightness, 2),
        "contrast": round(contrast, 2),
        "sharpness": round(sharpness, 2),
        "entropy": round(entropy, 2),
        "color_histogram": color_hist,
        "clahe_b64": clahe_b64
    }
