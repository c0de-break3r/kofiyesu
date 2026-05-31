import type { ContactInquiry, SiteAbout, SiteFeature, SiteProject } from "@prisma/client";
import { featureToApi } from "./featureSerializer.js";

type ProjectRow = SiteProject & { category?: SiteFeature | null };

export const projectToApi = (row: ProjectRow) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  theme: row.theme,
  category_id: row.categoryId,
  category: row.category ? featureToApi(row.category) : null,
  tech_stack: row.techStack,
  description: row.description,
  thumbnail_url: row.thumbnailUrl,
  preview_video_url: row.previewVideoUrl,
  showcase_video_url: row.showcaseVideoUrl,
  showcase_video_caption: row.showcaseVideoCaption,
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
  status: row.status,
  admin_notes: row.adminNotes,
  reply_draft: row.replyDraft,
  admin_reply: row.adminReply,
  admin_reply_at: row.adminReplyAt?.toISOString() ?? null,
  conversation_id: row.conversationId,
  user_email: row.userEmail,
  user_id: row.userId,
  user_name: row.userName,
  intake: row.intake,
  reviewed_at: row.reviewedAt?.toISOString() ?? null,
  created_at: row.createdAt.toISOString(),
  updated_at: row.updatedAt.toISOString(),
});

export { featureToApi };
