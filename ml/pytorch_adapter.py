from pathlib import Path
from typing import BinaryIO, Protocol

from ml.inference import SkinSpotPrediction


class SkinSpotModel(Protocol):
    def predict(self, image: BinaryIO) -> SkinSpotPrediction:
        """Return a validated risk-screening prediction for a skin spot image."""


def load_pytorch_model(model_path: str | Path) -> SkinSpotModel:
    """Placeholder for a future PyTorch model loader.

    TODO: Load a validated PyTorch checkpoint only after training, calibration,
    bias evaluation, clinician review, and regulatory assessment are complete.
    """
    try:
        import torch  # noqa: F401
    except ImportError as exc:
        raise RuntimeError(
            "PyTorch is not installed. Install ML training dependencies before loading a model."
        ) from exc

    raise NotImplementedError(
        f"No validated SkinSpotCheck PyTorch model is available at {model_path}."
    )
