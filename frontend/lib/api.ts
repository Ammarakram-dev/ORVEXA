const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type MissionPayload = {
  goal: string;
};

export type MissionResponse = {
  id?: string;
  title?: string;
  goal?: string;
  status?: string;
  tasks?: Array<{
    id?: string;
    title?: string;
    status?: string;
  }>;
  plan?: string[];
  message?: string;
};

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `API request failed: ${response.status}`);
  }

  return response.json();
}

export async function previewMission(
  payload: MissionPayload,
): Promise<MissionResponse> {
  return request<MissionResponse>("/api/missions/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createMission(
  payload: MissionPayload,
): Promise<MissionResponse> {
  return request<MissionResponse>("/api/missions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMissions(): Promise<MissionResponse[]> {
  return request<MissionResponse[]>("/api/missions");
}

export async function getHealth() {
  return request<{ status: string }>("/health");
}
