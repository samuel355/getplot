import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

type AlertRow = { label: string; value: string };

function parseAlertMessage(message: string): { intro: string | null; rows: AlertRow[]; note: string | null } {
  const lines = String(message)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const rows: AlertRow[] = [];
  const notes: string[] = [];
  let intro: string | null = null;

  for (const line of lines) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9 /]{0,40}):\s*(.*)$/);
    if (match) {
      rows.push({ label: match[1], value: match[2] });
    } else if (!intro && !rows.length) {
      intro = line;
    } else {
      notes.push(line);
    }
  }

  return { intro, rows, note: notes.join(" ") || null };
}

async function sendCompanySms(message: string) {
  const apiKey = process.env.ARKESEL_SMS_API || process.env.EXPO_PUBLIC_ARKESEL_SMS_API;
  const phone = process.env.COMPANY_NUMBER || "233548554216";

  if (!apiKey || !phone) return;

  const url = `https://sms.arkesel.com/sms/api?action=send-sms&api_key=${apiKey}&to=${phone}&from=GetOnePlot&sms=${encodeURIComponent(
    message,
  )}`;

  const response = await fetch(url);
  if (!response.ok) {
    console.warn("Failed to send company SMS", await response.text());
  }
}

async function sendCompanyEmail(subject: string, message: string) {
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

  let html = `<p>${message.replace(/\n/g, "<br />")}</p>`;
  try {
    const templatePath = path.resolve("src/api/templates", "company-alert.ejs");
    html = await ejs.renderFile(templatePath, { subject, ...parseAlertMessage(message) });
  } catch (error) {
    console.warn("Failed to render company alert template, falling back to plain email", error);
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: message,
    html,
  });
}

export async function POST(request: Request) {
  try {
    const { subject = "GetOnePlot activity alert", message } = await request.json();

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    await Promise.allSettled([
      sendCompanySms(message),
      sendCompanyEmail(subject, message),
    ]);

    return Response.json({ message: "Company alert sent" });
  } catch (error: any) {
    console.error("Error sending company alert (mobile API):", error);
    return Response.json(
      { error: "Failed to send company alert", details: error.message },
      { status: 500 },
    );
  }
}
