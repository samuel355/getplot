import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";
import ejs from "ejs";
import path from "path";
import { promises as fs } from "fs";
import nodemailer from "nodemailer";

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
    // Verify that the user is an admin
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);
    const userRole = user?.publicMetadata?.role;

    if (userRole !== "admin" && userRole !== "sysadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get data from request
    const { propertyId, propertyOwnerId, emailType, rejectionReason } =
      await request.json();

    if (!propertyId || !propertyOwnerId || !emailType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get property owner details
    const propertyOwner = await clerkClient.users.getUser(propertyOwnerId);

    if (!propertyOwner) {
      return NextResponse.json(
        { error: "Property owner not found" },
        { status: 404 },
      );
    }

    // Get template path based on email type
    let templatePath;
    let subject;

    switch (emailType) {
      case "property-approved":
        templatePath = path.join(
          process.cwd(),
          "app/api/admin/email-templates/property-approved.ejs",
        );
        subject = "Your Property Listing Has Been Approved!";
        break;
      case "property-rejected":
        templatePath = path.join(
          process.cwd(),
          "app/api/admin/email-templates/property-rejected.ejs",
        );
        subject = "Update on Your Property Listing";
        break;
      case "user-banned":
        templatePath = path.join(
          process.cwd(),
          "app/api/admin/email-templates/user-banned.ejs",
        );
        subject = "Important: Your Account Has Been Suspended";
        break;

      case "user-unbanned":
        templatePath = path.join(
          process.cwd(),
          "app/api/admin/email-templates/user-unbanned.ejs",
        );
        subject = "Good News: Your Account Has Been Restored";
        break;
      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 },
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
    });

    // Send email
    await transporter.sendMail({
      from: `"Property Manager" <${process.env.EMAIL_FROM}>`,
      to: propertyOwner.emailAddresses[0].emailAddress,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
