from typing import Literal

from pydantic import BaseModel, Field


Priority = Literal[
    "Low",
    "Medium",
    "High",
    "Critical",
]


class MissionCreate(BaseModel):
    goal: str = Field(
        ...,
        min_length=1,
        max_length=2000,
    )

    priority: Priority = "Medium"