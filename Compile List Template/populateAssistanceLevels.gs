function populateAssistanceLevels() {
  // Author: Nick Taylor
  // Purpose: In the provided CAR (Client Account Review) workbook, the script references each Client Name tab to find the <Assistance Level> for each Client by finding the header "Assistance Level", and selecting the value directly to the right of the header. The value is then populated on the Compiled List tab in the TEMPLATE workbook, under the "Initial Run" column, Column B.
  // Script Callout: The method is performed this way to account for any changes in formatting. Normally, the Assistance Level can be found in Cell D23, but if the formatting changes, the wrong value could be populated, thus erroring out the script. This method accounts for that by searching for the header and populating the value next to it.

  // BEGIN SCRIPT

  // Start by getting the user interface of Google Sheets to show messages.
  var ui = SpreadsheetApp.getUi();

  // Use the Properties Service to retrieve the URL stored by the previous script.
  var scriptProperties = PropertiesService.getScriptProperties();
  var sharedUrl = scriptProperties.getProperty('sharedUrl');

  // Check if the URL has been set. If not, instruct the user to run the 'Compile List' script first.
  if (!sharedUrl) {
    ui.alert("Please run the 'Compile List' script first to provide the URL.");
    return; // Exit the function if the URL isn't available.
  }

  // Open the workbook specified by the stored URL.
  var sourceWorkbook = SpreadsheetApp.openByUrl(sharedUrl);

  // Access the 'Compiled List' tab in the current Google Sheets document.
  var targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Compiled List');

  // Get all client names listed in column A starting from row 3.
  var clientNames = targetSheet.getRange('A3:A' + targetSheet.getLastRow()).getValues();

  // Iterate over each client name.
  clientNames.forEach(function(row, index) {
    var clientName = row[0]; // Extract the client name from the current row.

    if (clientName) { // Proceed only if the client name is not empty.
      try {
        // Attempt to find the corresponding tab in the source workbook using the client name.
        var clientSheet = sourceWorkbook.getSheetByName(clientName);

        if (clientSheet) { // If the client's tab exists,
          // Search for the cell containing the text "Assistance Level".
          var foundRange = clientSheet.createTextFinder("Assistance Level").findNext();

          if (foundRange) { // If the "Assistance Level" cell is found,
            // Retrieve the value of the cell directly to the right of the found cell.
            var assistanceLevel = clientSheet.getRange(foundRange.getRow(), foundRange.getColumn() + 1).getValue();

            // Place this value in the 'Compiled List' tab, column B, aligned with the client name.
            targetSheet.getRange('B' + (index + 3)).setValue(assistanceLevel);
          } else {
            // If "Assistance Level" is not found within the client's tab, indicate this in the 'Compiled List'.
            targetSheet.getRange('B' + (index + 3)).setValue("Cannot find 'Assistance Level'");
          }
        } else {
          // If no tab matches the client name, indicate this in the 'Compiled List'.
          targetSheet.getRange('B' + (index + 3)).setValue("Cannot find tab name");
        }
      } catch (e) {
        // If any errors occur during the process, record the error message next to the client's name.
        targetSheet.getRange('B' + (index + 3)).setValue("Error: " + e.message);
      }
    }
  });

  // After processing all client names, display a completion message.
  ui.alert("Assistance Levels have been populated in the Initial Run column on the Compiled List (Column B) tab.");
}
// END SCRIPT
