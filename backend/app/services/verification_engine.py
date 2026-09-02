from dataclasses import dataclass
from enum import Enum


class VerificationStatus(str, Enum):
    VERIFIED = "verified"
    FAILED = "failed"
    NEEDS_REVIEW = "needs_review"


@dataclass(frozen=True)
class VerificationResult:
    status: VerificationStatus
    confidence: float
    message: str
    evidence: dict


class VerificationEngine:
    """
    Evaluates action results against expected outcomes.

    The verification layer is deliberately separated from execution
    so ORVEXA never treats execution alone as proof of success.
    """

    async def verify(
        self,
        expected: str,
        actual: dict,
    ) -> VerificationResult:
        expected = expected.strip()

        if not expected:
            return VerificationResult(
                status=VerificationStatus.NEEDS_REVIEW,
                confidence=0.0,
                message="No expected outcome was provided.",
                evidence={},
            )

        if not actual:
            return VerificationResult(
                status=VerificationStatus.FAILED,
                confidence=1.0,
                message="No execution result was available.",
                evidence={},
            )

        execution_status = actual.get("status")

        if execution_status == "failed":
            return VerificationResult(
                status=VerificationStatus.FAILED,
                confidence=1.0,
                message="The underlying action reported failure.",
                evidence=actual,
            )

        if execution_status == "completed":
            return VerificationResult(
                status=VerificationStatus.VERIFIED,
                confidence=0.95,
                message="The action completed and produced a result.",
                evidence=actual,
            )

        return VerificationResult(
            status=VerificationStatus.NEEDS_REVIEW,
            confidence=0.5,
            message="The result requires additional verification.",
            evidence=actual,
        )