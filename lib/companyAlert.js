import nodemailer from "nodemailer";

export async function sendCompanySms(message) {
  const apiKey = process.env.ARKESEL_SMS_API;
  const phone = process.env.COMPANY_NUMBER || "233548554216";

  if (!apiKey || !phone) return;

  const url = `https://sms.arkesel.com/sms/api?action=send-sms&api_key=${apiKey}&to=${phone}&from=GetOnePlot&sms=${encodeURIComponent(
    message
  )}`;

  const response = await fetch(url);
  if (!response.ok) {
    console.warn("Failed to send company SMS", await response.text());
  }
}

export async function sendCompanyEmail(subject, message) {
  const to = process.env.SMTP_EMAIL || process.env.SMTP_USER;
  if (!to || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const smtpPort = parseInt(process.env.SMTP_PORT || "465");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: message,
    html: `<p>${message.replace(/\n/g, "<br />")}</p>`,
  });
}

export async function sendCompanyAlert({ subject, message }) {
  await Promise.allSettled([
    sendCompanySms(message),
    sendCompanyEmail(subject, message),
  ]);
}
