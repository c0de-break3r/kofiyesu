export const isCloudinaryConfigured = (): boolean =>
  Boolean(
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  );

type CloudinaryResource = "image" | "video";

async function uploadToCloudinary(file: File, resourceType: CloudinaryResource): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured (VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET)");
  }

  const folder = import.meta.env.VITE_CLOUDINARY_FOLDER as string | undefined;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  if (folder?.trim()) {
    form.append("folder", folder.trim());
  }

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Cloudinary upload failed");
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error("No URL returned from Cloudinary");
  return data.secure_url;
}

export function uploadImageToCloudinary(file: File): Promise<string> {
  return uploadToCloudinary(file, "image");
}

export function uploadVideoToCloudinary(file: File): Promise<string> {
  return uploadToCloudinary(file, "video");
}

/** Picks image vs video upload from the file MIME type. */
export function uploadMediaToCloudinary(file: File): Promise<string> {
  const isVideo = file.type.startsWith("video/");
  return uploadToCloudinary(file, isVideo ? "video" : "image");
}
