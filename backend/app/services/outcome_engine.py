from dataclasses import dataclass
from enum import Enum


class OutcomeStatus(str, Enum):
    COMPLETED = "completed"
    PARTIAL = "partial"
    FAILED = "failed"
    NEEDS_REVIEW = "needs_review"


@dataclass(frozen=True)
class Outcome:
    status: OutcomeStatus
    summary: str
    completed_tasks: int
    total_tasks: int
    verified_tasks: int
    failed_tasks: int


class OutcomeEngine:
    """
    Converts task and verification states into a user-facing outcome.
    """

    def build(
        self,
        completed_tasks: int,
        total_tasks: int,
        verified_tasks: int,
        failed_tasks: int,
    ) -> Outcome:
        if total_tasks <= 0:
            return Outcome(
                status=OutcomeStatus.NEEDS_REVIEW,
                summary="The mission has no executable tasks yet.",
                completed_tasks=0,
                total_tasks=0,
                verified_tasks=0,
                failed_tasks=0,
            )

        if failed_tasks > 0 and completed_tasks == 0:
            status = OutcomeStatus.FAILED
            summary = "The mission could not complete its required actions."

        elif verified_tasks == total_tasks:
            status = OutcomeStatus.COMPLETED
            summary = "The mission completed successfully and all tasks were verified."

        elif completed_tasks > 0:
            status = OutcomeStatus.PARTIAL
            summary = "The mission made progress, but some tasks still require attention."

        else:
            status = OutcomeStatus.NEEDS_REVIEW
            summary = "The mission requires additional review before an outcome can be confirmed."

        return Outcome(
            status=status,
            summary=summary,
            completed_tasks=completed_tasks,
            total_tasks=total_tasks,
            verified_tasks=verified_tasks,
            failed_tasks=failed_tasks,
        )