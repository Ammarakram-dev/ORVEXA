from dataclasses import dataclass


@dataclass(frozen=True)
class Intent:
    goal: str
    objective: str
    requires_execution: bool
    requires_verification: bool


class IntentEngine:
    """
    Converts a raw user goal into a normalized execution intent.

    The first layer intentionally remains deterministic.
    The AI reasoning layer will be connected later so that
    intelligence is separated from the core application logic.
    """

    def analyze(self, goal: str) -> Intent:
        normalized_goal = goal.strip()

        if not normalized_goal:
            raise ValueError("Goal cannot be empty.")

        return Intent(
            goal=normalized_goal,
            objective=normalized_goal,
            requires_execution=True,
            requires_verification=True,
        )