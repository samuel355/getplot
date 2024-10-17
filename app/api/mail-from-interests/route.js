import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      firstname,
      lastname,
      email,
      country,
      phone,
      plot_number,
      plot_name,
      plot_amount,
      message,
    } = await request.json();

    // Path to the email templates
    const templatePath = path.resolve(process.cwd(), "emails", "interests.ejs");

    // Render the template with the provided data
    const htmlContent = await ejs.renderFile(templatePath, {
      firstname,
      lastname,
      email,
      country,
      phone,
      plot_number,
      plot_name,
      plot_amount,
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
      from: email, // sender address
      to: process.env.SMTP_EMAIL, // list of receivers
      subject: "Potential client to buy a land", // Subject line
      html: htmlContent, // HTML body
    });

    return NextResponse.json({
      message: "Email sent successfully. \n Our Rep will contact you shortly",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send email", error: error.message },
      { status: 500 }
    );
  }
}
