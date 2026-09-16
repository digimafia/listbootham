const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwE6KU3ePzBSYmOM6mkZyEAlm0T2xf2ybF4zujRMbJMUgrWXA2RRFpCcTzF-KY6CSPk/exec";

const addForm = document.getElementById("addForm");
const newName = document.getElementById("newName");
const addButton = document.getElementById("addButton");
const adminStatus = document.getElementById("adminStatus");
const refreshButton = document.getElementById("refreshButton");
const nameTableBody = document.getElementById("nameTableBody");
const totalCount = document.getElementById("totalCount");
const editDialog = document.getElementById("editDialog");
const editForm = document.getElementById("editForm");
const editIndex = document.getElementById("editIndex");
const editName = document.getElementById("editName");
const cancelEdit = document.getElementById("cancelEdit");

let names = [];

function setStatus(message, type = "") {
  adminStatus.textContent = message;
  adminStatus.className = `status ${type}`.trim();
}

async function request(payload) {
  const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const text = await response.text();
  try { return text ? JSON.parse(text) : { ok: true }; }
  catch { return { ok: true, raw: text }; }
}

async function loadNames() {
  nameTableBody.innerHTML = '<tr><td colspan="3" class="empty">Loading names...</td></tr>';
  try {
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=list&_=${Date.now()}`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const data = await response.json();
    names = Array.isArray(data) ? data : Array.isArray(data.names) ? data.names : [];
    names = names.filter((item) => typeof item === "string" && item.trim());
    renderNames();
  } catch (error) {
    nameTableBody.innerHTML = '<tr><td colspan="3" class="empty">Names load aagala. Apps Script list action check pannunga.</td></tr>';
    setStatus("Name list load panna mudiyala.", "error");
  }
}

function renderNames() {
  totalCount.textContent = names.length;
  if (!names.length) {
    nameTableBody.innerHTML = '<tr><td colspan="3" class="empty">No names found.</td></tr>';
    return;
  }
  nameTableBody.innerHTML = names.map((name, index) => `
    <tr>
      <td>${index + 1}</td>
      <td class="name-cell">${escapeHtml(name)}</td>
      <td>
        <div class="actions">
          <button class="edit-btn" type="button" data-action="edit" data-index="${index}">Edit</button>
          <button class="delete-btn" type="button" data-action="delete" data-index="${index}">Delete</button>
        </div>
      </td>
    </tr>`).join("");
}

addForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = newName.value.trim();
  if (!name) return;
  addButton.disabled = true;
  setStatus("Adding...");
  try {
    await request({ action: "add", name });
    newName.value = "";
    setStatus("Name add aayiduchu.", "success");
    await loadNames();
  } catch {
    setStatus("Add panna mudiyala. Apps Script action support check pannunga.", "error");
  } finally {
    addButton.disabled = false;
  }
});

nameTableBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const index = Number(button.dataset.index);
  const currentName = names[index];
  if (button.dataset.action === "edit") {
    editIndex.value = index;
    editName.value = currentName;
    editDialog.showModal();
    editName.focus();
    editName.select();
    return;
  }
  if (button.dataset.action === "delete") {
    const confirmed = window.confirm(`Delete "${currentName}"?`);
    if (!confirmed) return;
    button.disabled = true;
    setStatus("Deleting...");
    try {
      await request({ action: "delete", index, name: currentName });
      setStatus("Name delete aayiduchu.", "success");
      await loadNames();
    } catch {
      setStatus("Delete panna mudiyala. Apps Script action support check pannunga.", "error");
      button.disabled = false;
    }
  }
});

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const index = Number(editIndex.value);
  const oldName = names[index];
  const name = editName.value.trim();
  if (!name) return;
  setStatus("Updating...");
  try {
    await request({ action: "update", index, oldName, name });
    editDialog.close();
    setStatus("Name update aayiduchu.", "success");
    await loadNames();
  } catch {
    setStatus("Update panna mudiyala. Apps Script action support check pannunga.", "error");
  }
});

cancelEdit.addEventListener("click", () => editDialog.close());
refreshButton.addEventListener("click", loadNames);

function escapeHtml(text) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}

loadNames();
