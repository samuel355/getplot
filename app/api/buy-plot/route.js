import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.formData();
    const to = data.get('to');
    const firstname = data.get('firstname');
    const lastname = data.get('lastname');
    const amount = data.get('amount');
    const plotDetails = data.get('plotDetails');
    const plotSize = data.get('plotSize');
    const pdf = data.get('pdf'); //Get pdf file using data.get

    const subject = "Plot & Payment Details";
    const templatePath = path.resolve(process.cwd(), "emails", "plot-buying-details.ejs");
    const htmlContent = await ejs.renderFile(templatePath, {
      firstname,
      lastname,
      amount,
      plotDetails,
      plotSize,
    });

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: true, // Set to false if port is other than 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });


    // Send email with attachment
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: 'plot_details.pdf',
          content: Buffer.from(await pdf.arrayBuffer()), // Convert the readable stream to a buffer.
          contentType: 'application/pdf',
        },
      ],
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