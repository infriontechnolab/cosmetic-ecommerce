import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * POST /api/contact
 * Sends a contact form submission to the admin email via Resend.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = (await req.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("[contact] RESEND_API_KEY not set — contact form submission not emailed");
      return NextResponse.json({ success: true });
    }

    const adminEmail = (process.env.ADMIN_EMAILS ?? "").split(",")[0].trim();
    if (!adminEmail) {
      console.warn("[contact] No ADMIN_EMAILS set — contact form submission not emailed");
      return NextResponse.json({ success: true });
    }

    const from = process.env.EMAIL_FROM ?? "MAISON <orders@maison.store>";
    const subjectLine = subject?.trim()
      ? `[Contact] ${subject.trim()}`
      : `[Contact] Message from ${name.trim()}`;

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from,
      to: adminEmail,
      replyTo: email.trim(),
      subject: subjectLine,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;background:#0a0a0a;color:#d4d4d4;">
          <h2 style="margin:0 0 24px;font-size:18px;color:#f5f5f5;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#737373;width:100px;vertical-align:top;">Name</td>
              <td style="padding:8px 0;font-size:14px;color:#f5f5f5;font-weight:600;">${name.trim()}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#737373;vertical-align:top;">Email</td>
              <td style="padding:8px 0;font-size:14px;color:#00C170;">
                <a href="mailto:${email.trim()}" style="color:#00C170;">${email.trim()}</a>
              </td>
            </tr>
            ${subject?.trim() ? `
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#737373;vertical-align:top;">Subject</td>
              <td style="padding:8px 0;font-size:14px;color:#d4d4d4;">${subject.trim()}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#737373;vertical-align:top;">Message</td>
              <td style="padding:12px 0 8px;font-size:14px;color:#d4d4d4;line-height:1.6;white-space:pre-wrap;">${message.trim()}</td>
            </tr>
          </table>
          <p style="margin:24px 0 0;font-size:11px;color:#525252;border-top:1px solid #1e1e1e;padding-top:16px;">
            Reply to this email to respond directly to ${name.trim()}.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
