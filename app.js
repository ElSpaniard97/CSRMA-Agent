/* AI Agent Cirrascale - browser-only starter
   - Demo provider (offline)
   - OpenAI-compatible provider via a proxy URL you control (recommended)
*/

const els = {
  messages: document.getElementById("messages"),
  composer: document.getElementById("composer"),
  input: document.getElementById("input"),
  sendBtn: document.getElementById("sendBtn"),
  clearBtn: document.getElementById("clearBtn"),
  providerSelect: document.getElementById("providerSelect"),
  systemPrompt: document.getElementById("systemPrompt"),
  apiBaseUrl: document.getElementById("apiBaseUrl"),
  model: document.getElementById("model"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
  settingsDialog: document.getElementById("settingsDialog"),
  openaiSettings: document.getElementById("openaiSettings"),
  demoSettings: document.getElementById("demoSettings"),
};

const STORAGE_KEYS = {
  messages: "cirrascale.messages.v1",
  settings: "cirrascale.settings.v1",
};

const DEFAULTS = {
  settings: {
    provider: "demo",
    systemPrompt:
      "You are AI Agent Cirrascale. You are a precise, practical assistant focused on IT operations, automation, and clear step-by-step execution. Ask focused questions only when necessary; otherwise, proceed with best-effort assumptions and provide actionable outputs.",
    apiBaseUrl: "",
    model: "gpt-4.1-mini",
  },
};

let state = {
  messages: [],
  settings: loadSettings(),
};

init();

function init() {
  // Load messages
  state.messages = loadMessages();
  if (state.messages.length === 0) {
    addMeta(
      "Initialized. Demo mode is active. Configure an API proxy in Settings to enable real model calls."
    );
    addAssistant(
      "Hello. I am AI Agent Cirrascale. Tell me what you want to build, troubleshoot, or automate."
    );
  } else {
    renderAll();
  }

  // Apply settings to UI
  els.providerSelect.value = state.settings.provider;
  els.systemPrompt.value = state.settings.systemPrompt;
  els.apiBaseUrl.value = state.settings.apiBaseUrl;
  els.model.value = state.settings.model;

  updateProviderUI();

  // Autosize input
  autoResize(els.input);

  // Events
  els.composer.addEventListener("submit", onSubmit);
  els.input.addEventListener("input", () => autoResize(els.input));
  els.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      els.composer.requestSubmit();
    }
  });

  els.clearBtn.addEventListener("click", () => {
    if (!confirm("Clear the conversation? This cannot be undone.")) return;
    state.messages = [];
    saveMessages();
    els.messages.innerHTML = "";
    addMeta("Conversation cleared.");
    addAssistant("Ready when you are. What would you like to do next?");
  });

  els.providerSelect.addEventListener("change", () => {
    state.settings.provider = els.providerSelect.value;
    saveSettings();
    updateProviderUI();
    addMeta(`Provider set to: ${state.settings.provider}`);
  });

  els.saveSettingsBtn.addEventListener("click", () => {
    state.settings.systemPrompt = els.systemPrompt.value.trim();
    state.settings.apiBaseUrl = els.apiBaseUrl.value.trim();
    state.settings.model = els.model.value.trim() || DEFAULTS.settings.model;
    saveSettings();
    updateProviderUI();
    addMeta("Settings saved.");
  });

  els.settingsBtn.addEventListener("click", () => els.settingsDialog.showModal());
}

async function onSubmit(e) {
  e.preventDefault();
  const text = els.input.value.trim();
  if (!text) return;

  els.input.value = "";
  autoResize(els.input);

  addUser(text);

  // Assistant placeholder
  const placeholderId = crypto.randomUUID();
  addAssistant("Working…", { id: placeholderId, transient: true });

  try {
    const reply = await routeToProvider(text);
    replaceAssistant(placeholderId, reply);
  } catch (err) {
    replaceAssistant(
      placeholderId,
      `Error: ${err?.message || String(err)}\n\nIf using OpenAI-compatible mode, confirm your proxy URL and CORS configuration.`
    );
  }
}

function routeToProvider(userText) {
  const provider = state.settings.provider;
  if (provider === "demo") return demoProvider(userText);
  if (provider === "openai_compatible") return openAICompatibleProvider();
  return Promise.resolve("No provider selected.");
}

