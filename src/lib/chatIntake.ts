import type { InquiryType } from "@/content/contact";

export type IntakeTimeline = "asap" | "1-3-months" | "3-plus-months" | "exploring";
export type IntakeBudget = "under-5k" | "5k-15k" | "15k-plus" | "flexible" | "private";

export interface ChatIntakeData {
  projectType: InquiryType;
  timeline: IntakeTimeline;
  budget: IntakeBudget | null;
  summary: string;
  urgent: boolean;
}
