import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";
import ejs from "ejs";
import path from "path";
import { promises as fs } from "fs";
import nodemailer from "nodemailer";

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request) {
  try {
    const { propertyId, interestedUserId, message } = await request.json();

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("*, users(*)")
      .eq("id", propertyId)
      .single();

    if (propertyError) throw propertyError;

    // Get interested user details
    const { data: interestedUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", interestedUserId)
      .single();

    if (userError) throw userError;

    // Create notification in database
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

    // Read template file
    const templatePath = path.join(
      process.cwd(),
      "app/api/admin/email-templates/property-interest.ejs"
    );
    const template = await fs.readFile(templatePath, "utf-8");

    // Compile template with data
    const html = ejs.render(template, {
      firstName: property.users.first_name || property.users.username,
      interestedUser,
      message,
      propertyId,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      year: new Date().getFullYear(),
    });

    // Send email notification to property owner
    await transporter.sendMail({
      from: `"Get One Plot" <${process.env.EMAIL_FROM}>`,
      to: property.users.email,
      subject: `New Interest in Your Property: ${property.title}`,
      html,
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Error in notify-interest:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
