# SkinSpotCheck ML

The current backend uses `predict_skin_spot(image)` from `ml/inference.py`. It intentionally returns `Unable to analyze` because there is no validated dermatology model in this repository.

The planned replacement path is PyTorch. `ml/pytorch_adapter.py` defines a small loader boundary for a future trained checkpoint while keeping PyTorch out of the backend's default runtime dependencies.

Before enabling any real model:

- Train on a legitimate dermatology dataset with appropriate usage rights.
- Evaluate performance across skin tones, lighting, devices, age groups, and image quality.
- Calibrate confidence scores before exposing them.
- Get clinician review and assess regulatory requirements.
- Keep returning `This is not a diagnosis.` with every result.
