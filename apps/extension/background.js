import { createTask, getConfig, listTasks } from "./lib/api.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "taskflow-add-selection",
      title: "Add to TaskFlow: “%s”",
      contexts: ["selection"],
    });
    chrome.contextMenus.create({
      id: "taskflow-add-page",
      title: "Save page as TaskFlow task",
      contexts: ["page", "action"],
    });
  });

  chrome.alarms.create("taskflow-badge", { periodInMinutes: 5 });
  refreshBadge();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId === "taskflow-add-selection" && info.selectionText) {
      const title = info.selectionText.trim().slice(0, 200);
      await createTask({
        title,
        description: "Captured from browser selection",
        priority: "MEDIUM",
        sourceUrl: info.pageUrl || tab?.url || null,
      });
      notify("Task created", title);
      refreshBadge();
      return;
    }

    if (info.menuItemId === "taskflow-add-page") {
      const title = (tab?.title || "Saved page").slice(0, 200);
      await createTask({
        title,
        description: "Saved from browser page",
        priority: "LOW",
        sourceUrl: tab?.url || info.pageUrl || null,
      });
      notify("Page saved", title);
      refreshBadge();
    }
  } catch (error) {
    if (error.code === "NO_TOKEN") {
      notify("Connect TaskFlow", "Open extension Options and paste your token from Settings.");
      chrome.runtime.openOptionsPage();
      return;
    }
    notify("Could not create task", error.message || "Check that TaskFlow is running.");
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "taskflow-badge") refreshBadge();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "REFRESH_BADGE") {
    refreshBadge().then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});

async function refreshBadge() {
  try {
    const { token } = await getConfig();
    if (!token) {
      chrome.action.setBadgeText({ text: "" });
      return;
    }
    const data = await listTasks();
    const pending = Number(data.pending || 0);
    chrome.action.setBadgeBackgroundColor({ color: "#6366F1" });
    chrome.action.setBadgeText({ text: pending > 0 ? String(Math.min(pending, 99)) : "" });
  } catch {
    chrome.action.setBadgeText({ text: "" });
  }
}

function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title,
    message,
    priority: 1,
  });
}
