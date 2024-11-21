import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {  // Explicitly export POST handler
  try {
    const { phone, message } = await req.json(); // Use req.json() to parse body

    if (!phone || !message) {
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 });
    }

    const apiKey = process.env.ARKESEL_SMS_API;
    const sender = "GetOnePlot";

    const url = `https://sms.arkesel.com/sms/api?action=send-sms&api_key=${apiKey}&to=${phone}&from=${sender}&sms=${encodeURIComponent(
      message
    )}`;

    const response = await axios.get(url);
    if(response.status === 200 && response.statusText === 'OK'){

      return NextResponse.json({message: 'SMS sent successfully'})
    }else{
      return NextResponse.json({message: 'SMS sending error'})
    }

  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// try {
//   const res = await fetch("/api/send-sms", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ phone: contactData.phone, message: contactData.message }),
//   });

//   const data = await res.json()
//   console.log(data.message)
//   setLoading(false);
// } catch (error) {
//   setLoading(false);
//   console.log(error);
// }