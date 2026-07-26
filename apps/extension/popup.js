import { createTask, getConfig, listTasks } from "./lib/api.js";

const setupEl = document.getElementById("setup");
const mainEl = document.getElementById("main");
const form = document.getElementById("create-form");
const statusEl = document.getElementById("form-status");
const listEl = document.getElementById("task-list");
const pendingEl = document.getElementById("pending-line");
const refreshBtn = document.getElementById("refresh-btn");
const openApp = document.getElementById("open-app");
const submitBtn = document.getElementById("submit-btn");

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

function priorityClass(priority) {
  if (priority === "URGENT") return "urgent";
  if (priority === "HIGH") return "high";
  return "";
}

function renderTasks(tasks) {
  if (!tasks?.length) {
    listEl.innerHTML = `<li class="muted">No tasks yet — add one above.</li>`;
    return;
  }

  listEl.innerHTML = tasks
    .map(
      (task) => `
      <li>
        <strong>${escapeHtml(task.title)}</strong>
        <div class="meta">
          <span class="pill ${priorityClass(task.priority)}">${escapeHtml(task.priority)}</span>
          <span>${escapeHtml(task.status)}</span>
        </div>
      </li>`
    )
    .join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function load() {
  const { baseUrl, token } = await getConfig();
  openApp.href = `${baseUrl}/dashboard`;

  if (!token) {
    setupEl.classList.remove("hidden");
    mainEl.classList.add("hidden");
    return;
  }

  setupEl.classList.add("hidden");
  mainEl.classList.remove("hidden");
  await refresh();
}

async function refresh() {
  try {
    const data = await listTasks();
    pendingEl.textContent = `${data.pending ?? 0} open task${data.pending === 1 ? "" : "s"}`;
    renderTasks(data.tasks || []);
    chrome.runtime.sendMessage({ type: "REFRESH_BADGE" });
  } catch (error) {
    if (error.code === "NO_TOKEN") {
      setupEl.classList.remove("hidden");
      mainEl.classList.add("hidden");
      return;
    }
    pendingEl.textContent = error.message || "Could not load tasks";
    listEl.innerHTML = `<li class="muted">Is TaskFlow running at your configured URL?</li>`;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const priority = document.getElementById("priority").value;

  if (!title) return;

  submitBtn.disabled = true;
  setStatus("Saving…");

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const sourceUrl = tabs[0]?.url?.startsWith("http") ? tabs[0].url : null;
    await createTask({ title, description: description || null, priority, sourceUrl });
    form.reset();
    document.getElementById("priority").value = "MEDIUM";
    setStatus("Task added to TaskFlow", "ok");
    await refresh();
  } catch (error) {
    setStatus(error.message || "Failed to create task", "err");
  } finally {
    submitBtn.disabled = false;
  }
});

refreshBtn.addEventListener("click", () => {
  setStatus("");
  refresh();
});

function openOptions() {
  chrome.runtime.openOptionsPage();
}

document.getElementById("open-options").addEventListener("click", openOptions);
document.getElementById("open-options-2").addEventListener("click", openOptions);

load();
