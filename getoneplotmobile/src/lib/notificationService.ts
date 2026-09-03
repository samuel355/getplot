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
  streetName?: string;
  siteName: string;
  amount: number;
  isFullPayment: boolean;
  areaAcres?: string | number;
}) {
  const plotInfo = `Plot No. ${params.plotNo}${params.streetName ? ` ${params.streetName}` : ""} at ${params.siteName}`;
  const amountStr = formatGhs(params.amount);
  const officeInstructions =
    "Kindly make payment to either the dollar account or the cedis account and present your receipt at our Kumasi Dichemso office. You can also email your receipt to sales@getoneplot.com. Call 0322008282 / +233 54 855 4216 for assistance.";

  const smsMessage = params.isFullPayment
    ? `Hello ${params.firstname}, your purchase request for ${plotInfo} has been received. Amount due: ${amountStr}. ${officeInstructions}`
    : `Hello ${params.firstname}, your reservation request for ${plotInfo} has been received. Deposit required: ${amountStr}. ${officeInstructions}`;

  await sendArkeselSMS(params.phone, smsMessage);

  await sendEmailNotification({
    to: params.email,
    firstname: params.firstname,
    lastname: params.lastname,
    plotArea: params.siteName,
    amount: amountStr,
    plotDetails: `Plot Number ${params.plotNo}${params.streetName ? ` ${params.streetName}` : ""}`,
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
