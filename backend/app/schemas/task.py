from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    PENDING = "pending"
    READY = "ready"
    RUNNING = "running"
    VERIFYING = "verifying"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


class TaskType(str, Enum):
    ANALYSIS = "analysis"
    RESEARCH = "research"
    GENERATION = "generation"
    ACTION = "action"
    VERIFICATION = "verification"


class Task(BaseModel):
    id: str
    mission_id: str
    title: str
    description: str
    task_type: TaskType
    status: TaskStatus = TaskStatus.PENDING
    priority: int = Field(default=3, ge=1, le=5)
    dependencies: list[str] = Field(default_factory=list)
    result: str | None = None
    verification: str | None = None
    created_at: datetime
    updated_at: datetime