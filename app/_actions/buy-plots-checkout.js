import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";
import { cedisAccount } from "./cedis-account";
import { dollarAccount } from "./dollar-account";
import { supabase } from "@/utils/supabase/client";
import { sendSMS } from "./send-sms";

export const BuyPlotCheckout = async (
  plots,
  plotData,
  total,
  setVerifyLoading,
  router
) => {
  try {
    setVerifyLoading(true);
    const doc = new jsPDF();

    // Add centered title at the top
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const title = "PLOT DETAILS AND INSTRUCTIONS";
    const pageWidth = doc.internal.pageSize.width;
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, 15);

    // Add underline to the title
    doc.setLineWidth(0.5);
    doc.line(titleX, 17, titleX + titleWidth, 17);

    const plotColumns = [
      { header: "Plot No", dataKey: "Plot_No" },
      { header: "Street Name", dataKey: "Street_Nam" },
      { header: "Size (Acres)", dataKey: "Area" },
      { header: "Plot Area", dataKey: "location" },
      { header: "Plot Amount (GHS)", dataKey: "plotTotalAmount" },
    ];

    const plotRows = plots.map((plot) => ({
      Plot_No: plot.properties.Plot_No,
      Street_Nam: plot.properties.Street_Nam,
      Area: plot.properties.Area
        ? parseFloat(plot.properties.Area).toFixed(2)
        : (plot.properties.SHAPE_Area * 3109111.525693).toFixed(3),
      location: plot.location,
      plotTotalAmount: plot.plotTotalAmount.toLocaleString(),
    }));

    const topMargin = 25;

    doc.autoTable({
      columns: plotColumns,
      body: plotRows,
      startY: topMargin,
    });

    // Add Total Amount after the table
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const totalY = doc.autoTable.previous.finalY + 10;
    doc.text(`Total Amount: GHS ${total.toLocaleString()}`, 14, totalY);

    // Add Cedis Account Heading (with underline)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const cedisHeadingY = doc.autoTable.previous.finalY + 25;
    const cedisHeadingX = 10;
    doc.text("Cedis Account Details", cedisHeadingX, cedisHeadingY);
    doc.setLineWidth(0.5);
    doc.line(
      cedisHeadingX,
      cedisHeadingY + 2,
      cedisHeadingX + doc.getTextWidth("Cedis Account Details"),
      cedisHeadingY + 2
    );

    // --- Account Details Tables ---
    const accountColumns = [
      { header: "Title", dataKey: "title" },
      { header: "Bank Name", dataKey: "Bank_Name" },
      { header: "Account Name", dataKey: "Account_Name" },
      { header: "Account Number", dataKey: "Account_Number" },
      { header: "Branch Name", dataKey: "Branch_Name" },
    ];

    // Add Cedis Account Table
    const cedisStartY = doc.autoTable.previous.finalY + 35; // Increased spacing
    doc.autoTable({
      columns: accountColumns,
      body: cedisAccount,
      startY: cedisStartY,
    });

    // Add Dollar Account Heading (with underline)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const dollarHeadingY = doc.autoTable.previous.finalY + 15;
    const dollarHeadingX = 10;
    doc.text("Dollar Account Details", dollarHeadingX, dollarHeadingY);
    doc.setLineWidth(0.5);
    doc.line(
      dollarHeadingX,
      dollarHeadingY + 2,
      dollarHeadingX + doc.getTextWidth("Dollar Account Details"),
      dollarHeadingY + 2
    );

    // Add Dollar Account Table
    const dollarStartY = doc.autoTable.previous.finalY + 25; // Increased spacing
    doc.autoTable({
      columns: accountColumns,
      body: dollarAccount,
      startY: dollarStartY,
    });

    const finalText =
      "To claim ownership of the chosen plots, kindly make payment to the account provided above, either the dollar account or the cedis account and present your receipt in our office at Kumasi Dichemso. Or Call 0322008282/+233 54 855 4216";
    const finalTextY = doc.autoTable.previous.finalY + 15;
    doc.setFontSize(10);
    // Use doc.textWithMeasurement to handle text wrapping
    const maxWidth = doc.internal.pageSize.getWidth() - 20; // Allow 10px margin on each side
    const textLines = doc.splitTextToSize(finalText, maxWidth);
    let currentY = finalTextY;
    textLines.forEach((line) => {
      doc.text(line, 10, currentY);
      currentY += 5; // Adjust vertical spacing between lines
    });

    //doc.save("plot_details.pdf");

    //Update plot status
    const updates = plots.map((plot) =>
      supabase
        .from(plot.table_name)
        .update({
          status: "On Hold",
          firstname: plotData.firstname,
          lastname: plotData.lastname,
          email: plotData.email,
          phone: plotData.phone,
          country: plotData.country,
          residentialAddress: plotData.residentialAddress,
        })
        .eq("id", plot.id)
    );

    const results = await Promise.all(updates);

    // Check for any errors
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.log("Errors updating plots:", errors);
      toast.error("Sorry Error occured, Try again later");
      return { success: false, errors };
    }

    //send emaill
    const pdfBlob = doc.output("blob"); // Get PDF as a Blob

    const formData = new FormData();
    formData.append("pdf", pdfBlob, "plot_details.pdf"); // Append PDF
    formData.append("to", plotData.email);
    formData.append("firstname", plotData.firstname);
    formData.append("lastname", plotData.lastname);
    formData.append("total_amount", total);

    // Convert plots array to string
    const plotDetails = plots.map((plot) => ({
      plotNo: plot.properties.Plot_No,
      streetName: plot.properties.Street_Nam,
      area: plot.properties.Area
        ? parseFloat(plot.properties.Area).toFixed(2)
        : (plot.properties.SHAPE_Area * 3109111.525693).toFixed(3),
      location: plot.location,
      amount: plot.plotTotalAmount,
    }));

    formData.append("plotDetails", JSON.stringify(plotDetails));
    formData.append("amount", total);

    const res = await fetch("/api/checkout-plot", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setVerifyLoading(false);
      console.error("Error sending email:", await res.text());
      toast.error("Sorry something went wrong. Try again later");
      return { success: false };
    }

    router.push(`/message?redirect=${'trabuom'}`);

    const message1 = `To claim ownership of the chosen plot, kindly make the payment to either the dollar account or the cedis account and present your receipt in our office at Kumasi Dichemso. Or Call 0322008282/+233 54 855 4216 or check your email for more info`
    //send SMS
    sendSMS(phone, message1);

    setVerifyLoading(false);
    return { success: true };
  } catch (error) {
    console.log(error);
    toast.error("Sorry error occured. Try again later");
    setVerifyLoading(false);
  }
};
