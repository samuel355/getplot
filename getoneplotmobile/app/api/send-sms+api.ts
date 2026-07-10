export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return Response.json({ error: "Phone number and message are required" }, { status: 400 });
    }

    const apiKey = process.env.ARKESEL_SMS_API || process.env.EXPO_PUBLIC_ARKESEL_SMS_API;
    if (!apiKey) {
      console.warn("ARKESEL_SMS_API not configured");
      return Response.json({ error: "SMS is not configured" }, { status: 500 });
    }

    const sender = "GetOnePlot";
    const url = `https://sms.arkesel.com/sms/api?action=send-sms&api_key=${apiKey}&to=${phone}&from=${sender}&sms=${encodeURIComponent(
      message,
    )}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn("Failed to send SMS via Arkesel", await response.text());
      return Response.json({ error: "Failed to send SMS" }, { status: 502 });
    }

    return Response.json({ message: "SMS sent successfully" });
  } catch (error: any) {
    console.error("Error sending SMS (mobile API):", error);
    return Response.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
