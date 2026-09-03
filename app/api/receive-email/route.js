import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const fullname = String(body.name ?? "").trim().slice(0, 120);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
    const phone = String(body.phone ?? "").trim().slice(0, 40);
    const message = String(body.message ?? "").trim().slice(0, 5000);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullname || !email || !message) {
      return NextResponse.json(
        { message: "Name, email and message are required." },
        { status: 400 }
      );
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    const recipient = process.env.SMTP_EMAIL;
    const sender = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!recipient || !sender || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("Contact email is missing required SMTP configuration");
      return NextResponse.json(
        { message: "Messaging is temporarily unavailable. Please call us directly." },
        { status: 503 }
      );
    }

    const subject = `New website enquiry from ${fullname}`;

    // Path to the email templates
    const templatePath = path.resolve(
      process.cwd(),
      "emails",
      "receive-emails.ejs"
    );

    // Render the template with the provided data
    const htmlContent = await ejs.renderFile(templatePath, {
      fullname,
      email,
      phone,
      subject,
      message,
    });

    // Create a Nodemailer transporter using SMTP
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER, // your SMTP username
        pass: process.env.SMTP_PASS, // your SMTP password
      },
    });

    // Send email
    await transporter.sendMail({
      from: `GetOnePlot Website <${sender}>`,
      to: recipient,
      replyTo: `${fullname} <${email}>`,
      subject,
      text: [
        `New website enquiry from ${fullname}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        "",
        message,
      ].join("\n"),
      html: htmlContent,
    });

    return NextResponse.json({
      message: "Message sent successfully. Our team will contact you shortly.",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "We couldn't send your message. Please try again or call us directly." },
      { status: 500 }
    );
  }
}
