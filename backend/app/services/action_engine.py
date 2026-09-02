from dataclasses import dataclass
from enum import Enum


class ActionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass(frozen=True)
class ActionResult:
    status: ActionStatus
    message: str
    output: dict


class ActionEngine:
    """
    Controlled execution layer for ORVEXA.

    Actions are intentionally explicit and isolated from planning.
    Future integrations will be registered as safe, validated tools.
    """

    async def execute(
        self,
        action_name: str,
        parameters: dict | None = None,
    ) -> ActionResult:
        parameters = parameters or {}

        if not action_name.strip():
            return ActionResult(
                status=ActionStatus.FAILED,
                message="Action name cannot be empty.",
                output={},
            )

        handler = getattr(self, f"_action_{action_name}", None)

        if handler is None:
            return ActionResult(
                status=ActionStatus.FAILED,
                message=f"Unsupported action: {action_name}",
                output={},
            )

        try:
            return await handler(parameters)
        except Exception as exc:
            return ActionResult(
                status=ActionStatus.FAILED,
                message="Action execution failed.",
                output={"error": str(exc)},
            )

    async def _action_echo(self, parameters: dict) -> ActionResult:
        """
        Safe development action used to verify the execution pipeline.
        """

        message = str(parameters.get("message", "")).strip()

        if not message:
            return ActionResult(
                status=ActionStatus.FAILED,
                message="The echo action requires a message.",
                output={},
            )

        return ActionResult(
            status=ActionStatus.COMPLETED,
            message="Action completed successfully.",
            output={"message": message},
        )