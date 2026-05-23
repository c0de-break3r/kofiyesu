export interface AdminNotifyPayload {
  inquiryType: string;
  message: string;
  userName?: string | null;
  userEmail?: string | null;
  intake?: Record<string, unknown> | null;
}

const formatIntake = (intake?: Record<string, unknown> | null): string => {
  if (!intake) return "";
  const lines = [
    intake.projectType && `Project type: ${intake.projectType}`,
    intake.timeline && `Timeline: ${intake.timeline}`,
    intake.budget && `Budget: ${intake.budget}`,
    intake.summary && `Summary: ${intake.summary}`,
    intake.urgent && "Marked urgent: yes",
  ].filter(Boolean);
  return lines.length ? `\n\nIntake\n${lines.join("\n")}` : "";
};

export async function notifyAdminUrgentInquiry(payload: AdminNotifyPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (!apiKey || !to) {
    if (!apiKey) console.warn("[notify] RESEND_API_KEY not set — skipping admin email");
    if (!to) console.warn("[notify] ADMIN_NOTIFY_EMAIL not set — skipping admin email");
    return false;
  }

  const from = process.env.ADMIN_NOTIFY_FROM?.trim() || "Kofiyesu <onboarding@resend.dev>";
  const visitor = [payload.userName, payload.userEmail].filter(Boolean).join(" · ") || "Unknown visitor";
  const subject = `[Kofiyesu] Urgent ${payload.inquiryType} inquiry`;

  const html = `
    <h2>New urgent inquiry</h2>
    <p><strong>Visitor:</strong> ${escapeHtml(visitor)}</p>
    <p><strong>Type:</strong> ${escapeHtml(payload.inquiryType)}</p>
    <pre style="white-space:pre-wrap;font-family:monospace">${escapeHtml(payload.message)}</pre>
    ${formatIntake(payload.intake) ? `<pre style="white-space:pre-wrap">${escapeHtml(formatIntake(payload.intake))}</pre>` : ""}
    <p><a href="https://kofiyesu.com">Open site admin panel</a></p>
  `.trim();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[notify] Resend failed", res.status, err.slice(0, 400));
      return false;
    }

    return true;
  } catch (err) {
    console.error("[notify] Resend error", err);
    return false;
  }
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
