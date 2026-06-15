import ejs from "ejs";
import path from "path";
import { promises as fs } from "fs";
import nodemailer from "nodemailer";

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
      <h2>Plot ${type === 'reserve' ? 'Reservation' : 'Purchase'} Details</h2>
      <p>Dear <%= firstname %> <%= lastname %>,</p>
      <p>Thank you for your ${type === 'reserve' ? 'reservation' : 'purchase'} of a plot at <strong><%= plotArea %></strong>.</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #ddd">Plot</td><td style="padding:8px;border:1px solid #ddd"><%= plotDetails %></td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd">Size</td><td style="padding:8px;border:1px solid #ddd"><%= plotSize %></td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd">Amount</td><td style="padding:8px;border:1px solid #ddd"><%= amount %></td></tr>
      </table>
      <p>Our team will be in touch with you shortly.</p>
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

    await transporter.sendMail({
      from: `"Get One Plot" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: to,
      subject: type === 'reserve' ? "Plot Reservation Details" : "Plot Purchase Details",
      html,
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Error in plot-notify (mobile API):", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
