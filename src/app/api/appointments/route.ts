import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { practiceId, patientName, email, phone, preferredDate, preferredTime, reason } = body;

    // Validate required fields
    if (!practiceId || !patientName || !email) {
      return NextResponse.json(
        { error: "Missing required fields: practiceId, patientName, email" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Insert appointment request
    const { data: appointment, error: insertError } = await supabase
      .from("appointment_requests")
      .insert({
        practice_id: practiceId,
        patient_name: patientName,
        email,
        phone: phone || null,
        preferred_date: preferredDate || null,
        preferred_time: preferredTime || null,
        reason: reason || null,
        status: "new",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to insert appointment request:", insertError);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    // Look up practice contact email for notification
    const { data: practice } = await supabase
      .from("practices")
      .select("practice_name, owner_email")
      .eq("id", practiceId)
      .single();

    const { data: location } = await supabase
      .from("locations")
      .select("email")
      .eq("practice_id", practiceId)
      .limit(1)
      .maybeSingle();

    const recipientEmail = practice?.owner_email || location?.email;

    // Send email notification if we have a recipient and Resend is configured
    if (recipientEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Santelis Health <appointments@santelishealth.com>",
          to: recipientEmail,
          subject: `New Appointment Request — ${patientName}`,
          html: `
            <h2>New Appointment Request</h2>
            <p>A new appointment request was submitted for <strong>${practice?.practice_name || "your practice"}</strong>.</p>
            <table style="border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;font-weight:bold;">Name:</td><td style="padding:8px;">${patientName}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;">${email}</td></tr>
              ${phone ? `<tr><td style="padding:8px;font-weight:bold;">Phone:</td><td style="padding:8px;">${phone}</td></tr>` : ""}
              ${preferredDate ? `<tr><td style="padding:8px;font-weight:bold;">Preferred Date:</td><td style="padding:8px;">${preferredDate}</td></tr>` : ""}
              ${preferredTime ? `<tr><td style="padding:8px;font-weight:bold;">Preferred Time:</td><td style="padding:8px;">${preferredTime}</td></tr>` : ""}
              ${reason ? `<tr><td style="padding:8px;font-weight:bold;">Reason:</td><td style="padding:8px;">${reason}</td></tr>` : ""}
            </table>
            <p><a href="https://santelishealth.com/dashboard">View in Dashboard</a></p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send notification email:", emailErr);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, id: appointment.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
