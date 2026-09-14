// Paste the deployed Google Apps Script Web App URL between the quotes.
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwE6KU3ePzBSYmOM6mkZyEAlm0T2xf2ybF4zujRMbJMUgrWXA2RRFpCcTzF-KY6CSPk/exec";
const form = document.getElementById("nameForm");
const nameInput = document.getElementById("name");
const button = document.getElementById("submitButton");
const status = document.getElementById("status");
const nameTrack = document.getElementById("nameTrack");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  status.className = "status";
  if (!name) { status.textContent = "Peyara enter pannunga."; status.classList.add("error"); nameInput.focus(); return; }
  if (GOOGLE_APPS_SCRIPT_URL.includes("PASTE_YOUR")) { status.textContent = "Google Sheet URL-a script.js-la paste pannunga."; status.classList.add("error"); return; }
  button.disabled = true;
  try {
    await fetch(GOOGLE_APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ name }) });
    status.textContent = "Request add aayiduchu!"; status.classList.add("success"); form.reset();
    setTimeout(loadNames, 1500);
  } catch { status.textContent = "Try again pannunga."; status.classList.add("error"); }
  button.disabled = false;
});

function loadNames() {
  if (GOOGLE_APPS_SCRIPT_URL.includes("PASTE_YOUR")) return;
  const callback = "boothamNames";
  window[callback] = (names) => {
    document.getElementById("bootham-jsonp")?.remove();
    const safeNames = Array.isArray(names) ? names.filter(n => typeof n === "string" && n.trim()) : [];
    if (!safeNames.length) { nameTrack.innerHTML = '<p class="loading">First request-a neenga pannunga!</p>'; return; }
    const items = safeNames.map(name => `<div class="name-item">${escapeHtml(name)}</div>`).join("");
    nameTrack.innerHTML = items + items;
    nameTrack.style.setProperty("--scroll-duration", `${Math.max(12, safeNames.length * 3)}s`);
  };
  const script = document.createElement("script");
  script.id = "bootham-jsonp";
  script.src = `${GOOGLE_APPS_SCRIPT_URL}?callback=${callback}&_=${Date.now()}`;
  script.onerror = () => { nameTrack.innerHTML = '<p class="loading">Names load aagala.</p>'; };
  document.head.appendChild(script);
}
function escapeHtml(text) { const el = document.createElement("div"); el.textContent = text; return el.innerHTML; }
loadNames();
setInterval(loadNames, 30000);
