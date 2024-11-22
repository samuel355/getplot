import axios from "axios";
import { NextResponse } from "next/server";

//send sms api
export async function POST(req) { 
  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      console.log('no phone number or message')
      //return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 });
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
      console.log('error occured sending sms')
      //return NextResponse.json({message: 'SMS sending error'})
    }

  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
