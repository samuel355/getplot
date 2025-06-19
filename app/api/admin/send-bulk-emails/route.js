import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { promises as fs } from "fs";

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function POST(request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { properties, action, reason } = await request.json();

    if (!properties || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get template path based on action
    const templatePath = path.join(
      process.cwd(),
      `app/api/admin/email-templates/property-${action}.ejs`
    );

    // Read template file
    const template = await fs.readFile(templatePath, "utf-8");

    // Send emails in batches of 5
    const batchSize = 5;
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (property) => {
          // Compile template with data
          const html = ejs.render(template, {
            propertyTitle: property.title,
            reason,
            appUrl: process.env.NEXT_PUBLIC_APP_URL,
          });

          // Send email
          await transporter.sendMail({
            from: `"Property Manager" <${process.env.EMAIL_FROM}>`,
            to: property.user.email,
            subject:
              action === "approved"
                ? "Your Property Has Been Approved"
                : "Your Property Has Been Rejected",
            html,
          });
        })
      );

      // Add a small delay between batches to prevent rate limiting
      if (i + batchSize < properties.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
