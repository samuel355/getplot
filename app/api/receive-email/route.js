import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { from, subject, fullname, phone, message } = await request.json();

     // Path to the email templates
    const templatePath = path.resolve(
      process.cwd(),
      "emails",
      "receivemail.ejs"
    );

    // Render the template with the provided data
    const htmlContent = await ejs.renderFile(templatePath, {
      fullname,
      email: from,
      phone,
      subject,
      message,
    });

    // Create a Nodemailer transporter using SMTP
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // your SMTP username
        pass: process.env.SMTP_PASS, // your SMTP password
      },
    });

    // Send email
    await transporter.sendMail({
      from: from, // sender address
      to: process.env.SMTP_EMAIL, // list of receivers
      subject: subject, // Subject line
      html: htmlContent, // HTML body
    }); 

    return NextResponse.json({ message: "Email sent successfully. \n Our Rep will contact you shortly" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send email", error: error.message },
      { status: 500 }
    );
  }
}
