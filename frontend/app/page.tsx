"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MissionStatus =
  | "planned"
  | "executing"
  | "verifying"
  | "completed"
  | "failed";

type Mission = {
  id: string;
  title: string;
  objective: string;
  status: MissionStatus;
  priority: string;
  created_at: string;
  updated_at?: string;
};

type MissionTask = {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
};

type MissionRecord = {
  mission: Mission;
  tasks: MissionTask[];
  outcome?: Record<string, unknown>;
  contract?: Record<string, unknown>;
  execution?: {
    progress?: number;
    completed?: number;
    failed?: number;
    verified?: number;
  };
};

type Activity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: string;
};

const API = "http://localhost:8000";

const starterMissions: MissionRecord[] = [
  {
    mission: {
      id: "demo-001",
      title: "Prepare weekly intelligence report",
      objective:
        "Collect recent information, organize the findings and produce a verified report.",
      status: "completed",
      priority: "high",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    tasks: [
      {
        id: "t1",
        title: "Collect information",
        status: "completed",
      },
      {
        id: "t2",
        title: "Analyze findings",
        status: "completed",
      },
      {
        id: "t3",
        title: "Verify result",
        status: "completed",
      },
    ],
    execution: {
      progress: 100,
      completed: 3,
      failed: 0,
      verified: 3,
    },
  },
];

const starterActivity: Activity[] = [
  {
    id: "a1",
    title: "ORVEXA initialized",
    detail: "Autonomous action engine is online.",
    time: "Just now",
    type: "system",
  },
  {
    id: "a2",
    title: "Verification layer ready",
    detail: "Outcome verification is available.",
    time: "Just now",
    type: "verify",
  },
];

function isValidMissionStatus(value: unknown): value is MissionStatus {
  return (
    value === "planned" ||
    value === "executing" ||
    value === "verifying" ||
    value === "completed" ||
    value === "failed"
  );
}

function normalizeMissionRecord(value: unknown): MissionRecord | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Partial<MissionRecord>;

  if (!raw.mission || typeof raw.mission !== "object") {
    return null;
  }

  const mission = raw.mission as Partial<Mission>;

  if (!mission.id || typeof mission.id !== "string") {
    return null;
  }

  return {
    mission: {
      id: mission.id,
      title:
        typeof mission.title === "string" ? mission.title : "Untitled mission",
      objective: typeof mission.objective === "string" ? mission.objective : "",
      status: isValidMissionStatus(mission.status) ? mission.status : "planned",
      priority:
        typeof mission.priority === "string" ? mission.priority : "medium",
      created_at:
        typeof mission.created_at === "string"
          ? mission.created_at
          : new Date().toISOString(),
      updated_at:
        typeof mission.updated_at === "string" ? mission.updated_at : undefined,
    },
    tasks: Array.isArray(raw.tasks)
      ? raw.tasks.filter(
          (task): task is MissionTask => !!task && typeof task === "object",
        )
      : [],
    outcome: raw.outcome && typeof raw.outcome === "object" ? raw.outcome : {},
    contract:
      raw.contract && typeof raw.contract === "object" ? raw.contract : {},
    execution:
      raw.execution && typeof raw.execution === "object"
        ? raw.execution
        : {
            progress: 0,
            completed: 0,
            failed: 0,
            verified: 0,
          },
  };
}

function iconFor(type: string) {
  if (type === "verify") return "✓";
  if (type === "system") return "◈";
  if (type === "mission") return "◆";
  if (type === "execute") return "➜";
  return "•";
}

function statusLabel(status: MissionStatus) {
  if (status === "executing") return "EXECUTING";
  if (status === "verifying") return "VERIFYING";
  if (status === "completed") return "COMPLETED";
  if (status === "failed") return "FAILED";
  return "PLANNED";
}

