import ejs from "ejs";
import path from "path";
import { promises as fs } from "fs";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

function buildPlotPdf(params: {
  firstname: string;
  lastname: string;
  plotArea: string;
  amount: string;
  plotDetails: string;
  plotSize: string;
  type: "buy" | "reserve";
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const label = params.type === "reserve" ? "Reservation" : "Purchase";

    const drawTable = (title: string, rows: [string, string][]) => {
      doc.fontSize(13).fillColor("#0B0E2D").text(title);
      doc.moveDown(0.3);
      rows.forEach(([key, value]) => {
        doc.fontSize(10).fillColor("#555").text(`${key}:`, { continued: true });
        doc.fillColor("#111").text(` ${value}`);
      });
      doc.moveDown(1);
    };

    doc.fontSize(18).fillColor("#0B0E2D").text(`Plot ${label} Details`);
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#333").text(`Dear ${params.firstname} ${params.lastname},`);
    doc.moveDown(0.5);
    doc.text(`Thank you for your ${label.toLowerCase()} request. Here are the plot details and next steps.`);
    doc.moveDown(1);

    drawTable("Plot Details", [
      ["Plot", params.plotDetails],
      ["Location", params.plotArea],
      ["Size", params.plotSize],
      [params.type === "reserve" ? "Deposit Required" : "Amount Due", params.amount],
    ]);

    drawTable("Cedis (GHS) Account", [
      ["Bank Name", "STANBIC BANK"],
      ["Account Name", "LAND AND HOMES CONSULT"],
      ["Account Number", "9040009771047"],
      ["Branch", "KNUST, KUMASI GHANA"],
    ]);

    drawTable("International (Dollar) Account", [
      ["Bank Name", "STANBIC BANK"],
      ["Account Name", "LAND AND HOMES CONSULT"],
      ["Account Number", "9040011449268"],
      ["Branch", "KNUST, KUMASI GHANA"],
    ]);

    doc.fontSize(10).fillColor("#555").text(
      "To secure ownership, kindly make payment to either account above and present your receipt at our office in Kumasi Dichemso, or email it to sales@getoneplot.com. For more information call 0322008282 / +233 54 855 4216.",
    );

    doc.end();
  });
}

export async function POST(request: Request) {
  try {
    const {
      to,
      firstname,
      lastname,
      plotArea,
      amount,
      plotDetails,
      plotSize,
      type // 'buy' or 'reserve'
    } = await request.json();

    if (!to || !firstname || !lastname) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use existing template if available or a generic one
    const templateName = type === 'reserve' ? 'plot-reserving-details.ejs' : 'plot-buying-details.ejs';
    const templatePath = path.resolve("src/api/templates", templateName);

    const INLINE_TEMPLATE = `
      <h2>Plot ${type === 'reserve' ? 'Reservation' : 'Purchase'} Request</h2>
      <p>Dear <%= firstname %> <%= lastname %>,</p>
      <p>We received your ${type === 'reserve' ? 'reservation' : 'purchase'} request for a plot at <strong><%= plotArea %></strong>.</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #ddd">Plot</td><td style="padding:8px;border:1px solid #ddd"><%= plotDetails %></td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd">Size</td><td style="padding:8px;border:1px solid #ddd"><%= plotSize %></td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd">${type === 'reserve' ? 'Deposit Required' : 'Amount Due'}</td><td style="padding:8px;border:1px solid #ddd"><%= amount %></td></tr>
      </table>
      <h3>Bank Details</h3>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #ddd">Bank Name</td><td style="padding:8px;border:1px solid #ddd">STANBIC BANK</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd">Account Name</td><td style="padding:8px;border:1px solid #ddd">LAND AND HOMES CONSULT</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd">Cedis Account</td><td style="padding:8px;border:1px solid #ddd">9040009771047</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd">Dollar Account</td><td style="padding:8px;border:1px solid #ddd">9040011449268</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd">Branch</td><td style="padding:8px;border:1px solid #ddd">KNUST, KUMASI-GHANA</td></tr>
      </table>
      <p>Please make payment at the bank and bring your receipt to our Kumasi Dichemso office to finalize the plot sale or reservation.</p>
      <p>— Get One Plot Team</p>
    `;

    let template: string;
    try {
      template = await fs.readFile(templatePath, "utf-8");
    } catch {
      template = INLINE_TEMPLATE;
    }

    const html = ejs.render(template, {
      firstname,
      lastname,
      plotArea,
      amount,
      plotDetails,
      plotSize,
    });

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const pdfBuffer = await buildPlotPdf({
      firstname,
      lastname,
      plotArea,
      amount,
      plotDetails,
      plotSize,
      type: type === "reserve" ? "reserve" : "buy",
    });

    await transporter.sendMail({
      from: `"Get One Plot" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: to,
      subject: type === 'reserve' ? "Plot Reservation Details" : "Plot Purchase Details",
      html,
      attachments: [
        {
          filename: "plot_details.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Error in plot-notify (mobile API):", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
