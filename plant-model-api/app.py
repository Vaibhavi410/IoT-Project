import io
import json
import os
import base64
from typing import List

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image
from torchvision import models, transforms


MODEL_PATH = os.getenv("MODEL_PATH", "models/mobilenetv2_plant.pth")
CLASS_NAMES_PATH = os.getenv("CLASS_NAMES_PATH", "models/class_names.json")
TOP_K = int(os.getenv("TOP_K", "3"))

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

app = FastAPI(title="Plant Disease Model API", version="1.0.0")


class PredictRequest(BaseModel):
    imageBase64: str


class PredictionItem(BaseModel):
    label: str
    score: float


def load_class_names(path: str) -> List[str]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list) or not data:
        raise ValueError("class_names.json must be a non-empty JSON array")
    return [str(x) for x in data]


def build_model(num_classes: int) -> torch.nn.Module:
    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = torch.nn.Sequential(
        torch.nn.Dropout(0.2),
        torch.nn.Linear(model.classifier[1].in_features, num_classes),
    )
    return model


def decode_base64_image(payload: str) -> Image.Image:
    raw = str(payload or "").strip()
    if raw.startswith("data:") and "," in raw:
        raw = raw.split(",", 1)[1]
    try:
        image_bytes = io.BytesIO(base64.b64decode(raw))
    except Exception as exc:
        raise ValueError("Invalid base64 image payload") from exc

    try:
        return Image.open(image_bytes).convert("RGB")
    except Exception as exc:
        raise ValueError("Unable to decode image") from exc


transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)

CLASS_NAMES: List[str] = []
MODEL: torch.nn.Module | None = None


@app.on_event("startup")
def startup() -> None:
    global CLASS_NAMES, MODEL
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model not found at: {MODEL_PATH}")
    if not os.path.exists(CLASS_NAMES_PATH):
        raise RuntimeError(f"Class names not found at: {CLASS_NAMES_PATH}")

    CLASS_NAMES = load_class_names(CLASS_NAMES_PATH)
    MODEL = build_model(len(CLASS_NAMES))
    state = torch.load(MODEL_PATH, map_location=DEVICE)
    MODEL.load_state_dict(state)
    MODEL.to(DEVICE)
    MODEL.eval()


@app.get("/health")
def health():
    return {"success": True, "message": "Model API is running"}


@app.post("/predict", response_model=list[PredictionItem])
def predict(req: PredictRequest):
    if MODEL is None or not CLASS_NAMES:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        image = decode_base64_image(req.imageBase64)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    x = transform(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        logits = MODEL(x)
        probs = torch.softmax(logits, dim=1)[0]

    topk = min(TOP_K, len(CLASS_NAMES))
    scores, indices = torch.topk(probs, k=topk)
    result = []
    for score, idx in zip(scores.tolist(), indices.tolist()):
        result.append({"label": CLASS_NAMES[idx], "score": float(score)})
    return result
