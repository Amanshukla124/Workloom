import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const DEMO_INBOX =
  process.env.DEMO_REQUEST_EMAIL ?? "hello@workloom.io";

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? '"Workloom" <hello@workloom.io>';

interface DemoRequestBody {
  fullName: string;
  workEmail: string;
  company: string;
  jobTitle: string;
  teamSize?: string;
  message?: string;
}

function validateBody(body: unknown): body is DemoRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.fullName !== "string" || b.fullName.trim().length < 2) return false;
  if (typeof b.workEmail !== "string") return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.workEmail.trim())) return false;
  if (typeof b.company !== "string" || b.company.trim().length < 1) return false;
  if (typeof b.jobTitle !== "string" || b.jobTitle.trim().length < 1) return false;
  return true;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      }),
      provider: "SMTP" as const,
    };
  }

  if (process.env.RESEND_API_KEY) {
    return {
      transporter: nodemailer.createTransport({
        host: "smtp.resend.com",
        port: 587,
        secure: false,
        auth: { user: "resend", pass: process.env.RESEND_API_KEY },
      }),
      provider: "RESEND" as const,
    };
  }

  const testAccount = await nodemailer.createTestAccount();
  return {
    transporter: nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    }),
    provider: "ETHEREAL" as const,
  };
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();

    if (!validateBody(raw)) {
      return NextResponse.json(
        { error: "Please provide all required fields with a valid work email." },
        { status: 400 }
      );
    }

    const body: DemoRequestBody = raw;
    const { transporter, provider } = await getTransporter();

    const teamSizeRow = body.teamSize
      ? `<div class="field"><div class="label">Team Size</div><div class="value">${escapeHtml(body.teamSize)}</div></div>`
      : "";
    const messageRow = body.message
      ? `<hr class="divider"><div class="field"><div class="label">What they'd like to solve</div><div class="value">${escapeHtml(body.message)}</div></div>`
      : "";

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#141316;background:#F7F6F3;margin:0;padding:0}
.container{max-width:560px;margin:32px auto;background:#FFFFFF;border:1px solid #E2DED6;border-radius:8px;overflow:hidden}
.header{background:#141316;color:#fff;padding:24px 28px}
.header h1{margin:0;font-size:18px;font-weight:600;letter-spacing:-.02em}
.header p{margin:4px 0 0;font-size:12px;color:#8B8791;letter-spacing:.04em;text-transform:uppercase}
.body{padding:28px}
.field{margin-bottom:18px}
.label{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#8B8791;margin-bottom:4px}
.value{font-size:14px;color:#141316}
.divider{border:none;border-top:1px solid #E2DED6;margin:20px 0}
.footer{padding:16px 28px;background:#F7F6F3;border-top:1px solid #E2DED6;font-size:11px;color:#8B8791}
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>New Demo Request &middot; Workloom</h1>
    <p>Submitted via workloom.io</p>
  </div>
  <div class="body">
    <div class="field"><div class="label">Full Name</div><div class="value">${escapeHtml(body.fullName)}</div></div>
    <div class="field"><div class="label">Work Email</div><div class="value">${escapeHtml(body.workEmail)}</div></div>
    <div class="field"><div class="label">Company</div><div class="value">${escapeHtml(body.company)}</div></div>
    <div class="field"><div class="label">Job Title / Role</div><div class="value">${escapeHtml(body.jobTitle)}</div></div>
    ${teamSizeRow}${messageRow}
  </div>
  <div class="footer">Sent via Workloom landing page &middot; Provider: ${provider}</div>
</div>
</body></html>`;

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: DEMO_INBOX,
      replyTo: body.workEmail,
      subject: `Demo Request — ${body.fullName} (${body.company})`,
      html,
      text: `New demo request\n\nName: ${body.fullName}\nEmail: ${body.workEmail}\nCompany: ${body.company}\nRole: ${body.jobTitle}\nTeam size: ${body.teamSize ?? "—"}\n\nMessage:\n${body.message ?? "—"}`,
    });

    const previewUrl =
      provider === "ETHEREAL"
        ? nodemailer.getTestMessageUrl(info) || null
        : null;

    return NextResponse.json({
      success: true,
      message: "Your demo request has been received. We'll be in touch shortly.",
      ...(previewUrl ? { _dev_preview: previewUrl } : {}),
    });
  } catch (err) {
    console.error("[demo-request] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or email us directly." },
      { status: 500 }
    );
  }
}
