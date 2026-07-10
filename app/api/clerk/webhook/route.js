import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureAutoSysadminMetadata } from "@/lib/autoApproval";
import { sendCompanyAlert } from "@/lib/companyAlert";

function primaryEmail(user) {
  const primaryId = user.primary_email_address_id;
  const primary = user.email_addresses?.find((email) => email.id === primaryId);
  return primary?.email_address || user.email_addresses?.[0]?.email_address || "No email";
}

function fullName(user) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name || user.username || "New user";
}

function primaryPhone(user) {
  const primaryId = user.primary_phone_number_id;
  const primary = user.phone_numbers?.find((phone) => phone.id === primaryId);
  return primary?.phone_number || user.phone_numbers?.[0]?.phone_number || "No phone";
}

export async function POST(request) {
  let event;

  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ received: true });
  }

  const user = event.data;
  const name = fullName(user);
  const email = primaryEmail(user);
  const phone = primaryPhone(user);
  const createdAt = user.created_at ? new Date(user.created_at).toISOString() : "Unknown";
  const client = await clerkClient();

  await ensureAutoSysadminMetadata(client, user);

  await sendCompanyAlert({
    subject: `New user signup needs approval: ${name}`,
    message: [
      "New user signup needs approval",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Clerk ID: ${user.id}`,
      `Created: ${createdAt}`,
      "Open the admin users dashboard to review and approve this account.",
    ].join("\n"),
  });

  return NextResponse.json({ received: true });
}
