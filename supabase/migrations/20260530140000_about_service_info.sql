-- Add descriptive info to default services (idempotent).

update public.site_about
set
  services = '[
    {"name": "Full-Stack Web & Mobile", "info": "React, Next.js, React Native with Expo, TypeScript, Vite, Tailwind CSS, and shadcn/ui — from landing pages to cross-platform mobile apps."},
    {"name": "Secure Backend & REST APIs", "info": "Node.js and Express APIs with validation, structured error handling, rate limiting, and architectures built for production traffic."},
    {"name": "Application & API Security", "info": "Secure SDLC practices, OWASP-aware reviews, API hardening, auth security, and penetration-testing fundamentals baked into delivery."},
    {"name": "Auth & Real-time Systems", "info": "Clerk authentication, session and role models, WebSockets, and live features that stay reliable under real user load."},
    {"name": "PostgreSQL & Cloud Data", "info": "PostgreSQL on Neon and Supabase, MongoDB, Firebase Firestore, migrations, branching, and data layers that scale with the product."},
    {"name": "Production Observability", "info": "Sentry for errors, PostHog for product analytics, logging, and monitoring so issues surface before users report them."}
  ]'::jsonb,
  updated_at = now()
where id = 'default';
