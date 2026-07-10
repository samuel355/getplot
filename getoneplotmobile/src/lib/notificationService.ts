import { Alert } from "react-native";
import { formatGhs } from "./plotService";
import { fetchMobileApi } from "./api";

/**
 * Sends an SMS by proxying through the mobile API's /api/send-sms route,
 * which holds the Arkesel API key server-side (never shipped in the app bundle).
 */
export async function sendArkeselSMS(phone: string, message: string) {
  try {
    await fetchMobileApi("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    });
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
  try {
    await fetchMobileApi("/api/plot/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
}

export async function sendCompanyAlert(payload: {
  subject: string;
  message: string;
}) {
  try {
    await fetchMobileApi("/api/company-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error sending company alert:", error);
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
  const officeInstructions =
    "Make payment to the Stanbic Bank account sent to your email and bring your receipt to our Kumasi Dichemso office to finalize the plot sale.";

  const smsMessage = params.isFullPayment
    ? `Hello ${params.firstname}, your purchase request for ${plotInfo} has been received. ${officeInstructions}`
    : `Hello ${params.firstname}, your reservation request for ${plotInfo} has been received. Deposit required: ${amountStr}. ${officeInstructions}`;

  await sendArkeselSMS(params.phone, smsMessage);

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

  await sendCompanyAlert({
    subject: params.isFullPayment
      ? `New plot purchase request: ${plotInfo}`
      : `New plot reservation request: ${plotInfo}`,
    message: [
      params.isFullPayment ? "New plot purchase request" : "New plot reservation request",
      `Client: ${params.firstname} ${params.lastname}`,
      `Phone: ${params.phone}`,
      `Email: ${params.email}`,
      `Plot: ${plotInfo}`,
      `Amount: ${amountStr}`,
      `Size: ${params.areaAcres || "N/A"}`,
      "Follow up and confirm bank receipt at the office.",
    ].join("\n"),
  });
}
