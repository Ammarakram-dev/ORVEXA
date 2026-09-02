from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class AIResponse:
    content: str
    provider: str
    model: str
    metadata: dict[str, Any]


class AIEngine:
    """
    Provider-independent AI abstraction for ORVEXA.

    The application talks to this interface instead of directly
    depending on a specific AI vendor. A real provider can be
    connected later without changing the mission architecture.
    """

    provider = "unconfigured"
    model = "unconfigured"

    async def generate(
        self,
        prompt: str,
        *,
        system_prompt: str | None = None,
        temperature: float = 0.2,
    ) -> AIResponse:
        prompt = prompt.strip()

        if not prompt:
            raise ValueError("AI prompt cannot be empty.")

        raise RuntimeError(
            "No AI provider is configured. "
            "Connect an approved provider before generating AI output."
        )