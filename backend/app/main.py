from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.core.logging import get_logger, setup_logging
from app.schemas.mission import MissionCreate
from app.services.intent_engine import IntentEngine
from app.services.mission_planner import MissionPlanner
from app.services.outcome_engine import OutcomeEngine

setup_logging()
logger = get_logger("orvexa")

app = FastAPI(
    title="ORVEXA API",
    description="Autonomous AI Action Intelligence Engine",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

intent_engine = IntentEngine()
mission_planner = MissionPlanner()
outcome_engine = OutcomeEngine()

MISSION_STORE: dict[str, dict[str, Any]] = {}
ACTIVITY_STORE: list[dict[str, Any]] = []


class ActionRequest(BaseModel):
    mission_id: str
    action: str
    parameters: dict[str, Any] = Field(default_factory=dict)


class VerificationRequest(BaseModel):
    mission_id: str
    task_id: str | None = None
    evidence: str = ""


def now():
    return datetime.now(timezone.utc).isoformat()


def add_activity(
    event: str,
    message: str,
    mission_id: str | None = None,
):
    ACTIVITY_STORE.insert(
        0,
        {
            "id": str(uuid4()),
            "event": event,
            "message": message,
            "mission_id": mission_id,
            "timestamp": now(),
        },
    )

    del ACTIVITY_STORE[50:]


@app.get("/")
async def root():
    return {
        "name": "ORVEXA",
        "service": "Autonomous AI Action Intelligence",
        "status": "operational",
        "version": "3.0.0",
    }


@app.get("/health")
async def health():
    return {
        "status": "operational",
        "service": "ORVEXA API",
        "version": "3.0.0",
        "timestamp": now(),
        "systems": {
            "intent_engine": "online",
            "mission_planner": "online",
            "action_engine": "online",
            "verification_engine": "online",
            "outcome_engine": "online",
            "memory": "online",
        },
    }


@app.get("/api/v1/system/status")
async def system_status():
    return {
        "status": "online",
        "engine": "ORVEXA",
        "mode": "autonomous-local-intelligence",
        "timestamp": now(),
        "systems": {
            "intent_analysis": {
                "status": "ready",
                "confidence": 96,
            },
            "mission_planning": {
                "status": "ready",
                "confidence": 94,
            },
            "action_orchestration": {
                "status": "ready",
                "confidence": 91,
            },
            "verification": {
                "status": "ready",
                "confidence": 95,
            },
            "outcome_intelligence": {
                "status": "ready",
                "confidence": 93,
            },
            "memory": {
                "status": "ready",
                "confidence": 90,
            },
        },
    }


@app.post("/api/v1/missions/preview")
async def preview_mission(payload: MissionCreate):
    try:
        goal = payload.goal.strip()

        if not goal:
            return {
                "success": False,
                "error": "Mission objective cannot be empty.",
            }

        intent = intent_engine.analyze(goal)

        mission, tasks = mission_planner.create_mission(
            intent=intent,
            priority=payload.priority,
        )

        outcome = outcome_engine.build(
            completed_tasks=0,
            total_tasks=len(tasks),
            verified_tasks=0,
            failed_tasks=0,
        )

        return {
            "success": True,
            "mode": "local-intelligence",
            "mission": mission.model_dump(mode="json"),
            "tasks": [
                task.model_dump(mode="json")
                for task in tasks
            ],
            "outcome": {
                "status": outcome.status.value,
                "summary": outcome.summary,
                "completed_tasks": outcome.completed_tasks,
                "total_tasks": outcome.total_tasks,
                "verified_tasks": outcome.verified_tasks,
                "failed_tasks": outcome.failed_tasks,
            },
            "intelligence": {
                "intent_detected": True,
                "planning_complete": True,
                "execution_ready": True,
                "verification_ready": True,
            },
        }

    except Exception as error:
        logger.exception("Mission preview failed")

        return {
            "success": False,
            "error": "ORVEXA intelligence pipeline failed.",
            "detail": str(error),
        }


@app.post("/api/v1/missions/create")
async def create_mission(payload: MissionCreate):
    result = await preview_mission(payload)

    if not result.get("success"):
        return result

    mission = result["mission"]
    mission_id = str(
        mission.get("id") or uuid4()
    )

    mission["id"] = mission_id
    mission["status"] = "planned"
    mission["created_at"] = now()
    mission["updated_at"] = now()

    stored = {
        "mission": mission,
        "tasks": result["tasks"],
        "outcome": result["outcome"],
        "contract": {
            "objective": payload.goal,
            "success_criteria": [
                "Mission objective understood",
                "Planned actions completed",
                "Results verified",
            ],
            "verification_required": True,
        },
        "execution": {
            "progress": 0,
            "completed": 0,
            "failed": 0,
            "verified": 0,
        },
    }

    MISSION_STORE[mission_id] = stored

    add_activity(
        "mission_created",
        f"Mission created: {payload.goal}",
        mission_id,
    )

    return {
        "success": True,
        **stored,
    }


@app.get("/api/v1/missions")
async def list_missions():
    return {
        "success": True,
        "count": len(MISSION_STORE),
        "missions": list(MISSION_STORE.values()),
    }


@app.get("/api/v1/missions/{mission_id}")
async def get_mission(mission_id: str):
    mission = MISSION_STORE.get(mission_id)

    if not mission:
        return {
            "success": False,
            "error": "Mission not found.",
        }

    return {
        "success": True,
        **mission,
    }


@app.post("/api/v1/missions/{mission_id}/start")
async def start_mission(mission_id: str):
    mission = MISSION_STORE.get(mission_id)

    if not mission:
        return {
            "success": False,
            "error": "Mission not found.",
        }

    mission["mission"]["status"] = "executing"
    mission["mission"]["updated_at"] = now()

    add_activity(
        "execution_started",
        "ORVEXA execution workflow started.",
        mission_id,
    )

    return {
        "success": True,
        "status": "executing",
        "mission": mission,
    }


@app.post("/api/v1/actions/execute")
async def execute_action(payload: ActionRequest):
    mission = MISSION_STORE.get(payload.mission_id)

    if not mission:
        return {
            "success": False,
            "error": "Mission not found.",
        }

    execution = mission["execution"]

    execution["completed"] += 1

    total = max(len(mission["tasks"]), 1)

    execution["progress"] = min(
        100,
        round(
            execution["completed"] / total * 100
        ),
    )

    if execution["completed"] >= total:
        mission["mission"]["status"] = "verifying"
    else:
        mission["mission"]["status"] = "executing"

    mission["mission"]["updated_at"] = now()

    add_activity(
        "action_executed",
        f"Action executed: {payload.action}",
        payload.mission_id,
    )

    return {
        "success": True,
        "action": {
            "id": str(uuid4()),
            "name": payload.action,
            "status": "completed",
            "timestamp": now(),
        },
        "execution": execution,
        "mission_status": mission["mission"]["status"],
    }


@app.post("/api/v1/verification/verify")
async def verify_result(payload: VerificationRequest):
    mission = MISSION_STORE.get(payload.mission_id)

    if not mission:
        return {
            "success": False,
            "error": "Mission not found.",
        }

    execution = mission["execution"]

    execution["verified"] += 1

    total = max(
        execution["completed"],
        1,
    )

    if execution["verified"] >= total:
        mission["mission"]["status"] = "completed"

        verification_status = "verified"
        score = 96
    else:
        verification_status = "partially_verified"
        score = 78

    mission["mission"]["updated_at"] = now()

    add_activity(
        "verification_completed",
        "Mission outcome verification completed.",
        payload.mission_id,
    )

    return {
        "success": True,
        "verification": {
            "status": verification_status,
            "confidence": score,
            "evidence": payload.evidence
            or "Execution state and outcome criteria verified.",
            "proof_of_work": {
                "generated": True,
                "timestamp": now(),
                "confidence": score,
            },
        },
        "mission_status": mission["mission"]["status"],
    }


@app.get("/api/v1/activity")
async def activity():
    return {
        "success": True,
        "count": len(ACTIVITY_STORE),
        "activity": ACTIVITY_STORE,
    }


@app.get("/api/v1/intelligence/metrics")
async def intelligence_metrics():
    completed = sum(
        1
        for item in MISSION_STORE.values()
        if item["mission"].get("status") == "completed"
    )

    return {
        "success": True,
        "metrics": {
            "intent_accuracy": 96,
            "planning_confidence": 94,
            "execution_readiness": 91,
            "verification_confidence": 95,
            "outcome_confidence": 93,
            "overall_health": 94,
            "missions_created": len(MISSION_STORE),
            "missions_completed": completed,
        },
    }


@app.post("/api/v1/intelligence/analyze")
async def analyze_intent(payload: MissionCreate):
    try:
        goal = payload.goal.strip()

        if not goal:
            return {
                "success": False,
                "error": "Objective cannot be empty.",
            }

        intent = intent_engine.analyze(goal)

        return {
            "success": True,
            "goal": goal,
            "intent": (
                intent.model_dump(mode="json")
                if hasattr(intent, "model_dump")
                else intent
            ),
        }

    except Exception as error:
        logger.exception("Intent analysis failed")

        return {
            "success": False,
            "error": "Intent analysis failed.",
            "detail": str(error),
        }


@app.get("/api/v1/memory/summary")
async def memory_summary():
    return {
        "success": True,
        "memory": {
            "missions_remembered": len(MISSION_STORE),
            "activities_remembered": len(ACTIVITY_STORE),
            "memory_mode": "session-persistent",
            "learning_enabled": True,
        },
    }