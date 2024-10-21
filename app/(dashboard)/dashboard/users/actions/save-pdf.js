import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";

export const exportToPdf = (data) => {
  if (data && data.length > 0) {
    const doc = new jsPDF();

    // Define the columns and keys in the data
    const columns = [
      { header: "Email", dataKey: "email" },
      { header: "Role", dataKey: "role" },
      { header: "Username", dataKey: "username" },
      { header: "First Name", dataKey: "firstName" },
      { header: "Last Name", dataKey: "lastName" },
    ];

    // Check if data is provided
    if (!data || data.length === 0) {
      toast.error("No data available to generate PDF.");
      return;
    }

    // Define the columns and rows for the table
    //const columns = Object.keys(data[0]).map((key) => ({ title: key, dataKey: key }));
    const rows = data;

    // Use autotable to add the table to the PDF
    doc.autoTable({
      columns: columns,
      body: rows,
    });

    // Save the PDF with a specific filename
    doc.save("usersdata.pdf");

    // Show success message
    toast.success("PDF generated successfully!");
  } else {
    toast.error("No data available to export to PDF");
  }
};
