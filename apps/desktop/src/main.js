const STORAGE_KEY = "taskflow.desktop.tasks";
const WEB_URL = "http://localhost:3000";

const form = document.getElementById("form");
const titleInput = document.getElementById("title");
const listEl = document.getElementById("list");
const statsEl = document.getElementById("stats");
const openWebBtn = document.getElementById("open-web");

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  const tasks = loadTasks();
  const open = tasks.filter((t) => !t.done).length;
  statsEl.textContent = `${open} open · ${tasks.length} total`;

  if (!tasks.length) {
    listEl.innerHTML = `<li class="empty">No tasks yet. Add one above.</li>`;
    return;
  }

  listEl.innerHTML = tasks
    .map(
      (task) => `
      <li class="item" data-id="${task.id}">
        <div class="item-main" data-action="toggle">
          <span class="check ${task.done ? "on" : ""}">${task.done ? "✓" : ""}</span>
          <span class="title ${task.done ? "done" : ""}">${escapeHtml(task.title)}</span>
        </div>
        <button type="button" data-action="delete">Delete</button>
      </li>`
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  const tasks = loadTasks();
  tasks.unshift({
    id: String(Date.now()),
    title,
    done: false,
    createdAt: new Date().toISOString(),
  });
  saveTasks(tasks);
  titleInput.value = "";
  render();
});

listEl.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  const item = event.target.closest(".item");
  if (!target || !item) return;
  const id = item.dataset.id;
  const tasks = loadTasks();
  if (target.dataset.action === "toggle") {
    saveTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }
  if (target.dataset.action === "delete") {
    saveTasks(tasks.filter((t) => t.id !== id));
  }
  render();
});

openWebBtn.addEventListener("click", async () => {
  try {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(WEB_URL);
  } catch {
    window.open(WEB_URL, "_blank");
  }
});

render();
