import type { InquiryType } from "@/content/contact";

export type IntakeTimeline = "asap" | "1-3-months" | "3-plus-months" | "exploring";
export type IntakeBudget =
  | "7k-15k"
  | "15k-25k"
  | "25k-35k"
  | "35k-50k"
  | "50k-plus"
  | "flexible"
  | "private";

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
  "7k-15k": "$7k – $15k",
  "15k-25k": "$15k – $25k",
  "25k-35k": "$25k – $35k",
  "35k-50k": "$35k – $50k",
  "50k-plus": "$50k+",
  flexible: "Flexible",
  private: "Prefer not to say",
};

export const intakeBudgetOptions = Object.entries(intakeBudgetLabels) as [IntakeBudget, string][];

export function formatIntakeBudget(budget: IntakeBudget | null | undefined): string {
  if (!budget) return "Not specified";
  return intakeBudgetLabels[budget] ?? budget;
}

export const intakeNeedsAdmin = (intake: ChatIntakeData): boolean => {
  if (intake.urgent) return true;
  if (
    intake.timeline === "asap" &&
    (intake.projectType === "security" || intake.projectType === "collaboration")
  ) {
    return true;
  }
  return false;
};

export const formatIntakeMessage = (intake: ChatIntakeData): string => {
  return [
    "Project intake",
    `Type: ${intake.projectType}`,
    `Timeline: ${intakeTimelineLabels[intake.timeline]}`,
    `Budget: ${formatIntakeBudget(intake.budget)}`,
    intake.urgent ? "Urgent: yes" : null,
    "",
    intake.summary,
  ]
    .filter((line) => line !== null)
    .join("\n");
};

export const intakeContextForAi = (intake: ChatIntakeData): string =>
  `Visitor completed project intake: type=${intake.projectType}, timeline=${intake.timeline}, budget=${formatIntakeBudget(intake.budget)}, urgent=${intake.urgent}. Summary: ${intake.summary}`;
