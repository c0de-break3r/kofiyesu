import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { t } from "@/i18n/en";
import { inquiryRoutes, type InquiryType } from "@/content/contact";
import {
  type ChatIntakeData,
  type IntakeBudget,
  type IntakeTimeline,
  intakeBudgetLabels,
  intakeTimelineLabels,
} from "@/lib/chatIntake";
import { clearIntakeDraft, loadIntakeDraft, saveIntakeDraft } from "@/lib/intakeDraft";

interface Props {
  onComplete: (payload: ChatIntakeData) => void;
}

export function ChatIntakeFlow({ onComplete }: Props) {
  const draft = loadIntakeDraft();
  const [step, setStep] = useState(draft?.step ?? 0);
  const [projectType, setProjectType] = useState<InquiryType | null>(draft?.projectType ?? null);
  const [timeline, setTimeline] = useState<IntakeTimeline | null>(draft?.timeline ?? null);
  const [budget, setBudget] = useState<IntakeBudget | null>(draft?.budget ?? null);
  const [summary, setSummary] = useState(draft?.summary ?? "");
  const [urgent, setUrgent] = useState(draft?.urgent ?? false);

  useEffect(() => {
    saveIntakeDraft({ step, projectType, timeline, budget, summary, urgent });
  }, [step, projectType, timeline, budget, summary, urgent]);

  const timelines = Object.entries(intakeTimelineLabels) as [IntakeTimeline, string][];
  const budgets = Object.entries(intakeBudgetLabels) as [IntakeBudget, string][];

  const submit = () => {
    if (!projectType || !timeline || summary.trim().length < 12) return;
    clearIntakeDraft();
    onComplete({ projectType, timeline, budget, summary: summary.trim(), urgent });
  };

  const progress = ((step + 1) / 4) * 100;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          <span>{t("intake-step", { current: step + 1, total: 4 })}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">{t("intake-type-title")}</h2>
          <p className="text-sm text-[var(--text-muted)]">{t("intake-type-hint")}</p>
          <div className="grid gap-2">
            {inquiryRoutes
              .filter((r) => r.id !== "general")
              .map((route) => (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => {
                    setProjectType(route.id);
                    setStep(1);
                  }}
                  className="rounded-xl border border-[var(--border)] p-3 text-left transition hover:border-[var(--color-accent)]"
                >
                  <span className="block font-bold">{route.label}</span>
                  <span className="text-xs text-[var(--text-muted)]">{route.description}</span>
                </button>
              ))}
            <button
              type="button"
              onClick={() => {
                setProjectType("general");
                setStep(1);
              }}
              className="rounded-xl border border-[var(--border)] p-3 text-left font-bold"
            >
              {t("intake-type-general")}
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">{t("intake-timeline-title")}</h2>
          <div className="flex flex-wrap gap-2">
            {timelines.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTimeline(value);
                  setStep(2);
                }}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:border-[var(--color-accent)]"
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="text-sm font-semibold text-[var(--text-muted)]" onClick={() => setStep(0)}>
            {t("intake-back")}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">{t("intake-budget-title")}</h2>
          <p className="text-sm text-[var(--text-muted)]">{t("intake-budget-hint")}</p>
          <div className="flex flex-wrap gap-2">
            {budgets.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setBudget(value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${budget === value ? "border-[var(--color-accent)]" : "border-[var(--border)]"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="text-sm font-semibold text-[var(--text-muted)]" onClick={() => setStep(1)}>
              {t("intake-back")}
            </button>
            <Button variant="border" onClick={() => setStep(3)}>
              {t("intake-skip")}
            </Button>
            <Button onClick={() => setStep(3)}>{t("intake-continue")}</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">{t("intake-details-title")}</h2>
          <p className="text-sm text-[var(--text-muted)]">{t("intake-details-hint")}</p>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            placeholder={t("intake-details-placeholder")}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm"
          />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
            {t("intake-urgent")}
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="text-sm font-semibold text-[var(--text-muted)]" onClick={() => setStep(2)}>
              {t("intake-back")}
            </button>
            <Button disabled={summary.trim().length < 12} onClick={submit}>
              {t("intake-submit")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
