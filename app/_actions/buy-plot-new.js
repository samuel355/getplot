import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { cedisAccount } from "./cedis-account";
import { dollarAccount } from "./dollar-account";
import { toast } from "react-toastify";
import { updatePlotStatus } from "./update-plot-status";
import { sendSMS } from "./send-sms";

export const buyPlotNew = async (
  loading,
  setLoading,
  allDetails,
  plotTotalAmount,
  databaseName,
  plotId,
  email,
  firstname,
  lastname,
  phone,
  country,
  residentialAddress,
  table,
  toast,
  setBuyPlotDialog
) => {

  setLoading(true);
  console.log(loading)
  let plot_location = ''
  if (table && table === "nthc") {
    plot_location = "Kumasi Kwadaso";
  }
  if (table && table === "dar-es-salaam") {
    plot_location = "Kumasi Ejisu";
  }
  if (table && table === "trabuom") {
    plot_location = "Kumasi Atwima Trabuom";
  }
  if (table && table === "legon-hills") {
    plot_location = "East Legon Hills";
  }
  if (table && table === "yabi") {
    plot_location = "Kumasi Atwima Yabi";
  }
  if (table && table === "berekuso") {
    plot_location = "Berekuso - Eastern Region";
  }
  if (table && table === "asokore-mampong") {
    plot_location = "Asokore Mampong";
  }
  if (table && table === "saadi") {
    plot_location = "Atwima Yabi - Kumasi";
  }

  const doc = new jsPDF();
  try {
    const plotColumns = [
      { header: "Plot No", dataKey: "Plot_No" },
      { header: "Street Name", dataKey: "Street_Nam" },
      { header: "Size (Acres)", dataKey: "Area" },
      { header: "Plot Area", dataKey: "plotArea" },
      { header: "Plot Amount (GHS)", dataKey: "plotAmount" },
    ];

    allDetails.properties.plotAmount = plotTotalAmount;
    allDetails.properties.plotArea = plot_location;
    allDetails.properties.Area = parseFloat(allDetails.properties.Area).toFixed(
      2
    );
    const plotRows = [allDetails.properties];

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

    const sms_message = `To claim ownership of the chosen plot, kindly make the payment to either the dollar account or the cedis account and present your receipt in our office at Kumasi Dichemso. Or Call 0322008282/+233 54 855 4216 or check your email for more info`;
    const finalText =
      "For us to reserve the chosen plot for you, kindly make the minimum payment to the account above, either the dollar account or the cedis account and present your receipt in our office at Kumasi Dichemso. Or Call 0322008282/+233 54 855 4216";
    const finalTextY = doc.autoTable.previous.finalY + 15;
    doc.setFontSize(10);
    // Use doc.textWithMeasurement to handle text wrapping
    const maxWidth = doc.internal.pageSize.getWidth() - 20; // Allow 10px margin on each side
    const textLines = doc.splitTextToSize(sms_message, maxWidth);
    let currentY = finalTextY;
    textLines.forEach((line) => {
      doc.text(line, 10, currentY);
      currentY += 5; // Adjust vertical spacing between lines
    });

    //doc.save("plot_details.pdf");

    let plotArea = "";
    if (databaseName === "yabi") {
      plotArea = "Yabi-Kumasi";
    } else if (databaseName === "trabuom") {
      plotArea = "Trabuom - Kumasi";
    } else if (databaseName === "dar_es_salaam") {
      plotArea = "Ejisu - Kumasi";
    } else if (databaseName === "legon_hills") {
      plotArea = "East Legon Hills - Accra";
    } else if (databaseName === "nthc") {
      plotArea = "Kwadaso - Kumasi";
    }else if (databaseName === "asokore_mampong") {
      plotArea = "Asokore Mampong - Kumasi";
    }else if (databaseName === "saadi") {
      plotArea = "Saadi - Kumasi";
    }

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
      "plotDetails",
      "Plot Number " +
        allDetails.properties.Plot_No +
        " " +
        allDetails.properties.Street_Nam
    );

    formData.append(
      "plotSize",
      parseFloat(allDetails.properties.Area).toFixed(2) + " Acres "
    );

    const res = await fetch("/api/buy-plot", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setLoader3(false);
      // Handle the error appropriately
      console.error("Error sending email:", await res.text());
      toast.error("Sorry something went wrong. Try again later");
    }

    let redirect = "";
    if (databaseName === "yabi") {
      redirect = "/yabi";
    } else if (databaseName === "trabuom") {
      redirect = "/trabuom";
    } else if (databaseName === "dar_es_salaam") {
      redirect = "/dar-es-salaam";
    } else if (databaseName === "legon_hills") {
      redirect = "/legon-hills";
    } else if (databaseName === "nthc") {
      redirect = "/nthc";
    } else if (databaseName === "asokore_mampong") {
      redirect = "/asokore-mampong";
    } else if (databaseName === "saadi") {
      redirect = "/royal-court-estate";
    }

    //router.push(`/message`);

    //Update plot status to hold for 24 hours
    updatePlotStatus(
      databaseName,
      plotId,
      firstname,
      lastname,
      email,
      phone,
      country,
      residentialAddress
    );

    setLoading(false);
    setBuyPlotDialog(false)
    toast.success("The plot information and instructions has been sent to your email. Thank you")
    const plot_info_to_send = `${allDetails.properties.Plot_No}, ${allDetails.properties.Street_Nam} at ${plotArea}`;
    const message1 = `To claim ownership of the chosen plot (Plot No. ${plot_info_to_send} ), kindly make the payment to either the dollar account or the cedis account and present your receipt in our office at Kumasi Dichemso. Or Call 0322008282/+233 54 855 4216 or check your email for more info`;

    setTimeout(() => {
      window.location.reload();
    }, 1500);
    //send SMS
    sendSMS(phone, message1);
  } catch (error) {
    setLoader3(false);
    toast.error("Sorry something went wrong try again later");
    console.error("Errory reserving plot ->", error);
  }
};
