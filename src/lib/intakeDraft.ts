import type { InquiryType } from "@/content/contact";
import type { ChatIntakeData, IntakeBudget, IntakeTimeline } from "@/lib/chatIntake";

export const INTAKE_DRAFT_KEY = "kofiyesu-intake-draft";

export type IntakeDraft = {
  step: number;
  projectType: InquiryType | null;
  timeline: IntakeTimeline | null;
  budget: IntakeBudget | null;
  summary: string;
  urgent: boolean;
};

export function loadIntakeDraft(): IntakeDraft | null {
  try {
    const raw = sessionStorage.getItem(INTAKE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IntakeDraft;
  } catch {
    return null;
  }
}

export function saveIntakeDraft(draft: IntakeDraft) {
  sessionStorage.setItem(INTAKE_DRAFT_KEY, JSON.stringify(draft));
}

export function clearIntakeDraft() {
  sessionStorage.removeItem(INTAKE_DRAFT_KEY);
}

export function draftToIntakeData(draft: IntakeDraft): ChatIntakeData | null {
  if (!draft.projectType || !draft.timeline || draft.summary.trim().length < 12) return null;
  return {
    projectType: draft.projectType,
    timeline: draft.timeline,
    budget: draft.budget,
    summary: draft.summary.trim(),
    urgent: draft.urgent,
  };
}
