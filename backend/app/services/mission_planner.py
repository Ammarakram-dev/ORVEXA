from datetime import datetime, timezone
from uuid import uuid4

from app.schemas.mission import Mission, MissionPriority, MissionStatus
from app.schemas.task import Task, TaskStatus, TaskType
from app.services.intent_engine import Intent


class MissionPlanner:
    """
    Converts an analyzed intent into a structured mission plan.

    This deterministic planner is the foundation for the future
    AI-powered planning layer.
    """

    def create_mission(
        self,
        intent: Intent,
        priority: MissionPriority = MissionPriority.MEDIUM,
    ) -> tuple[Mission, list[Task]]:
        now = datetime.now(timezone.utc)
        mission_id = str(uuid4())

        mission = Mission(
            id=mission_id,
            goal=intent.goal,
            title=self._create_title(intent.objective),
            status=MissionStatus.READY,
            priority=priority,
            created_at=now,
            updated_at=now,
            progress=0,
        )

        tasks = self._create_initial_tasks(mission_id, intent, now)

        return mission, tasks

    @staticmethod
    def _create_title(objective: str) -> str:
        words = objective.split()
        title = " ".join(words[:8])

        if len(words) > 8:
            title += "..."

        return title

    @staticmethod
    def _create_initial_tasks(
        mission_id: str,
        intent: Intent,
        now: datetime,
    ) -> list[Task]:
        tasks: list[Task] = []

        analysis_id = str(uuid4())
        planning_id = str(uuid4())
        execution_id = str(uuid4())
        verification_id = str(uuid4())

        tasks.append(
            Task(
                id=analysis_id,
                mission_id=mission_id,
                title="Analyze objective",
                description=f"Understand the requirements of: {intent.objective}",
                task_type=TaskType.ANALYSIS,
                status=TaskStatus.READY,
                priority=5,
                dependencies=[],
                created_at=now,
                updated_at=now,
            )
        )

        tasks.append(
            Task(
                id=planning_id,
                mission_id=mission_id,
                title="Create execution plan",
                description="Determine the actions and sequence required to achieve the objective.",
                task_type=TaskType.RESEARCH,
                status=TaskStatus.PENDING,
                priority=4,
                dependencies=[analysis_id],
                created_at=now,
                updated_at=now,
            )
        )

        if intent.requires_execution:
            tasks.append(
                Task(
                    id=execution_id,
                    mission_id=mission_id,
                    title="Execute planned actions",
                    description="Execute supported actions required by the mission.",
                    task_type=TaskType.ACTION,
                    status=TaskStatus.PENDING,
                    priority=4,
                    dependencies=[planning_id],
                    created_at=now,
                    updated_at=now,
                )
            )

        if intent.requires_verification:
            execution_dependencies = [execution_id] if intent.requires_execution else [planning_id]

            tasks.append(
                Task(
                    id=verification_id,
                    mission_id=mission_id,
                    title="Verify outcome",
                    description="Evaluate whether the expected mission outcome was achieved.",
                    task_type=TaskType.VERIFICATION,
                    status=TaskStatus.PENDING,
                    priority=5,
                    dependencies=execution_dependencies,
                    created_at=now,
                    updated_at=now,
                )
            )

        return tasks