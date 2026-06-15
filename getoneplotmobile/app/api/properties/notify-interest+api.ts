import { supabase } from "../../../src/lib/supabase";
import ejs from "ejs";
import path from "path";
import { promises as fs } from "fs";
import nodemailer from "nodemailer";

const INLINE_TEMPLATE = `
<h2>New Property Inquiry</h2>
<p><strong>Property:</strong> <%= propertyTitle %></p>
<p><strong>From:</strong> <%= name %> (<%= email %>)</p>
<% if (phone) { %><p><strong>Phone:</strong> <%= phone %></p><% } %>
<p><strong>Message:</strong> <%= message %></p>
`;

async function loadTemplate(): Promise<string> {
  try {
    const templatePath = path.resolve("src/api/templates", "property-interest.ejs");
    return await fs.readFile(templatePath, "utf-8");
  } catch {
    return INLINE_TEMPLATE;
  }
}

export async function POST(request: Request) {
  try {
    const { propertyId, name, email, phone, message } = await request.json();

    if (!propertyId || !name || !email || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, title, user_id")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    // Record the inquiry in Supabase
    await supabase.from("property_inquiries").insert([
      {
        property_id: propertyId,
        name,
        email,
        phone: phone || null,
        message,
        created_at: new Date().toISOString(),
      },
    ]);

    // Send email notification via SMTP
    const template = await loadTemplate();
    const html = ejs.render(template, {
      propertyTitle: property.title,
      name,
      email,
      phone,
      message,
      propertyId,
      appUrl: process.env.EXPO_PUBLIC_APP_URL || "",
      year: new Date().getFullYear(),
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Get One Plot" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: process.env.SMTP_EMAIL,
      subject: `New Inquiry: ${property.title}`,
      html,
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Error in notify-interest (mobile API):", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
