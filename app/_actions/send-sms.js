import { sendingMessage1 } from "../_constants/sms-message1";
import { sendingMessage2 } from "../_constants/sms-message2";
import { sendingMessage3 } from "../_constants/sms-message3";

export const sendSMS = async (phone, message1) => {
  try {
    // Send the first message
    const res1 = await fetch("/api/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone,
        message: message1,
      }),
    });
    const data1 = await res1.json();
    console.log("Message 1 sent:", data1.message);

    // Wait for 1.2 seconds
    setTimeout(async () => {
      // Send the second message
      const res2 = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone,
          message: sendingMessage2,
        }),
      });
      const data2 = await res2.json();
      console.log("Message 2 sent:", data2.message);

      // Wait another 1.2 seconds
      setTimeout(async () => {
        // Send the third message
        const res3 = await fetch("/api/send-sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phone,
            message: sendingMessage3,
          }),
        });
        const data3 = await res3.json();
        console.log("Message 3 sent:", data3.message);
      }, 1200);
    }, 1200);
  } catch (error) {
    console.error("Error sending messages:", error);
  }
};
