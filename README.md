# Mobile Bootham — Google Sheet + Admin setup

## 1. Sheet structure

Google Sheet first tab-la:

- `A1` = `Name`
- `B1` = `Timestamp`

Existing names/data same-a keep pannalaam.

## 2. Apps Script — CRUD enabled

Google Sheet-la **Extensions → Apps Script** open pannunga. Existing code-a replace panni கீழே இருக்குற complete code paste pannunga.

This keeps the existing public website compatible and adds admin actions for **add / update / delete / list**.

```javascript
function getSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getNames_() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return [];

  return sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getDisplayValues()
    .flat()
    .map(String)
    .map(name => name.trim())
    .filter(Boolean);
}

function doGet(e) {
  const names = getNames_();
  const callback = String((e && e.parameter && e.parameter.callback) || "");

  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(names)})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return json_(names);
}

function doPost(e) {
  const sheet = getSheet_();

  let data = {};
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (error) {
    return json_({ ok: false, error: "Invalid JSON" });
  }

  // Backward compatibility: old public form sends only { name }.
  const action = String(data.action || "add").toLowerCase();

  if (action === "add") {
    const name = String(data.name || "").trim();

    if (!name) {
      return json_({ ok: false, error: "Missing name" });
    }

    sheet.appendRow([name, new Date()]);
    return json_({ ok: true, action: "add", name: name });
  }

  if (action === "update") {
    const index = Number(data.index);
    const name = String(data.name || "").trim();

    if (!Number.isInteger(index) || index < 0 || !name) {
      return json_({ ok: false, error: "Invalid update request" });
    }

    const row = index + 2;

    if (row > sheet.getLastRow()) {
      return json_({ ok: false, error: "Row not found" });
    }

    sheet.getRange(row, 1).setValue(name);
    return json_({ ok: true, action: "update", index: index, name: name });
  }

  if (action === "delete") {
    const index = Number(data.index);

    if (!Number.isInteger(index) || index < 0) {
      return json_({ ok: false, error: "Invalid delete request" });
    }

    const row = index + 2;

    if (row > sheet.getLastRow()) {
      return json_({ ok: false, error: "Row not found" });
    }

    sheet.deleteRow(row);
    return json_({ ok: true, action: "delete", index: index });
  }

  return json_({ ok: false, error: "Unknown action" });
}
```

## 3. Redeploy Apps Script

After changing the Apps Script:

1. Click **Save**.
2. Go to **Deploy → Manage deployments**.
3. Open the existing Web App deployment.
4. Click **Edit**.
5. Select **New version**.
6. Keep **Execute as: Me**.
7. Keep **Who has access: Anyone**.
8. Click **Deploy**.

If you edit the existing deployment, the Web App URL normally stays the same, so `script.js` and `admin.js` do not need a new URL.

## 4. Website pages

### Public page

`index.html`

Users can submit a name and view the scrolling list.

### Admin page

`admin.html`

Admin features:

- View all requested names
- Add a new name
- Edit a name
- Delete a name
- Refresh list
- Total name count

## 5. GitHub Pages

GitHub Pages should publish from:

- Branch: `main`
- Folder: `/ (root)`

Then the admin page will be available at your GitHub Pages site followed by:

`/admin.html`

## Security note

The current Google Apps Script deployment is configured for public access because the public request form needs to submit without Google login. That also means the CRUD endpoint itself is not a secure private admin API. Do not treat `admin.html` as protected just because it is not linked from the homepage.

For a private production admin panel, add real authentication/server-side authorization instead of putting a password or secret key inside public JavaScript.