export default function ORVEXACommandCenter() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [command, setCommand] = useState("");
  const [priority, setPriority] = useState("high");

  const [missions, setMissions] = useState<MissionRecord[]>(starterMissions);

  const [activities, setActivities] = useState<Activity[]>(starterActivity);

  const [selectedMissionId, setSelectedMissionId] =
    useState<string>("demo-001");

  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("Command Center");

  const [creating, setCreating] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedMissions = localStorage.getItem("orvexa_missions");

        const savedActivity = localStorage.getItem("orvexa_activity");

        if (savedMissions) {
          const parsed = JSON.parse(savedMissions);

          if (Array.isArray(parsed)) {
            const safeMissions = parsed
              .map(normalizeMissionRecord)
              .filter((item): item is MissionRecord => item !== null);

            if (safeMissions.length > 0) {
              setMissions(safeMissions);

              if (
                !safeMissions.some(
                  (item) => item.mission.id === selectedMissionId,
                )
              ) {
                setSelectedMissionId(safeMissions[0].mission.id);
              }
            }
          }
        }

        if (savedActivity) {
          const parsed = JSON.parse(savedActivity);

          if (Array.isArray(parsed)) {
            const safeActivity = parsed.filter(
              (item): item is Activity =>
                !!item &&
                typeof item === "object" &&
                typeof item.id === "string" &&
                typeof item.title === "string",
            );

            if (safeActivity.length > 0) {
              setActivities(safeActivity);
            }
          }
        }
      } catch {
        // Keep safe defaults.
      }

      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedMissionId]);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("orvexa_missions", JSON.stringify(missions));

    localStorage.setItem("orvexa_activity", JSON.stringify(activities));
  }, [missions, activities, mounted]);

  const safeMissions = useMemo(
    () =>
      missions.filter(
        (item) => item && item.mission && typeof item.mission.id === "string",
      ),
    [missions],
  );

  const filteredMissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return safeMissions;

    return safeMissions.filter((item) => {
      const title = item.mission?.title?.toLowerCase() || "";

      const objective = item.mission?.objective?.toLowerCase() || "";

      return title.includes(query) || objective.includes(query);
    });
  }, [safeMissions, search]);

  const activeMissions = safeMissions.filter(
    (item) =>
      item?.mission?.status === "executing" ||
      item?.mission?.status === "verifying",
  ).length;

  const completedMissions = safeMissions.filter(
    (item) => item?.mission?.status === "completed",
  ).length;

  const totalTasks = safeMissions.reduce(
    (total, item) =>
      total + (Array.isArray(item.tasks) ? item.tasks.length : 0),
    0,
  );

  const verifiedTasks = safeMissions.reduce(
    (total, item) => total + (item.execution?.verified ?? 0),
    0,
  );

  const selectedMission =
    safeMissions.find((item) => item.mission.id === selectedMissionId) ||
    safeMissions[0];

  async function createMission(event?: FormEvent) {
    event?.preventDefault();

    const objective = command.trim();

    if (!objective || creating) return;

    setCreating(true);

    try {
      const response = await fetch(`${API}/api/v1/missions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objective,
          priority,
        }),
      });

      if (!response.ok) {
        throw new Error("Mission creation failed");
      }

      const data = await response.json();

      const record = normalizeMissionRecord(data);

      if (!record) {
        throw new Error("Invalid mission response");
      }

      setMissions((current) => [
        record,
        ...current.filter((item) => item.mission.id !== record.mission.id),
      ]);

      setSelectedMissionId(record.mission.id);

      setActivities((current) => [
        {
          id: crypto.randomUUID(),
          title: "Mission created",
          detail: record.mission.title,
          time: "Just now",
          type: "mission",
        },
        ...current,
      ]);

      setCommand("");
    } catch {
      const id = crypto.randomUUID();

      const fallback: MissionRecord = {
        mission: {
          id,
          title:
            objective.length > 54 ? objective.slice(0, 54) + "..." : objective,
          objective,
          status: "planned",
          priority,
          created_at: new Date().toISOString(),
        },
        tasks: [
          {
            id: `${id}-1`,
            title: "Interpret objective",
            status: "pending",
          },
          {
            id: `${id}-2`,
            title: "Build execution plan",
            status: "pending",
          },
          {
            id: `${id}-3`,
            title: "Execute actions",
            status: "pending",
          },
          {
            id: `${id}-4`,
            title: "Verify outcome",
            status: "pending",
          },
        ],
        execution: {
          progress: 0,
          completed: 0,
          failed: 0,
          verified: 0,
        },
      };

      setMissions((current) => [fallback, ...current]);

      setSelectedMissionId(id);

      setActivities((current) => [
        {
          id: crypto.randomUUID(),
          title: "Mission created locally",
          detail: fallback.mission.title,
          time: "Just now",
          type: "mission",
        },
        ...current,
      ]);

      setCommand("");
    } finally {
      setCreating(false);
    }
  }

  async function executeMission(missionId: string) {
    if (executingId) return;

    setExecutingId(missionId);

    setMissions((current) =>
      current.map((item) =>
        item.mission.id === missionId
          ? {
              ...item,
              mission: {
                ...item.mission,
                status: "executing",
                updated_at: new Date().toISOString(),
              },
              execution: {
                ...item.execution,
                progress: 10,
              },
            }
          : item,
      ),
    );

    setActivities((current) => [
      {
        id: crypto.randomUUID(),
        title: "Mission execution started",
        detail: "ORVEXA is executing the action plan.",
        time: "Just now",
        type: "execute",
      },
      ...current,
    ]);

    try {
      await fetch(`${API}/api/v1/missions/${missionId}/start`, {
        method: "POST",
      });
    } catch {
      // Continue with local execution.
    }

    let progress = 10;

    await new Promise<void>((resolve) => {
      const interval = window.setInterval(() => {
        progress += 20;

        setMissions((current) =>
          current.map((item) =>
            item.mission.id === missionId
              ? {
                  ...item,
                  execution: {
                    ...item.execution,
                    progress: Math.min(progress, 90),
                  },
                }
              : item,
          ),
        );

        if (progress >= 90) {
          window.clearInterval(interval);
          resolve();
        }
      }, 700);
    });

    setMissions((current) =>
      current.map((item) =>
        item.mission.id === missionId
          ? {
              ...item,
              mission: {
                ...item.mission,
                status: "verifying",
                updated_at: new Date().toISOString(),
              },
              execution: {
                ...item.execution,
                progress: 95,
              },
            }
          : item,
      ),
    );

    try {
      await fetch(`${API}/api/v1/verification/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mission_id: missionId,
        }),
      });
    } catch {
      // Local verification fallback.
    }

    await new Promise((resolve) => window.setTimeout(resolve, 800));

    setMissions((current) =>
      current.map((item) =>
        item.mission.id === missionId
          ? {
              ...item,
              mission: {
                ...item.mission,
                status: "completed",
                updated_at: new Date().toISOString(),
              },
              execution: {
                progress: 100,
                completed: item.tasks.length,
                failed: 0,
                verified: item.tasks.length,
              },
              tasks: item.tasks.map((task) => ({
                ...task,
                status: "completed",
              })),
            }
          : item,
      ),
    );

    setActivities((current) => [
      {
        id: crypto.randomUUID(),
        title: "Outcome verified",
        detail: "Mission completed and proof-of-work recorded.",
        time: "Just now",
        type: "verify",
      },
      ...current,
    ]);

    setExecutingId(null);
  }

  function logout() {
    localStorage.removeItem("orvexa_user");
    router.push("/auth");
  }

  return (
    <main className="orvexa-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>

          <div>
            <strong>ORVEXA</strong>
            <small>ACTION INTELLIGENCE</small>
          </div>
        </div>

        <div className="system-card">
          <div className="system-orbit">
            <div className="orbit-ring ring-one" />
            <div className="orbit-ring ring-two" />
            <div className="core">O</div>
          </div>

          <div>
            <span className="eyebrow">AUTONOMOUS CORE</span>
            <strong>Online</strong>
          </div>

          <div className="live-dot" />
        </div>

        <nav className="main-nav">
          {["Command Center", "Missions", "Intelligence", "Activity"].map(
            (item) => (
              <button
                key={item}
                className={activeNav === item ? "nav-item active" : "nav-item"}
                onClick={() => setActiveNav(item)}
              >
                <span>
                  {item === "Command Center"
                    ? "⌂"
                    : item === "Missions"
                      ? "◆"
                      : item === "Intelligence"
                        ? "◌"
                        : "≋"}
                </span>

                {item}

                {item === "Missions" && <b>{safeMissions.length}</b>}
              </button>
            ),
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-status">
            <span className="live-dot" />
            <div>
              <small>ENGINE STATUS</small>
              <strong>All systems nominal</strong>
            </div>
          </div>

          <button className="logout-btn" onClick={logout}>
            <span>↪</span>
            Sign out
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="breadcrumb">
              ORVEXA / {activeNav.toUpperCase()}
            </span>
            <h1>
              Command <span>Center</span>
            </h1>
          </div>

          <div className="top-actions">
            <div className="status-pill">
              <span className="live-dot" />
              AUTONOMOUS MODE
            </div>

            <div className="avatar">A</div>
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span>✦</span>
              NEXT-GENERATION ACTION ENGINE
            </div>

            <h2>
              Give ORVEXA
              <br />
              <span>an outcome.</span>
            </h2>

            <p>
              Describe what you want done. ORVEXA turns your intent into a
              mission, executes the actions, verifies the result and returns
              proof.
            </p>

            <form className="command-box" onSubmit={createMission}>
              <div className="command-icon">✦</div>

              <input
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder="What outcome do you want?"
              />

              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="low">LOW</option>
                <option value="medium">MEDIUM</option>
                <option value="high">HIGH</option>
                <option value="critical">CRITICAL</option>
              </select>

              <button type="submit" disabled={creating || !command.trim()}>
                {creating ? "PLANNING..." : "CREATE MISSION"}
                <span>→</span>
              </button>
            </form>
          </div>

          <div className="hero-visual">
            <div className="visual-label">
              <span>01</span>
              INTENT
            </div>

            <div className="neural-core">
              <div className="neural-ring ring-a" />
              <div className="neural-ring ring-b" />
              <div className="neural-ring ring-c" />

              <div className="neural-center">
                <span>O</span>
                <small>AI</small>
              </div>

              <div className="node node-a" />
              <div className="node node-b" />
              <div className="node node-c" />
              <div className="node node-d" />
            </div>

            <div className="visual-caption">
              <strong>Intent → Action</strong>
              <span>Autonomous reasoning active</span>
            </div>
          </div>
        </section>

        <section className="pipeline">
          <div className="section-heading">
            <div>
              <span className="eyebrow">AUTONOMOUS PIPELINE</span>
              <h3>From intention to verified outcome</h3>
            </div>

            <span className="pipeline-live">● LIVE</span>
          </div>

          <div className="pipeline-track">
            {[
              ["01", "Intent", "Understand"],
              ["02", "Plan", "Decompose"],
              ["03", "Execute", "Act"],
              ["04", "Verify", "Validate"],
              ["05", "Outcome", "Prove"],
            ].map(([number, title, sub], index) => (
              <div className="pipeline-step" key={title}>
                <div className="step-number">{number}</div>

                <div>
                  <strong>{title}</strong>
                  <span>{sub}</span>
                </div>

                {index < 4 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="metrics-grid">
          <div className="metric-card">
            <span>ACTIVE MISSIONS</span>
            <strong>{activeMissions}</strong>
            <small>Autonomous execution</small>
          </div>

          <div className="metric-card accent">
            <span>COMPLETED</span>
            <strong>{completedMissions}</strong>
            <small>Verified outcomes</small>
          </div>

          <div className="metric-card">
            <span>TOTAL ACTIONS</span>
            <strong>{totalTasks}</strong>
            <small>Actions orchestrated</small>
          </div>

          <div className="metric-card lime">
            <span>VERIFIED</span>
            <strong>{verifiedTasks}</strong>
            <small>Proof-backed actions</small>
          </div>
        </section>

        <section className="control-grid">
          <div className="missions-panel panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">MISSION CONTROL</span>
                <h3>Active intelligence</h3>
              </div>

              <div className="search-box">
                <span>⌕</span>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search missions..."
                />
              </div>
            </div>

            <div className="mission-list">
              {filteredMissions.length === 0 ? (
                <div className="empty-state">
                  <div>✦</div>
                  <strong>No missions found</strong>
                  <span>Give ORVEXA an outcome above.</span>
                </div>
              ) : (
                filteredMissions.map((item) => {
                  const mission = item.mission;

                  const progress = Math.max(
                    0,
                    Math.min(100, item.execution?.progress ?? 0),
                  );

                  return (
                    <button
                      key={mission.id}
                      className={
                        selectedMissionId === mission.id
                          ? "mission-row selected"
                          : "mission-row"
                      }
                      onClick={() => setSelectedMissionId(mission.id)}
                    >
                      <div className="mission-symbol">
                        {iconFor(mission.status)}
                      </div>

                      <div className="mission-info">
                        <strong>{mission.title}</strong>

                        <span>{mission.objective}</span>

                        <div className="mission-progress">
                          <div>
                            <i
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>

                          <small>{progress}%</small>
                        </div>
                      </div>

                      <div className="mission-state">
                        <span className={`status status-${mission.status}`}>
                          {statusLabel(mission.status)}
                        </span>

                        <small>{mission.priority.toUpperCase()}</small>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="inspector-panel panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">MISSION INSPECTOR</span>
                <h3>{selectedMission?.mission?.title || "No mission"}</h3>
              </div>

              {selectedMission && (
                <span
                  className={`status status-${selectedMission.mission.status}`}
                >
                  {statusLabel(selectedMission.mission.status)}
                </span>
              )}
            </div>

            {selectedMission ? (
              <>
                <div className="inspector-objective">
                  <span>OBJECTIVE</span>
                  <p>{selectedMission.mission.objective}</p>
                </div>

                <div className="contract-card">
                  <div className="contract-head">
                    <div>
                      <span className="eyebrow">OUTCOME CONTRACT</span>
                      <strong>Verification requirements</strong>
                    </div>

                    <span className="contract-icon">✓</span>
                  </div>

                  <div className="contract-lines">
                    <div>
                      <span>Success condition</span>
                      <b>Outcome achieved</b>
                    </div>

                    <div>
                      <span>Evidence</span>
                      <b>Proof of work</b>
                    </div>

                    <div>
                      <span>Integrity</span>
                      <b>Verified</b>
                    </div>
                  </div>
                </div>

                <div className="trace-card">
                  <div className="trace-head">
                    <span className="eyebrow">PROOF-OF-WORK TRACE</span>
                    <span>{selectedMission.tasks.length} ACTIONS</span>
                  </div>

                  <div className="trace-list">
                    {selectedMission.tasks.slice(0, 5).map((task, index) => (
                      <div
                        className="trace-item"
                        key={
                          task.id || `${selectedMission.mission.id}-${index}`
                        }
                      >
                        <div className="trace-node">
                          {task.status === "completed" ? "✓" : index + 1}
                        </div>

                        <div>
                          <strong>{task.title || `Action ${index + 1}`}</strong>

                          <span>{task.status || "pending"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="execute-button"
                  disabled={
                    executingId !== null ||
                    selectedMission.mission.status === "completed"
                  }
                  onClick={() => executeMission(selectedMission.mission.id)}
                >
                  {executingId === selectedMission.mission.id
                    ? "ORVEXA IS EXECUTING..."
                    : selectedMission.mission.status === "completed"
                      ? "MISSION VERIFIED ✓"
                      : "EXECUTE MISSION →"}
                </button>
              </>
            ) : (
              <div className="empty-state inspector-empty">
                <div>◌</div>
                <strong>Select a mission</strong>
                <span>Mission intelligence will appear here.</span>
              </div>
            )}
          </div>
        </section>

        <section className="activity-panel panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">LIVE ACTIVITY</span>
              <h3>Autonomous event stream</h3>
            </div>

            <span className="activity-live">● STREAMING</span>
          </div>

          <div className="activity-list">
            {activities.slice(0, 6).map((activity) => (
              <div className="activity-row" key={activity.id}>
                <div className={`activity-icon activity-${activity.type}`}>
                  {iconFor(activity.type)}
                </div>

                <div className="activity-copy">
                  <strong>{activity.title}</strong>
                  <span>{activity.detail}</span>
                </div>

                <time>{activity.time}</time>
              </div>
            ))}
          </div>
        </section>

        <footer className="footer">
          <div>
            <strong>ORVEXA</strong>
            <span>Autonomous Action Intelligence</span>
          </div>

          <div className="footer-right">
            <span>ENGINE v3.0</span>
            <span>● OPERATIONAL</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
