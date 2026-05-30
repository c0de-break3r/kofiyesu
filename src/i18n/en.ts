export const en = {
  about: "About",
  home: "Home",
  chat: "Chat",
  projects: "Projects",
  contact: "Contact",
  "job-title": "Software Engineer & Cybersecurity Practitioner",
  location: "Ghana",
  "start-a-project": "Start a project",
  "view-work": "View work",
  selected: "Selected",
  "projects-subtitle": "Secure full-stack products, scalable backends, and security-focused builds from recent work.",
  "chat-title": "Chat with my assistant",
  "chat-subtitle": "Quick project intake, then ask about skills, work, or security",
  "chat-placeholder": "Ask a question about Kofi's work…",
  "chat-send": "Send message",
  "chat-thinking": "Thinking…",
  "chat-sign-in-required": "Sign in to chat with Kofi's assistant and send inquiries.",
  "chat-sign-in": "Sign in to chat",
  "chat-loading": "Loading…",
  "chat-clerk-missing": "Add VITE_CLERK_PUBLISHABLE_KEY to enable sign-in and chat.",
  "chat-escalated": "Passed to Kofi — he'll follow up from the admin queue.",
  "chat-send-email": "Continue via email",
  "intake-step": "Step {current} of {total}",
  "intake-type-title": "What are you looking for?",
  "intake-type-hint": "Pick the closest match — you can ask follow-up questions after.",
  "intake-type-general": "General question",
  "intake-timeline-title": "When do you need to start?",
  "intake-budget-title": "Budget range (optional)",
  "intake-budget-hint": "Helps scope the conversation — you can skip.",
  "intake-details-title": "Tell me about the project",
  "intake-details-hint": "Goals, stack, scope, or security targets — a few sentences is enough.",
  "intake-details-placeholder":
    "e.g. Need a pentest on our REST API before launch, or building grocery delivery APIs in Node…",
  "intake-urgent": "This is urgent — notify Kofi directly",
  "intake-back": "Back",
  "intake-skip": "Skip",
  "intake-continue": "Continue",
  "intake-submit": "Submit & start chat",
  "intake-submitting": "Saving…",
  "intake-done-hint": "Ask follow-up questions below. Kofi was notified if you marked this urgent.",
  "chat-welcome-intake": "Thanks for the details on your {type} inquiry. What would you like to know next?",
  "back-to-home": "Back to home",
  "toggle-theme": "Toggle theme",
  "live-view": "View live",
  "source-code": "Source code",
  "next-project": "Next project",
  "project-not-found": "Project not found",
  "back-to-work": "Back to work",
  "scroll-explore": "Scroll to explore",
  "contact-headline": "Let's work together",
  "contact-subtitle": "Start with a quick intake, then chat about projects, pentesting, or collaboration.",
  "download-cv": "Download résumé",
  "view-github": "View GitHub",
  "get-in-touch": "Get in touch",
  "filter-all": "All",
  "filter-feature": "Feature",
  "chat-guest-fallback": "Email Kofi directly while chat sign-in is unavailable.",
  "chat-email-cta": "Send an email",
  "sign-in": "Sign in",
} as const;

export type MessageKey = keyof typeof en;

export const t = (key: MessageKey, vars?: Record<string, string | number>) => {
  let text: string = en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
};
