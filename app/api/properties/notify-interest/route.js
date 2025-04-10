import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { propertyId, interestedUserId, message } = await request.json();

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*, users(*)')
      .eq('id', propertyId)
      .single();

    if (propertyError) throw propertyError;

    // Get interested user details
    const { data: interestedUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', interestedUserId)
      .single();

    if (userError) throw userError;

    // Create notification in database
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        type: 'property_interest',
        user_id: property.user_id,
        property_id: propertyId,
        message: `New interest in your property: ${property.title}`,
        metadata: {
          interested_user: interestedUser,
          message: message
        }
      })
      .select()
      .single();

    if (notificationError) throw notificationError;

    // Send email notification to property owner
    await resend.emails.send({
      from: "notifications@yourdomain.com",
      to: property.users.email,
      subject: `New Interest in Your Property: ${property.title}`,
      html: `
        <h2>New Interest in Your Property</h2>
        <p>Someone has shown interest in your property "${property.title}".</p>
        <p><strong>From:</strong> ${interestedUser.first_name} ${interestedUser.last_name}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Contact Email:</strong> ${interestedUser.email}</p>
        <p>You can view and manage this interest in your dashboard.</p>
        <p>Best regards,<br>Your Property Team</p>
      `
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Error in notify-interest:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 