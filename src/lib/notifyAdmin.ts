export interface AdminNotifyPayload {
  inquiryType: string;
  message: string;
  userName?: string | null;
  userEmail?: string | null;
  intake?: Record<string, unknown> | null;
  urgent?: boolean;
}

const intakeBudgetLabels: Record<string, string> = {
  "7k-15k": "$7k – $15k",
  "15k-25k": "$15k – $25k",
  "25k-35k": "$25k – $35k",
  "35k-50k": "$35k – $50k",
  "50k-plus": "$50k+",
  flexible: "Flexible",
  private: "Prefer not to say",
};

const formatIntake = (intake?: Record<string, unknown> | null): string => {
  if (!intake) return "";
  const budgetKey = intake.budget ? String(intake.budget) : "";
  const budgetLabel = budgetKey ? (intakeBudgetLabels[budgetKey] ?? budgetKey) : "";
  const lines = [
    intake.projectType && `Project type: ${intake.projectType}`,
    intake.timeline && `Timeline: ${intake.timeline}`,
    budgetLabel && `Budget: ${budgetLabel}`,
    intake.summary && `Summary: ${intake.summary}`,
    intake.urgent && "Marked urgent: yes",
  ].filter(Boolean);
  return lines.length ? `\n\nIntake\n${lines.join("\n")}` : "";
};

export async function notifyAdminInquiry(payload: AdminNotifyPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (!apiKey || !to) {
    if (!apiKey) console.warn("[notify] RESEND_API_KEY not set — skipping admin email");
    if (!to) console.warn("[notify] ADMIN_NOTIFY_EMAIL not set — skipping admin email");
    return false;
  }

  const from = process.env.ADMIN_NOTIFY_FROM?.trim() || "Kofiyesu <onboarding@resend.dev>";
  const visitor = [payload.userName, payload.userEmail].filter(Boolean).join(" · ") || "Unknown visitor";
  const urgentTag = payload.urgent ? "Urgent " : "";
  const subject = `[Kofiyesu] ${urgentTag}${payload.inquiryType} inquiry`;

  const html = `
    <h2>New inbox inquiry${payload.urgent ? " (urgent)" : ""}</h2>
    <p><strong>Visitor:</strong> ${escapeHtml(visitor)}</p>
    <p><strong>Type:</strong> ${escapeHtml(payload.inquiryType)}</p>
    <pre style="white-space:pre-wrap;font-family:monospace">${escapeHtml(payload.message)}</pre>
    ${formatIntake(payload.intake) ? `<pre style="white-space:pre-wrap">${escapeHtml(formatIntake(payload.intake))}</pre>` : ""}
    <p><a href="https://kofiyesu.com">Open site → Admin CMS → Inquiries</a></p>
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

/** @deprecated use notifyAdminInquiry */
export async function notifyAdminUrgentInquiry(payload: AdminNotifyPayload): Promise<boolean> {
  return notifyAdminInquiry({ ...payload, urgent: true });
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
