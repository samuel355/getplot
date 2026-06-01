import { supabase } from "../../../src/lib/supabase";
import ejs from "ejs";
import path from "path";
import { promises as fs } from "fs";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { propertyId, interestedUserId, message } = await request.json();

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("*, users(*)")
      .eq("id", propertyId)
      .single();

    if (propertyError) throw propertyError;

    const { data: interestedUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", interestedUserId)
      .single();

    if (userError) throw userError;

    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        type: "property_interest",
        user_id: property.user_id,
        property_id: propertyId,
        message: `New interest in your property: ${property.title}`,
        metadata: {
          interested_user: interestedUser,
          message: message,
        },
      })
      .select()
      .single();

    if (notificationError) throw notificationError;

    const templatePath = path.resolve(
      "src/api/templates",
      "property-interest.ejs"
    );
    const template = await fs.readFile(templatePath, "utf-8");

    const html = ejs.render(template, {
      firstName: property.users.first_name || property.users.username,
      interestedUser,
      message,
      propertyId,
      appUrl: process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:3000',
      year: new Date().getFullYear(),
    });

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Get One Plot" <${process.env.EMAIL_FROM}>`,
      to: property.users.email,
      subject: `New Interest in Your Property: ${property.title}`,
      html,
    });

    return Response.json({ success: true, notification });
  } catch (error: any) {
    console.error("Error in notify-interest (mobile API):", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
