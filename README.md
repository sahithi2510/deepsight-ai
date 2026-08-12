# DeepSight AI — Explainable Image Authenticity Analysis

DeepSight AI is a full-stack computer vision web application that classifies uploaded images as **Real Photograph** or **AI-Generated**, and explains its predictions using **Grad-CAM** heatmaps and classical **Digital Image Processing (DIP)** metrics.

---

## Key Features

- **MobileNetV3-Small transfer learning** — ImageNet-pretrained backbone (frozen), fine-tuned classifier head for binary real-vs-AI-generated classification.
- **Grad-CAM explainability** — visualizes which regions of an image most influenced the model's prediction, via gradient-weighted class activation mapping on the final convolutional layer.
- **Digital image processing analysis** — brightness, contrast, sharpness (Laplacian variance), Shannon entropy, RGB color histogram, and CLAHE-enhanced preview, all computed from actual decoded pixel data with OpenCV/NumPy.
- **Prediction history** — past results stored locally and browsable, with delete support.

---

## Model Performance

Trained on the [CIFAKE dataset](https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images) (100,000 training images, 20,000 held-out test images; real images from CIFAR-10, AI-generated images from Stable Diffusion v1.4).

| Metric | Score |
|---|---|
| Test Accuracy | 93.16% |
| Precision | 93.73% |
| Recall | 92.52% |
| F1 Score | 93.12% |
| ROC-AUC | 0.9827 |

Training used a frozen MobileNetV3-Small backbone with only the final classification layer fine-tuned, on an 85/15 train/validation split of the official CIFAKE training set, evaluated on the official held-out test set.

---

## Tech Stack

- **Frontend**: React (Vite) + TypeScript + Tailwind CSS + Axios
- **Gateway**: Node.js + Express (`server.ts`) — serves the frontend and proxies `/api/*` requests to the Python inference service
- **ML Service**: Python + FastAPI + PyTorch + Torchvision + OpenCV
- **Database**: SQLite

### Architecture

```
Browser → Node.js/Express (port 3000) → proxies /api/predict → FastAPI (port 8000)
                                                                    ↓
                                                     MobileNetV3 inference,
                                                     Grad-CAM, DIP metrics
```

The two services run independently and must both be started manually (see below) — Express does not spawn the Python process automatically.

---

## Live Demo

Deployed on [Render](https://render.com) as two separate free-tier web services:

- **Gateway (frontend + API proxy)**: `https://deepsight-gateway.onrender.com`
- **ML inference service**: `https://deepsight-python.onrender.com`

The gateway calls the ML service using the `PYTHON_SERVICE_URL` environment variable rather than a hardcoded address, so the same code runs locally (pointing at `127.0.0.1:8000`) and in production (pointing at the deployed Python service URL).

> Free-tier services spin down after inactivity. The first request after idle time may take 30-50 seconds while the service wakes up.

---

## Setup & Running Locally

**1. Install Python dependencies and start the inference service:**
```bash
pip install fastapi uvicorn torch torchvision opencv-python-headless pillow numpy python-multipart
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
Run this from the project root (not from inside `backend/`) so the model path resolves correctly.

**2. In a second terminal, install Node dependencies and start the frontend/gateway:**
```bash
npm install
npm run dev
```

**3. Open the app** at `http://localhost:3000`.

Both terminals need to stay running simultaneously.

---

## Limitations

- **Heavily filtered or beautified real photos are prone to misclassification.** Photos processed with smoothing/beautification filters (e.g. Snapchat-style filters) can be predicted as AI-generated with fairly high confidence. This is a known, general weakness of real-vs-AI-generated detectors: such filters smooth out natural sensor noise and skin texture and can introduce artificially uniform gradients — the same visual cues the model learned to associate with AI generation. It is not unique to this model or dataset; it reflects a genuine, documented edge case in this problem space.
- **Trained and evaluated on CIFAKE**, a specific benchmark (CIFAR-10 real images vs. Stable Diffusion v1.4-generated images). Performance may differ on image types, resolutions, or generative models not represented in that dataset (e.g. more recent diffusion models, GAN-based generators, or higher-resolution photography).
- **Confidence scores on ambiguous images can be modest** (in the 55-65% range) rather than sharply separated near 0% or 100%, particularly for images that sit close to the model's decision boundary.
- No user authentication; prediction history is local and single-user.

---

## Project Structure

```
DeepSight-AI/
├── src/                      # React frontend
│   ├── components/
│   ├── pages/
│   └── utils/
├── backend/
│   ├── main.py                # FastAPI app: model loading, /predict, /health
│   └── models/
│       └── deepsight_model.pt # Trained MobileNetV3-Small checkpoint
├── server/
│   └── api.ts                 # Express router, proxies to Python service
├── server.ts                  # Express gateway entrypoint
├── package.json
└── README.md
```

---

## Deploying to Render

1. Push the repo to GitHub, including `backend/models/deepsight_model.pt` (small enough to commit directly — no external download step needed at deploy time).
2. **Create the ML service**: New Web Service → select the repo → Runtime: Python 3 → Build: `pip install fastapi uvicorn torch torchvision opencv-python-headless pillow numpy python-multipart` → Start: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
3. **Create the gateway service**: New Web Service → same repo → Runtime: Node → Build: `npm install && npm run build` → Start: `npm run start` → add environment variable `PYTHON_SERVICE_URL` set to the ML service's Render URL.
4. Render auto-redeploys both services on every push to the connected branch.

---

## Retraining the Model

The model was trained on Kaggle Notebooks (free GPU, CIFAKE dataset pre-attached) rather than locally, since the dataset is ~100,000 images. To retrain or reproduce:

1. Open a new Kaggle Notebook from the [CIFAKE dataset page](https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images), which auto-attaches the dataset.
2. Enable a GPU accelerator (Settings → Accelerator).
3. Run the training script against `train/REAL`, `train/FAKE`, `test/REAL`, `test/FAKE` (the dataset's actual folder structure).
4. Download the resulting `deepsight_model.pt` and place it at `backend/models/deepsight_model.pt`.

---

## Future Enhancements

- Video/deepfake detection
- Real-time webcam analysis
- Comparison against a second architecture (e.g. EfficientNet-B0)
- Google Sign-In (Firebase Auth) for multi-user history
