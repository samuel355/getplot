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
    const { from, subject, fullname, phone, message } = await request.json();

    const template = await loadTemplate();
    const htmlContent = ejs.render(template, {
      fullname,
      email: from,
      phone,
      subject,
      message,
    });

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: from,
      to: process.env.SMTP_EMAIL,
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
