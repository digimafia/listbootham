# Mobile Bootham — Google Sheet setup

## 1. Create the Sheet

Create a new Google Sheet. Put `Name` in A1 and `Timestamp` in B1.

## 2. Add Apps Script

Open **Extensions → Apps Script**. Delete the existing code and paste this complete code. The `doPost` section saves a new request; `doGet` shares the existing names with the scrolling list.

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = JSON.parse(e.postData.contents || "{}");
  const name = String(data.name || "").trim();

  if (!name) {
    return ContentService.createTextOutput("Missing name");
  }

  sheet.appendRow([name, new Date()]);
  return ContentService.createTextOutput("Saved");
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();
  const names = lastRow < 2 ? [] : sheet.getRange(2, 1, lastRow - 1, 1)
    .getDisplayValues()
    .flat()
    .filter(String);
  const callback = String(e.parameter.callback || "");
  const output = callback ? `${callback}(${JSON.stringify(names)})` : JSON.stringify(names);
  return ContentService.createTextOutput(output)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
```

## 3. Deploy as Web App

Click **Save**, then **Deploy → New deployment**. Select **Web app**, choose **Execute as: Me**, and choose **Who has access: Anyone**. Deploy, authorize if Google asks, then copy the Web App URL.

## 4. Connect the webpage

Open `script.js` and replace `PASTE_YOUR_WEB_APP_URL_HERE` with your copied URL. Keep the quotation marks.

The page reloads the name list every 30 seconds. After a new request, it reloads after about 1.5 seconds.

## 5. Publish with GitHub Pages

Upload the entire `outputs` folder contents—including the `assets` folder—to a GitHub repository. Go to **Settings → Pages**, select **Deploy from a branch**, select `main` and `/ (root)`, and save.
