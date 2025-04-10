import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import ejs from "ejs";
import path from "path";
import { promises as fs } from "fs";
import nodemailer from "nodemailer";

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
});

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(request) {
  try {
    // Get data from request
    const { property, userId, userRole, propertyId, propertyOwnerId, emailType, rejectionReason } =
      await request.json();

    // Verify that the user is an admin/sysadmin
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userRole !== "admin" && userRole !== "sysadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!propertyId || !propertyOwnerId || !emailType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get property owner details
    const propertyOwner = await clerkClient.users.getUser(propertyOwnerId);

    if (!propertyOwner) {
      return NextResponse.json(
        { error: "Property owner not found" },
        { status: 404 }
      );
    }

    // Get template path based on email type
    let templatePath;
    let subject;
    let title;

    switch (emailType) {
      case "property-approved":
        templatePath = path.join(
          process.cwd(),
          "app/api/admin/email-templates/property-approved.ejs"
        );
        subject = "Your Property Listing Has Been Approved!";
        title = "Good News!";
        break;
      case "property-rejected":
        templatePath = path.join(
          process.cwd(),
          "app/api/admin/email-templates/property-rejected.ejs"
        );
        subject = "Update on Your Property Listing";
        title = "Important Update";
        break;
      case "user-banned":
        templatePath = path.join(
          process.cwd(),
          "app/api/admin/email-templates/user-banned.ejs"
        );
        subject = "Important: Your Account Has Been Suspended";
        title = "Account Suspension Notice";
        break;
      case "user-unbanned":
        templatePath = path.join(
          process.cwd(),
          "app/api/admin/email-templates/user-unbanned.ejs"
        );
        subject = "Good News: Your Account Has Been Restored";
        title = "Account Restored";
        break;
      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        );
    }

    // Read template file
    const template = await fs.readFile(templatePath, "utf-8");

    // Compile template with data
    const html = ejs.render(template, {
      firstName: propertyOwner.firstName || propertyOwner.username,
      propertyId,
      rejectionReason,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      year: new Date().getFullYear(),
      title,
    });

    // Send email
    await transporter.sendMail({
      from: `"Get One Plot" <${process.env.EMAIL_FROM}>`,
      to: propertyOwner?.emailAddresses[0]?.emailAddress,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
