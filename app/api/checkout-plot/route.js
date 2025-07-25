import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.formData();
    const to = data.get("to");
    const firstname = data.get("firstname");
    const lastname = data.get("lastname");
    const total_amount = data.get("total_amount");
    const plotDetails = JSON.parse(data.get("plotDetails"));
    const pdf = data.get("pdf"); //Get pdf file

    const subject = "Plot & Payment Details";
    const templatePath = path.resolve(
      process.cwd(),
      "emails",
      "checkout-plot.ejs"
    );
    const htmlContent = await ejs.renderFile(templatePath, {
      firstname,
      lastname,
      plotDetails,
      total_amount,
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
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: "plot_details.pdf",
          content: Buffer.from(await pdf.arrayBuffer()), // Convert the readable stream to a buffer.
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send email", error: error.message },
      { status: 500 }
    );
  }
}