async function demoProvider(userText) {
  // Deterministic, simple “agent-like” behavior
  const normalized = userText.toLowerCase();

  if (normalized.includes("plan") || normalized.includes("roadmap")) {
    return [
      "Here is a structured execution plan:",
      "1) Define scope: inputs, outputs, and success criteria.",
      "2) Identify integrations: APIs, data sources, auth model.",
      "3) Implement UI: chat, settings, memory, logs.",
      "4) Implement tools: command palette, checklist, templates.",
      "5) Deploy: GitHub Pages, custom domain (optional), monitoring.",
      "",
      "If you tell me the primary use case (ITAM, AWS, helpdesk, etc.), I will tailor the build backlog."
    ].join("\n");
  }

  if (normalized.includes("feature")) {
    return [
      "Candidate features for AI Agent Cirrascale:",
      "- Prompt templates for recurring IT workflows",
      "- Tool calls: generate scripts, checklists, runbooks",
      "- Saved profiles (ITAM / AWS / Helpdesk) with different system prompts",
      "- Export conversation to Markdown",
      "- Knowledge base ingestion (static JSON/MD, client-side search)",
      "",
      "State your target audience and the top 3 tasks the agent must perform."
    ].join("\n");
  }

  return [
    "Demo mode response (offline).",
    `You said: "${userText}"`,
    "",
    "If you want real model responses, switch Provider to OpenAI-Compatible and point it to your serverless proxy."
  ].join("\n");
}

async function openAICompatibleProvider() {
  // OpenAI-compatible Chat Completions style endpoint:
  // POST {baseUrl}/v1/chat/completions
  // Body: { model, messages: [...], temperature }
  //
  // Important: Do NOT put API keys in the browser.
  // Use a proxy that injects secrets server-side and enables CORS.

  const baseUrl = state.settings.apiBaseUrl.replace(/\/$/, "");
  if (!baseUrl) throw new Error("Missing API base URL (proxy).");

  const url = `${baseUrl}/v1/chat/completions`;

  const payload = {
    model: state.settings.model || DEFAULTS.settings.model,
    messages: buildProviderMessages(),
    temperature: 0.2,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await safeReadText(res);
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    null;

  if (!content) throw new Error("Unexpected response shape from provider.");
  return String(content);
}

function buildProviderMessages() {
  // Convert local UI messages into {role, content}
  // Include system prompt at the top.
  const msgs = [];
  const sys = (state.settings.systemPrompt || "").trim();
  if (sys) msgs.push({ role: "system", content: sys });

  for (const m of state.messages) {
    if (m.role === "meta") continue;
    // Avoid sending transient placeholder messages
    if (m.transient) continue;
    msgs.push({ role: m.role, content: m.content });
  }
  return msgs;
}

function addUser(text) {
  state.messages.push({ role: "user", content: text, ts: Date.now() });
  saveMessages();
  renderLast();
}

function addAssistant(text, opts = {}) {
  state.messages.push({
    role: "assistant",
    content: text,
    ts: Date.now(),
    id: opts.id || crypto.randomUUID(),
    transient: !!opts.transient,
  });
  saveMessages();
  renderLast();
}

function replaceAssistant(id, newText) {
  const idx = state.messages.findIndex((m) => m.role === "assistant" && m.id === id);
  if (idx === -1) return;
  state.messages[idx].content = newText;
  state.messages[idx].transient = false;
  saveMessages();
  renderAll();
  scrollToBottom();
}

function addMeta(text) {
  state.messages.push({ role: "meta", content: text, ts: Date.now() });
  saveMessages();
  renderLast();
}

function renderAll() {
  els.messages.innerHTML = "";
  for (const m of state.messages) renderMessage(m);
  scrollToBottom();
}

function renderLast() {
  const m = state.messages[state.messages.length - 1];
  renderMessage(m);
  scrollToBottom();
}

function renderMessage(m) {
  const div = document.createElement("div");
  div.className = `msg ${m.role}`;
  div.textContent = m.content;
  els.messages.appendChild(div);
}

function scrollToBottom() {
  els.messages.scrollTop = els.messages.scrollHeight;
}

function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
}

function updateProviderUI() {
  const p = state.settings.provider;
  els.openaiSettings.style.display = p === "openai_compatible" ? "block" : "none";
  els.demoSettings.style.display = p === "demo" ? "block" : "none";
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.messages);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return [];
  }
}

function saveMessages() {
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(state.messages));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return { ...DEFAULTS.settings };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS.settings, ...parsed };
  } catch {
    return { ...DEFAULTS.settings };
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
}

async function safeReadText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
