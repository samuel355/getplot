import { formatGhs } from "./plotService";
import { fetchMobileApi } from "./api";

/**
 * Sends an SMS by proxying through the mobile API's /api/send-sms route,
 * which holds the Arkesel API key server-side (never shipped in the app bundle).
 */
export async function sendArkeselSMS(phone: string, message: string) {
  await fetchMobileApi("/api/send-sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message }),
  });
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
  await fetchMobileApi("/api/plot/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function sendCompanyAlert(payload: {
  subject: string;
  message: string;
}) {
  await fetchMobileApi("/api/company-alert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export type PlotRequestNotification = {
  phone: string;
  email: string;
  firstname: string;
  lastname: string;
  country: string;
  residentialAddress: string;
  plotNo: string;
  streetName?: string;
  siteName: string;
  amount: number;
  isFullPayment: boolean;
  areaAcres?: string | number;
};

export async function sendPlotRequestEmail(params: PlotRequestNotification) {
  const amountStr = formatGhs(params.amount);
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
}

/** Sends the non-blocking follow-up notifications used after a request is accepted. */
export async function notifyPlotPurchaseSuccess(params: PlotRequestNotification) {
  const plotInfo = `Plot No. ${params.plotNo}${params.streetName ? ` ${params.streetName}` : ""} at ${params.siteName}`;
  const amountStr = formatGhs(params.amount);
  const officeInstructions =
    "Kindly make payment to either the dollar account or the cedis account and present your receipt at our Kumasi Dichemso office. You can also email your receipt to sales@getoneplot.com. Call 0322008282 / +233 54 855 4216 for assistance.";

  const smsMessage = params.isFullPayment
    ? `Hello ${params.firstname}, your purchase request for ${plotInfo} has been received. Amount due: ${amountStr}. ${officeInstructions}`
    : `Hello ${params.firstname}, your reservation request for ${plotInfo} has been received. Deposit required: ${amountStr}. ${officeInstructions}`;

  const [smsResult, alertResult] = await Promise.allSettled([
    sendArkeselSMS(params.phone, smsMessage),
    sendCompanyAlert({
      subject: params.isFullPayment
        ? `New plot purchase request: ${plotInfo}`
        : `New plot reservation request: ${plotInfo}`,
      message: [
        params.isFullPayment ? "New plot purchase request" : "New plot reservation request",
        `Client: ${params.firstname} ${params.lastname}`,
        `Phone: ${params.phone}`,
        `Email: ${params.email}`,
        `Country: ${params.country}`,
        `Plot: ${plotInfo}`,
        `Amount: ${amountStr}`,
        `Size: ${params.areaAcres || "N/A"}`,
        `Address: ${params.residentialAddress || "N/A"}`,
        "Follow up and confirm bank receipt at the office.",
      ].join("\n"),
    }),
  ]);
  if (smsResult.status === "rejected") console.error("Plot request SMS failed:", smsResult.reason);
  if (alertResult.status === "rejected") console.error("Plot request company alert failed:", alertResult.reason);
}

export async function sendInterestConfirmation(params: {
  phone: string;
  firstname: string;
  plotNo: string;
  siteName: string;
}) {
  await sendArkeselSMS(
    params.phone,
    `Hi ${params.firstname}, thank you for your interest in Plot No. ${params.plotNo} at ${params.siteName}. Our team will contact you shortly. Call 0322008282 / +233 54 855 4216 for immediate assistance.`,
  );
}

export async function notifyPlotCartSuccess(params: {
  phone: string;
  email: string;
  firstname: string;
  lastname: string;
  country: string;
  residentialAddress: string;
  amount: number;
  plots: Array<{ plotNo: string; streetName?: string; siteName: string; plotSize: string; amount: number }>;
}) {
  const amount = formatGhs(params.amount);
  const plotDetails = params.plots
    .map(({ plotNo, streetName, siteName }) => `${plotNo}${streetName ? ` ${streetName}` : ""} at ${siteName}`)
    .join("; ");
  const [smsResult, alertResult] = await Promise.allSettled([
    sendArkeselSMS(
      params.phone,
      `Hello ${params.firstname}, your purchase request for ${params.plots.length} plot(s) has been received. Total amount due: ${amount}. Kindly pay to either bank account in your email and present the receipt at our Kumasi Dichemso office. Call 0322008282 / +233 54 855 4216 for assistance.`,
    ),
    sendCompanyAlert({
      subject: `New cart plot purchase request: ${params.plots.length} plot(s)`,
      message: [
        "New cart plot purchase request",
        `Client: ${params.firstname} ${params.lastname}`,
        `Phone: ${params.phone}`,
        `Email: ${params.email}`,
        `Country: ${params.country}`,
        `Total: ${amount}`,
        `Plots: ${plotDetails}`,
        `Address: ${params.residentialAddress || "N/A"}`,
        "Follow up and confirm bank receipt at the office.",
      ].join("\n"),
    }),
  ]);
  if (smsResult.status === "rejected") console.error("Cart purchase SMS failed:", smsResult.reason);
  if (alertResult.status === "rejected") console.error("Cart purchase company alert failed:", alertResult.reason);
}

export async function sendPlotCartEmail(params: {
  email: string;
  firstname: string;
  lastname: string;
  amount: number;
  plots: Array<{ plotNo: string; streetName?: string; siteName: string; plotSize: string; amount: number }>;
}) {
  const sites = [...new Set(params.plots.map((plot) => plot.siteName))].join(", ");
  const details = params.plots
    .map((plot) => `Plot ${plot.plotNo}${plot.streetName ? ` — ${plot.streetName}` : ""} (${plot.siteName}, ${formatGhs(plot.amount)})`)
    .join(" • ");
  const sizes = params.plots.map((plot) => `Plot ${plot.plotNo}: ${plot.plotSize}`).join(" • ");
  await sendEmailNotification({
    to: params.email,
    firstname: params.firstname,
    lastname: params.lastname,
    plotArea: sites,
    amount: formatGhs(params.amount),
    plotDetails: details,
    plotSize: sizes,
    type: "buy",
  });
}
