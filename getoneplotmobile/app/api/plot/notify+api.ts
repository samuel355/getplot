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

    // We try to find the template in the root emails folder or the mobile src/api/templates
    // Since we are in Expo API route, process.cwd() might be project root or mobile root.
    // Given the structure, we'll try to find it in the web's emails folder first.
    let templatePath = path.resolve("emails", templateName);

    let template: string;
    try {
      template = await fs.readFile(templatePath, "utf-8");
    } catch (e) {
      // Fallback to a simple inline template if files are not reachable
      template = `
        <h1>Plot Details</h1>
        <p>Dear <%= firstname %> <%= lastname %>,</p>
        <p>Thank you for your interest in <%= plotArea %>.</p>
        <table>
          <tr><td>Plot Details:</td><td><%= plotDetails %></td></tr>
          <tr><td>Plot Size:</td><td><%= plotSize %></td></tr>
          <tr><td>Amount:</td><td><%= amount %></td></tr>
        </table>
        <p>We will contact you shortly.</p>
      `;
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
