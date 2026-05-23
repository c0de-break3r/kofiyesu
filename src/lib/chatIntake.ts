import type { InquiryType } from "../content/contact";

export type IntakeTimeline = "asap" | "1-3-months" | "3-plus-months" | "exploring";
export type IntakeBudget = "under-5k" | "5k-15k" | "15k-plus" | "flexible" | "private";

export interface ChatIntakeData {
  projectType: InquiryType;
  timeline: IntakeTimeline;
  budget: IntakeBudget | null;
  summary: string;
  urgent: boolean;
}

export const INTAKE_SESSION_KEY = "kofiyesu-chat-intake-done";

export const intakeTimelineLabels: Record<IntakeTimeline, string> = {
  asap: "ASAP / within weeks",
  "1-3-months": "1–3 months",
  "3-plus-months": "3+ months",
  exploring: "Just exploring",
};

export const intakeBudgetLabels: Record<IntakeBudget, string> = {
  "under-5k": "Under $5k",
  "5k-15k": "$5k – $15k",
  "15k-plus": "$15k+",
  flexible: "Flexible",
  private: "Prefer not to say",
};

export const intakeNeedsAdmin = (intake: ChatIntakeData): boolean => {
  if (intake.urgent) return true;
  if (intake.timeline === "asap" && (intake.projectType === "security" || intake.projectType === "collaboration")) {
    return true;
  }
  return false;
};

export const formatIntakeMessage = (intake: ChatIntakeData): string => {
  const budget = intake.budget ? intakeBudgetLabels[intake.budget] : "Not specified";
  return [
    "Project intake",
    `Type: ${intake.projectType}`,
    `Timeline: ${intakeTimelineLabels[intake.timeline]}`,
    `Budget: ${budget}`,
    intake.urgent ? "Urgent: yes" : null,
    "",
    intake.summary,
  ]
    .filter((line) => line !== null)
    .join("\n");
};

export const intakeContextForAi = (intake: ChatIntakeData): string =>
  `Visitor completed project intake: type=${intake.projectType}, timeline=${intake.timeline}, budget=${intake.budget ?? "unspecified"}, urgent=${intake.urgent}. Summary: ${intake.summary}`;
