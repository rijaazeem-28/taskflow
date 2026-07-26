const DEFAULT_BASE = "http://localhost:3000";

export async function getConfig() {
  const data = await chrome.storage.sync.get({
    baseUrl: DEFAULT_BASE,
    token: "",
  });
  return {
    baseUrl: String(data.baseUrl || DEFAULT_BASE).replace(/\/$/, ""),
    token: String(data.token || "").trim(),
  };
}

export async function apiRequest(path, options = {}) {
  const { baseUrl, token } = await getConfig();
  if (!token) {
    const err = new Error("NO_TOKEN");
    err.code = "NO_TOKEN";
    throw err;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-TaskFlow-Token": token,
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function createTask({ title, description, priority, sourceUrl }) {
  return apiRequest("/api/extension/tasks", {
    method: "POST",
    body: JSON.stringify({ title, description, priority, sourceUrl }),
  });
}

export async function listTasks() {
  return apiRequest("/api/extension/tasks", { method: "GET" });
}
