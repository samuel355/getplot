import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { from, subject, fullname, phone, message } = await request.json();

    // In Expo Router API routes, we can't easily use process.cwd() for assets in all environments
    // But we can try or use a relative path if it's bundled.
    // For now, let's assume it's in src/api/templates
    const templatePath = path.resolve(
      "src/api/templates",
      "receive-emails.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
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
