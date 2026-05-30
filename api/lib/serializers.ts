import type { ContactInquiry, SiteAbout, SiteProject } from "@prisma/client";

export const projectToApi = (row: SiteProject) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  theme: row.theme,
  tags: row.tags,
  description: row.description,
  thumbnail_url: row.thumbnailUrl,
  preview_video_url: row.previewVideoUrl,
  live_url: row.liveUrl,
  source_url: row.sourceUrl,
  video_border: row.videoBorder,
  components: row.components,
  sort_order: row.sortOrder,
  published: row.published,
  created_at: row.createdAt.toISOString(),
  updated_at: row.updatedAt.toISOString(),
});

export const aboutToApi = (row: SiteAbout) => ({
  id: row.id,
  display_name: row.displayName,
  job_title: row.jobTitle,
  about_intro: row.aboutIntro,
  about_tagline: row.aboutTagline,
  location: row.location,
  services: row.services,
  updated_at: row.updatedAt.toISOString(),
});

export const inquiryToApi = (row: ContactInquiry) => ({
  id: row.id,
  inquiry_type: row.inquiryType,
  message: row.message,
  needs_admin: row.needsAdmin,
  user_email: row.userEmail,
  user_id: row.userId,
  user_name: row.userName,
  intake: row.intake,
  created_at: row.createdAt.toISOString(),
});
