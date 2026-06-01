export interface ProjectQuoteLineItem {
  label: string;
  amountGhs: number;
  note?: string;
}

export interface ProjectQuote {
  projectTitle: string;
  summary: string;
  requirements: string[];
  passThroughCosts: ProjectQuoteLineItem[];
  laborGhs: number;
  totalGhs: number;
  depositGhs?: number;
}

export const PROJECT_QUOTE_MIN_GHS = 100;
export const PROJECT_QUOTE_MAX_GHS = 150_000;

export function normalizeProjectQuote(raw: ProjectQuote): ProjectQuote {
  const passThrough = (raw.passThroughCosts ?? []).map((item) => ({
    label: String(item.label ?? "").trim(),
    amountGhs: Math.max(0, Math.round(Number(item.amountGhs) || 0)),
    note: item.note?.trim() || undefined,
  }));

  const laborGhs = Math.max(0, Math.round(Number(raw.laborGhs) || 0));
  const passThroughTotal = passThrough.reduce((sum, item) => sum + item.amountGhs, 0);
  const totalGhs = laborGhs + passThroughTotal;

  let depositGhs = raw.depositGhs != null ? Math.round(Number(raw.depositGhs)) : undefined;
  if (depositGhs != null) {
    depositGhs = Math.min(Math.max(depositGhs, PROJECT_QUOTE_MIN_GHS), totalGhs);
  }

  return {
    projectTitle: String(raw.projectTitle ?? "").trim(),
    summary: String(raw.summary ?? "").trim(),
    requirements: (raw.requirements ?? [])
      .map((r) => String(r).trim())
      .filter(Boolean)
      .slice(0, 20),
    passThroughCosts: passThrough.filter((item) => item.label),
    laborGhs,
    totalGhs,
    depositGhs,
  };
}

export function isValidProjectQuote(quote: ProjectQuote): boolean {
  if (!quote.projectTitle || quote.requirements.length === 0) return false;
  if (quote.laborGhs < PROJECT_QUOTE_MIN_GHS) return false;
  if (quote.totalGhs < quote.laborGhs || quote.totalGhs > PROJECT_QUOTE_MAX_GHS) return false;
  if (quote.depositGhs != null && (quote.depositGhs < PROJECT_QUOTE_MIN_GHS || quote.depositGhs > quote.totalGhs)) {
    return false;
  }
  return true;
}

export function parseProjectQuote(raw: unknown): ProjectQuote | null {
  if (!raw || typeof raw !== "object") return null;
  try {
    const normalized = normalizeProjectQuote(raw as ProjectQuote);
    return isValidProjectQuote(normalized) ? normalized : null;
  } catch {
    return null;
  }
}

export function paymentDescriptionFromQuote(quote: ProjectQuote): string {
  const req = quote.requirements.slice(0, 6).join("; ");
  return [quote.summary, req ? `Requirements: ${req}` : ""].filter(Boolean).join(" — ").slice(0, 500);
}
