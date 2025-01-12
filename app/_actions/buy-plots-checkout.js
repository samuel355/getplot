import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";

export const BuyPlotCheckout = async (
  plots,
  plotData,
  total,
  setVerifyLoading
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

    // Add Plot Details Heading (with underline)
    // doc.setFontSize(16);
    // doc.setFont("helvetica", "bold");
    // const plotHeadingY = doc.autoTable.previous.finalY - 25;
    // const plotHeadingX = 10;
    // doc.text("Plot Details", plotHeadingX, plotHeadingY);
    // doc.setLineWidth(0.5);
    // doc.line(
    //   plotHeadingX,
    //   plotHeadingY + 2,
    //   plotHeadingX + doc.getTextWidth("Plot Details"),
    //   plotHeadingY + 2
    // );

    doc.save("plot_details.pdf");
    setVerifyLoading(false);
  } catch (error) {
    console.log(error);
    toast.error("Sorry error occured. Try again later");
    setVerifyLoading(false);
  }
};
