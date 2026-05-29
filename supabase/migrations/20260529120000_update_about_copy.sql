-- Refresh default about copy and services (idempotent).

update public.site_about
set
  job_title = 'Software Engineer & Cybersecurity Practitioner',
  about_intro = 'Software Engineer and Cybersecurity Practitioner based in Ghana, specializing in secure, scalable, and production-ready web and mobile applications. Experienced in modern full-stack development using JavaScript and TypeScript ecosystems, with strong expertise in React, Next.js, React Native with Expo, Node.js, Express.js, Vite, Tailwind CSS, and shadcn/ui.

Skilled in building high-performance applications with modern authentication systems using Clerk, scalable backend architectures, REST APIs, real-time systems, and database solutions including PostgreSQL, Neon, Supabase, MongoDB, and Firebase Firestore. Experienced with monitoring and analytics platforms such as Sentry and PostHog to improve reliability, performance, and user experience across production environments.

Strong cybersecurity background with knowledge in application security, API security, security automation, authentication security, penetration testing fundamentals, and secure software development practices. Passionate about creating digital products that combine exceptional user experiences with strong security foundations and scalable architecture.',
  about_tagline = 'Driven by a long-term vision of building interactive, immersive, and gamified platforms inspired by modern digital ecosystems and social gaming experiences — creating applications that encourage creativity, collaboration, engagement, and digital identity at scale.',
  services = '[
    {"name": "Full-Stack Web & Mobile"},
    {"name": "Secure Backend & REST APIs"},
    {"name": "Application & API Security"},
    {"name": "Auth & Real-time Systems"},
    {"name": "PostgreSQL & Cloud Data"},
    {"name": "Production Observability"}
  ]'::jsonb,
  updated_at = now()
where id = 'default';
