# Bootham Roll Call

## 1. Create the Google Sheet

Create a blank Google Sheet. In row 1, add `Name` in cell A1 and `Timestamp` in cell B1.

## 2. Add the Apps Script

Open **Extensions → Apps Script**, replace the starter code with:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = JSON.parse(e.postData.contents || "{}");
  const name = String(data.name || "").trim();
  if (!name) return ContentService.createTextOutput("Missing name");
  sheet.appendRow([name, new Date()]);
  return ContentService.createTextOutput("Saved");
}
```

Click **Deploy → New deployment**, choose **Web app**, set **Execute as: Me** and **Who has access: Anyone**, then deploy and copy the Web app URL.

## 3. Connect this page

Open `script.js` and replace `PASTE_YOUR_WEB_APP_URL_HERE` with the copied URL. Keep the URL inside the quotes.

## 4. Publish on GitHub Pages

Create a GitHub repository and upload `index.html`, `style.css`, `script.js`, `README.md`, and the `assets` folder. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save. GitHub will provide the public page link.

The form uses a simple POST request and stores only the entered name and the server timestamp. Test once after publishing and confirm a new row appears in the Sheet.
