(() => {
  const toast = document.getElementById("toast");
  const themeToggle = document.getElementById("themeToggle");
  const copyBtn = document.getElementById("copyAgentLink");

  const AGENT_URL =
    "https://chatgpt.com/g/g-69441b1b5d0c81918300df5e63b0e079-ai-infrastructure-troubleshooting-agent";

  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light") document.documentElement.setAttribute("data-theme", "light");

  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 1400);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      if (isLight) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "dark");
        showToast("Theme: Dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
        showToast("Theme: Light");
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const ok = await copyText(AGENT_URL);
      showToast(ok ? "Link copied." : "Copy failed.");
    });
  }

  // Prompt copy buttons exist on prompts.html; harmless elsewhere
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy") || "";
      if (!text) return showToast("Nothing to copy.");
      const ok = await copyText(text);
      showToast(ok ? "Prompt copied." : "Copy failed.");
    });
  });
})();
