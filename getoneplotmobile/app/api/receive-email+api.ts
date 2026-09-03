import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { promises as fs } from "fs";

const INLINE_TEMPLATE = `
<h2>New Contact Message</h2>
<p><strong>From:</strong> <%= fullname %> (<%= email %>)</p>
<% if (phone) { %><p><strong>Phone:</strong> <%= phone %></p><% } %>
<p><strong>Subject:</strong> <%= subject %></p>
<p><strong>Message:</strong> <%= message %></p>
`;

async function loadTemplate(): Promise<string> {
  try {
    const templatePath = path.resolve("src/api/templates", "receive-emails.ejs");
    return await fs.readFile(templatePath, "utf-8");
  } catch {
    return INLINE_TEMPLATE;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullname = String(body.name ?? body.fullname ?? "").trim();
    const email = String(body.email ?? body.from ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const message = String(body.message ?? "").trim();
    const subject = `New website enquiry from ${fullname}`;

    if (!fullname || !email || !message) {
      return Response.json({ message: "Name, email and message are required." }, { status: 400 });
    }

    const template = await loadTemplate();
    const htmlContent = ejs.render(template, {
      fullname,
      email,
      phone,
      subject,
      message,
    });

    const smtpPort = parseInt(process.env.SMTP_PORT || "465");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `GetOnePlot Website <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.SMTP_EMAIL,
      replyTo: `${fullname} <${email}>`,
      subject: subject,
      html: htmlContent,
    });

    return Response.json({
      message: "Email sent successfully. \n Our Rep will contact you shortly",
    });
  } catch (error: any) {
    console.error("Error sending email (mobile API):", error);
    return Response.json(
      { message: "Failed to send email", error: error.message },
      { status: 500 }
    );
  }
}
