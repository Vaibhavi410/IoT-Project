# Plant Model API (Daksh159/plant-disease-mobilenetv2)

This service exposes the `mobilenetv2_plant.pth` model through a simple HTTP API for your Node backend.

## Expected files

Place both files under `plant-model-api/models/`:

- `mobilenetv2_plant.pth`
- `class_names.json`

## Local run

```bash
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

## API

- `GET /health`
- `POST /predict`

Request body:

```json
{
  "imageBase64": "..."
}
```

Response:

```json
[
  { "label": "Tomato___Late_blight", "score": 0.87 },
  { "label": "Tomato___Early_blight", "score": 0.09 },
  { "label": "Tomato___healthy", "score": 0.04 }
]
```

## Render service settings

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

Optional env vars:

- `MODEL_PATH` (default: `models/mobilenetv2_plant.pth`)
- `CLASS_NAMES_PATH` (default: `models/class_names.json`)
- `TOP_K` (default: `3`)
