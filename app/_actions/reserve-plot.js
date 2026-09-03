import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { cedisAccount } from "./cedis-account";
import { dollarAccount } from "./dollar-account";
import { toast } from "react-toastify";
import { updatePlotStatus } from "./update-plot-status";
import { sendCompanyAlert, sendSMS } from "./send-sms";
import { calculatePlotAreaAcres, formatCalculatedPlotSize } from "@/lib/plotGeometry";
import { getSiteBySlug, getSiteByTable, getSiteLabel } from "@/lib/sites";

export const reservePlot = async (
  allDetails,
  plotTotalAmount,
  initialDeposit,
  setLoader3,
  router,
  databaseName,
  id,
  email,
  firstname,
  lastname,
  phone,
  country,
  residentialAddress,
  embedded = false
) => {
  setLoader3(true);
  const doc = new jsPDF();
  try {
    const plotColumns = [
      { header: "Plot No", dataKey: "Plot_No" },
      { header: "Street Name", dataKey: "Street_Nam" },
      { header: "Size (Acres)", dataKey: "Area" },
      { header: "Plot Area", dataKey: "plotArea" },
      { header: "Plot Amount (GHS)", dataKey: "plotAmount" },
      { header: "Minimum Deposit (GHS)", dataKey: "initialDeposit" },
    ];

    const plotAreaAcres = calculatePlotAreaAcres(allDetails);
    const plotProperties = {
      ...allDetails.properties,
      plotAmount: plotTotalAmount,
      initialDeposit,
      plotArea: getSiteLabel(databaseName),
      Area: plotAreaAcres ? plotAreaAcres.toFixed(2) : "Size unavailable",
    };
    const plotRows = [plotProperties];

    const topMargin = 25;

    doc.autoTable({
      columns: plotColumns,
      body: plotRows,
      startY: topMargin,
    });

    // Add Plot Details Heading (with underline)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const plotHeadingY = doc.autoTable.previous.finalY - 25;
    const plotHeadingX = 10;
    doc.text("Plot Details", plotHeadingX, plotHeadingY);
    doc.setLineWidth(0.5);
    doc.line(
      plotHeadingX,
      plotHeadingY + 2,
      plotHeadingX + doc.getTextWidth("Plot Details"),
      plotHeadingY + 2
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
    const cedisStartY = doc.autoTable.previous.finalY + 15; // Increased spacing
    doc.autoTable({
      columns: accountColumns,
      body: cedisAccount,
      startY: cedisStartY,
    });

    // Add Cedis Account Heading (with underline)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const cedisHeadingY = cedisStartY - 5;
    const cedisHeadingX = 10;
    doc.text("Cedis Account Details", cedisHeadingX, cedisHeadingY);
    doc.setLineWidth(0.5);
    doc.line(
      cedisHeadingX,
      cedisHeadingY + 2,
      cedisHeadingX + doc.getTextWidth("Cedis Account Details"),
      cedisHeadingY + 2
    );

    // Add Dollar Account Table
    const dollarStartY = doc.autoTable.previous.finalY + 15; // Increased spacing
    doc.autoTable({
      columns: accountColumns,
      body: dollarAccount,
      startY: dollarStartY,
    });

    // Add Dollar Account Heading (with underline)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const dollarHeadingY = dollarStartY - 5;
    const dollarHeadingX = 10;
    doc.text("Dollar Account Details", dollarHeadingX, dollarHeadingY);
    doc.setLineWidth(0.5);
    doc.line(
      dollarHeadingX,
      dollarHeadingY + 2,
      dollarHeadingX + doc.getTextWidth("Dollar Account Details"),
      dollarHeadingY + 2
    );

    const finalText =
      "For us to reserve the chosen plot for you, kindly make the minimum payment to the account above, either the dollar account or the cedis account and present your receipt in our office at Kumasi Dichemso. Or Call 0322008282/+233 54 855 4216";
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

    const plotArea = getSiteLabel(databaseName);

    const pdfBlob = doc.output("blob"); // Get PDF as a Blob

    const formData = new FormData();
    formData.append("pdf", pdfBlob, "plot_details.pdf"); // Append PDF

    //Other data
    formData.append("to", email);
    formData.append("firstname", firstname);
    formData.append("lastname", lastname);
    formData.append("plotArea", plotArea);
    formData.append("amount", "GHS. " + plotTotalAmount.toLocaleString());
    formData.append(
      "initialDeposit",
      "GHS. " + initialDeposit.toLocaleString()
    );
    formData.append(
      "plotDetails",
      "Plot Number " +
        plotProperties.Plot_No +
        " " +
        plotProperties.Street_Nam
    );

    formData.append("plotSize", formatCalculatedPlotSize(allDetails));

    const res = await fetch("/api/reserve-plot", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setLoader3(false);
      // Handle the error appropriately
      console.error("Error sending email:", await res.text());
      toast.error("Sorry something went wrong. Try again later");
      return;
    }

    const site = getSiteByTable(databaseName) ?? getSiteBySlug(databaseName);
    const redirect = site ? `/sites/${site.slug}` : "/sites";

    //Update plot status to hold for 24 hours
    await updatePlotStatus(
      databaseName,
      id,
      firstname,
      lastname,
      email,
      phone,
      country,
      residentialAddress
    );
    setLoader3(false);
    if (embedded && window.parent !== window) {
      window.parent.postMessage({ type: "plot-action-complete", action: "reserve" }, window.location.origin);
    } else {
      router.push(`/message?redirect=${redirect}`);
    }

    const plot_info_to_send = `${plotProperties.Plot_No}, ${plotProperties.Street_Nam} at ${plotArea}`;
    const message1 = `To claim ownership of the chosen plot (Plot No. ${plot_info_to_send} ), kindly make the payment to either the dollar account or the cedis account and present your receipt in our office at Kumasi Dichemso. Or Call 0322008282/+233 54 855 4216 or check your email for more info`;
    //send SMS
    sendSMS(phone, message1);
    sendCompanyAlert({
      subject: `New plot reservation request: Plot ${plotProperties.Plot_No}`,
      message: [
        "New plot reservation request",
        `Client: ${firstname} ${lastname}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Country: ${country}`,
        `Plot: ${plot_info_to_send}`,
        `Plot amount: GHS ${plotTotalAmount.toLocaleString()}`,
        `Deposit required: GHS ${initialDeposit.toLocaleString()}`,
        `Address: ${residentialAddress || "N/A"}`,
        "Follow up and confirm bank receipt at the office.",
      ].join("\n"),
    });
  } catch (error) {
    setLoader3(false);
    toast.error("Sorry something went wrong try again later");
    console.error("Errory reserving plot ->", error);
  }
};
