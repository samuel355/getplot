import { NextResponse } from "next/server";
import { sendCompanyAlert } from "@/lib/companyAlert";

export async function POST(request) {
  try {
    const { subject = "GetOnePlot activity alert", message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await sendCompanyAlert({ subject, message });

    return NextResponse.json({ message: "Company alert sent" });
  } catch (error) {
    console.error("Error sending company alert:", error);
    return NextResponse.json(
      { error: "Failed to send company alert", details: error.message },
      { status: 500 }
    );
  }
}
