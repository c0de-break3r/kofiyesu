import type { InquiryType } from "../content/contact";
import type { ChatIntakeData } from "./chatIntake";

export interface SubmitInquiryOptions {
  inquiryType: InquiryType;
  message: string;
  needsAdmin?: boolean;
  intake?: ChatIntakeData | null;
  userEmail?: string | null;
  userName?: string | null;
  getToken: () => Promise<string | null>;
}

export const submitInquiry = async ({
  inquiryType,
  message,
  needsAdmin = false,
  intake,
  userEmail,
  userName,
  getToken,
}: SubmitInquiryOptions): Promise<{ ok: boolean; notified?: boolean }> => {
  const token = await getToken();
  if (!token) return { ok: false };

  try {
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inquiryType,
        message,
        needsAdmin,
        userEmail,
        userName,
        intake: intake ?? null,
      }),
    });

    if (!res.ok) return { ok: false };

    const data = (await res.json()) as { notified?: boolean };
    return { ok: true, notified: data.notified };
  } catch {
    return { ok: false };
  }
};
