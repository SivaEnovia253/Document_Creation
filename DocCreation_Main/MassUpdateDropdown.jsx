import React, { useState } from "react";
import MassUpdateDropdown from "./MassUpdateDropdown";

const MyTableComponent = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  // Editable columns (fields you want to be able to update)
  const editableColumns = ["State", "Policy"];
  const valueOptions = ["In Progress", "Completed", "Pending"]; // Possible values to apply
  
  // Handle row selection change (assuming you have a table somewhere where rows can be selected)
  const handleRowSelection = (rowId) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(rowId)) {
        // Deselect the row
        return prevSelectedRows.filter((id) => id !== rowId);
      } else {
        // Select the row
        return [...prevSelectedRows, rowId];
      }
    });
  };

  // Apply the update to either the selected rows or all rows
  const handleApplyUpdate = (column, value, scope) => {
    if (!selectedRows.length && scope === "selected") {
      console.log("No rows selected to update");
      return;
    }

    console.log(`Updating column: ${column}, value: ${value}, scope: ${scope}`);
    
    // Example: Loop through selected rows and update the column value
    if (scope === "selected") {
      // Apply the update only to the selected rows
      selectedRows.forEach((rowId) => {
        console.log(`Updating row ${rowId} - ${column}: ${value}`);
        // Add your update logic for the row here (e.g., update state or make API call)
      });
    } else {
      // Apply the update to all rows (you may want to iterate over all rows)
      console.log("Applying to all rows");
      // Update all rows logic goes here
    }
  };

  // Close dropdown (for example: reset states or hide the dropdown)
  const handleCloseDropdown = () => {
    console.log("Dropdown closed");
  };

  return (
    <div>
      <MassUpdateDropdown
        editableColumns={editableColumns}
        selectedRows={selectedRows}
        onApplyUpdate={handleApplyUpdate}
        valueOptions={valueOptions}
        onClose={handleCloseDropdown}
      />

      {/* Example: Table rendering with row selection functionality */}
      <div>
        <h3>Table of Items</h3>
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>State</th>
              <th>Policy</th>
            </tr>
          </thead>
          <tbody>
            {/* Example rows */}
            {[1, 2, 3].map((rowId) => (
              <tr key={rowId}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(rowId)}
                    onChange={() => handleRowSelection(rowId)}
                  />
                </td>
                <td>In Progress</td>
                <td>Policy A</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyTableComponent;
