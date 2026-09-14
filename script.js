// Paste your deployed Google Apps Script Web App URL between the quotes.
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwE6KU3ePzBSYmOM6mkZyEAlm0T2xf2ybF4zujRMbJMUgrWXA2RRFpCcTzF-KY6CSPk/exec";
const form = document.getElementById("nameForm");
const nameInput = document.getElementById("name");
const button = document.getElementById("submitButton");
const status = document.getElementById("status");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  status.className = "status";
  if (!name) { status.textContent = "Please enter your name."; status.classList.add("error"); nameInput.focus(); return; }
  if (GOOGLE_APPS_SCRIPT_URL.includes("PASTE_YOUR")) { status.textContent = "Setup needed: add your Google Web App URL in script.js."; status.classList.add("error"); return; }
  button.disabled = true;
  try {
    await fetch(GOOGLE_APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ name }) });
    status.textContent = "You’re on the roll call. Welcome, " + name + "!"; status.classList.add("success"); form.reset();
  } catch (error) { status.textContent = "Something went wrong. Please try again."; status.classList.add("error"); }
  button.disabled = false;
});
