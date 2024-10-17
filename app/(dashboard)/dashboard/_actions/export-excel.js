import { saveAs } from "file-saver";
import * as XLSX from "xlsx"; // Correct import
import { toast } from "react-toastify";

export const exportToExcel = (data) => {
  if (data && data.length > 0) {
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "PlotData");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Create a Blob from the Excel buffer
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    // Save the Excel file
    saveAs(blob, "plotData.xlsx");

    // Notify success
    toast.success("Excel exported successfully!");
  } else {
    // Notify error if data is missing
    toast.error("No data available to export to Excel");
  }
};
