import { getConfig, listTasks } from "./lib/api.js";

const form = document.getElementById("options-form");
const statusEl = document.getElementById("options-status");
const testBtn = document.getElementById("test-btn");

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

async function hydrate() {
  const config = await getConfig();
  document.getElementById("baseUrl").value = config.baseUrl;
  document.getElementById("token").value = config.token;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const baseUrl = document.getElementById("baseUrl").value.trim().replace(/\/$/, "");
  const token = document.getElementById("token").value.trim();
  await chrome.storage.sync.set({ baseUrl, token });
  setStatus("Saved. You can close this tab and use the popup.", "ok");
  chrome.runtime.sendMessage({ type: "REFRESH_BADGE" });
});

testBtn.addEventListener("click", async () => {
  const baseUrl = document.getElementById("baseUrl").value.trim().replace(/\/$/, "");
  const token = document.getElementById("token").value.trim();
  await chrome.storage.sync.set({ baseUrl, token });
  setStatus("Testing…");
  try {
    const data = await listTasks();
    setStatus(`Connected — ${data.pending ?? 0} open tasks.`, "ok");
    chrome.runtime.sendMessage({ type: "REFRESH_BADGE" });
  } catch (error) {
    setStatus(error.message || "Connection failed", "err");
  }
});

hydrate();
