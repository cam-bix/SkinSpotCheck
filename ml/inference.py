from dataclasses import dataclass
from typing import BinaryIO


@dataclass(frozen=True)
class SkinSpotPrediction:
    result: str
    confidence: float | None
    model_version: str


def predict_skin_spot(image: BinaryIO) -> SkinSpotPrediction:
    """Placeholder inference interface.

    TODO: Replace with a validated model trained on a legitimate dermatology dataset.
    This function intentionally avoids claiming medical accuracy.
    """
    image.seek(0)
    return SkinSpotPrediction(
        result="Unable to analyze",
        confidence=None,
        model_version="placeholder-v0",
    )
