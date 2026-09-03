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
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto;background:#fff;color:#172033">
        <div style="padding:28px 32px;background:#0b0e2d;color:#fff">
          <img src="https://getoneplot.com/logo-lateral.svg" alt="GetOnePlot" style="width:150px;max-width:60%;margin-bottom:20px">
          <h1 style="margin:0;font-size:24px">Plot ${type === 'reserve' ? 'Reservation' : 'Purchase'} Request</h1>
          <p style="margin:7px 0 0;color:#b9c5df">Payment instructions and plot details</p>
        </div>
        <div style="padding:32px">
          <p style="display:inline-block;padding:5px 12px;border-radius:999px;background:${type === 'reserve' ? '#fef3c7;color:#92400e' : '#dcfce7;color:#166534'};font-size:12px;font-weight:bold">Request received</p>
          <p>Dear <strong><%= firstname %> <%= lastname %></strong>,</p>
          <p style="color:#475569">Thank you for choosing GetOnePlot. We have received your request for the plot below. Please review the details and follow the payment instructions to proceed.</p>
          <h2 style="margin:28px 0 10px;color:#0b0e2d;font-size:14px;text-transform:uppercase">Selected plot</h2>
          <table style="width:100%;border:1px solid #e2e8f0;border-collapse:collapse">
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Location</td><td style="padding:12px;font-weight:bold"><%= plotArea %></td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Plot details</td><td style="padding:12px;font-weight:bold"><%= plotDetails %></td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Plot size</td><td style="padding:12px;font-weight:bold"><%= plotSize %></td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">${type === 'reserve' ? 'Deposit required' : 'Amount due'}</td><td style="padding:12px;font-weight:bold"><%= amount %></td></tr>
          </table>
          <h2 style="margin:28px 0 10px;color:#0b0e2d;font-size:14px;text-transform:uppercase">Payment account</h2>
          <table style="width:100%;border:1px solid #e2e8f0;border-collapse:collapse">
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Bank</td><td style="padding:12px;font-weight:bold">STANBIC BANK</td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Account name</td><td style="padding:12px;font-weight:bold">LAND AND HOMES CONSULT</td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Cedis account</td><td style="padding:12px;font-weight:bold">9040009771047</td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Dollar account</td><td style="padding:12px;font-weight:bold">9040011449268</td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Branch</td><td style="padding:12px;font-weight:bold">KNUST, KUMASI GHANA</td></tr>
          </table>
          <p style="margin-top:24px;padding:16px;background:#f0f9ff;border:1px solid #bae6fd;color:#164e63">Make payment to the account above, then bring your receipt to our Kumasi Dichemso office or email it to <a href="mailto:sales@getoneplot.com">sales@getoneplot.com</a>.</p>
          <p style="color:#475569">For assistance, call <strong>0322008282</strong> or <strong>+233 54 855 4216</strong>.</p>
          <p>Best regards,<br><strong>The GetOnePlot Team</strong></p>
        </div>
        <div style="padding:22px;background:#f8fafc;color:#64748b;text-align:center;font-size:12px">&copy; <%= new Date().getFullYear() %> GetOnePlot. All rights reserved.</div>
      </div>
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
