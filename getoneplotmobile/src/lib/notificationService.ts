import { Alert } from "react-native";
import { formatGhs } from "./plotService";

/**
 * Sends an SMS via the Arkesel API.
 * Uses environment variable EXPO_PUBLIC_ARKESEL_SMS_API
 */
export async function sendArkeselSMS(phone: string, message: string) {
  const apiKey = process.env.EXPO_PUBLIC_ARKESEL_SMS_API;
  if (!apiKey) {
    console.warn("ARKESEL_SMS_API not configured");
    return;
  }

  const sender = "GetOnePlot";
  const url = `https://sms.arkesel.com/sms/api?action=send-sms&api_key=${apiKey}&to=${phone}&from=${sender}&sms=${encodeURIComponent(
    message,
  )}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn("Failed to send SMS via Arkesel", await response.text());
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
}

/**
 * Notifies the mobile API to send a confirmation email.
 */
export async function sendEmailNotification(payload: {
  to: string;
  firstname: string;
  lastname: string;
  plotArea: string;
  amount: string;
  plotDetails: string;
  plotSize: string;
  type: "buy" | "reserve";
}) {
  const apiURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8081";
  try {
    const res = await fetch(`${apiURL}/api/plot/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn("Failed to send email notification", await res.text());
    }
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
}

/**
 * Standardized success notification flow for plots.
 */
export async function notifyPlotPurchaseSuccess(params: {
  phone: string;
  email: string;
  firstname: string;
  lastname: string;
  plotNo: string;
  siteName: string;
  amount: number;
  isFullPayment: boolean;
  areaAcres?: string | number;
}) {
  const plotInfo = `Plot ${params.plotNo}, ${params.siteName}`;
  const amountStr = formatGhs(params.amount);

  // 1. Send SMS via Arkesel
  const smsMessage = params.isFullPayment
    ? `Thank you ${params.firstname} for your purchase of ${plotInfo}. A confirmation email with plot details has been sent to ${params.email}.`
    : `Payment of ${amountStr} received for ${plotInfo}. Kindly complete payment to claim ownership. Check your email for details.`;

  await sendArkeselSMS(params.phone, smsMessage);

  // 2. Send Email via Mobile API (app/api/plot/notify)
  await sendEmailNotification({
    to: params.email,
    firstname: params.firstname,
    lastname: params.lastname,
    plotArea: params.siteName,
    amount: amountStr,
    plotDetails: `Plot Number ${params.plotNo}`,
    plotSize: params.areaAcres ? `${params.areaAcres}` : "N/A",
    type: params.isFullPayment ? "buy" : "reserve",
  });
}
