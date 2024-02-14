function compileList() {
  // Author: Nick Taylor
  // Purpose: Requires user to provide the URL to the CAR (Client Account Review) so that Client names can be extracted from each tab into a transposed list. Setting up the user to continue through remaining steps to populate the highest assistance level per Care Pro.
  // Script Callout: The URL is stored using the Properties Service for use in the Populate Assistance Levels script. This is done over variable storage so that the URL can be called in other script executions.

  // BEGIN SCRIPT
  // Shows the user a dialog box asking for the URL of the applicable CAR Google Sheets workbook they wish to use. This should be relevant to the current Implementation.
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Please copy and paste the URL to the applicable CLIENT ACCOUNT REVIEW workbook. The format should be: https://docs.google.com/spreadsheets/d/spreadsheetID/edit. DO NOT include the # or anything after it, such as #gid=123045789.');

  // Check if the user clicked "OK" and provided a URL.
  if (response.getSelectedButton() == ui.Button.OK && response.getResponseText()) {
    // Instead of storing the URL in a global variable, use the Properties Service to store it for later use across different executions.
    var scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('sharedUrl', response.getResponseText());

    try {
      // Access the 'Compiled List' tab in the current Google Sheets document.
      var targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Compiled List');
      
      // Check if there's already data in Column A starting from row 3.
      var existingValues = targetSheet.getRange('A3:A' + targetSheet.getLastRow()).getValues();
      var hasExistingValues = existingValues.some(function(row) { return row[0] !== ''; });

      // If there's existing data, confirm with the user before overwriting it.
      if (hasExistingValues) {
        var overwriteResponse = ui.alert('Running this script will overwrite data in Column A on the Compiled List tab. Do you wish to proceed?', ui.ButtonSet.YES_NO);
        
        // If the user chooses not to proceed, stop the script and notify them.
        if (overwriteResponse == ui.Button.NO) {
          ui.alert('Script halted per user instruction.');
          return; // Exit the function early.
        }
        // Clear existing data in Column A from row 3 onwards if the user agrees to proceed.
        targetSheet.getRange('A3:A' + targetSheet.getLastRow()).clearContent();
      }

      // Open the workbook from the provided URL using the URL stored in the Properties Service.
      var sharedUrl = scriptProperties.getProperty('sharedUrl');
      var sourceWorkbook = SpreadsheetApp.openByUrl(sharedUrl);
      var targetRow = 3; // Start adding names from row 3 in Column A.

      // Loop through each tab in the provided workbook, excluding hidden tabs and specific tab names.
      sourceWorkbook.getSheets().forEach(function(sheet) {
        if (!sheet.isSheetHidden() && sheet.getName() !== 'Status' && sheet.getName() !== 'Compiled List') {
          // Add the name of each relevant tab to the 'Compiled List' tab in the current workbook.
          targetSheet.getRange('A' + targetRow).setValue(sheet.getName());
          targetRow++; // Move to the next row for the next tab name.
        }
      });

      // Notify the user once all relevant tab names have been added.
      ui.alert('Client Names have been added to Column A on Compiled List tab.');
    } catch (e) {
      // If an error occurs (e.g., invalid URL), show an error message.
      ui.alert('Error: ' + e.toString());
    }
  } else {
    // If the user didn't provide a URL, notify them that the script cannot run.
    ui.alert('Script cannot run without a link to the Client Account Review workbook.');
  }
}
// END SCRIPT
