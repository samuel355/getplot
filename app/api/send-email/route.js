import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { to, firstname, lastname, paidAmount, plotDetails, plotSize } =
      await request.json();
    const subject = "Plot Payment";

    // Path to the email template
    const templatePath = path.resolve(
      process.cwd(),
      "emails",
      "payment.ejs"
    );

    // Render the template with the provided data
    const htmlContent = await ejs.renderFile(templatePath, {
      firstname,
      lastname,
      paidAmount,
      plotDetails,
      plotSize,
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
      from: process.env.SMTP_FROM, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: htmlContent, // HTML body
    });

    console.log("Email sent successfully");
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send email", error: error.message },
      { status: 500 }
    );
  }
}
