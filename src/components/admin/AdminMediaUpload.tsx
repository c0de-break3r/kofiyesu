import { useRef, useState, type ChangeEvent } from "react";
import { isCloudinaryConfigured, uploadMediaToCloudinary } from "@/lib/cloudinary";

type AdminMediaUploadProps = {
  label: string;
  hint?: string;
  accept: string;
  value: string;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  previewType?: "image" | "video";
};

export function AdminMediaUpload({
  label,
  hint,
  accept,
  value,
  onChange,
  onError,
  previewType = "image",
}: AdminMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!isCloudinaryConfigured()) {
      onError("Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env");
      return;
    }

    try {
      setUploading(true);
      const url = await uploadMediaToCloudinary(file);
      onChange(url);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isVideo = previewType === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(value);

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
      {hint ? <p className="text-xs text-[var(--text-muted)]">{hint}</p> : null}

      <div className="flex flex-wrap gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-bold transition hover:border-[var(--color-accent)] disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10"
          >
            Clear
          </button>
        ) : null}
      </div>

      <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(e) => void onPick(e)} />

      {value ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          {isVideo ? (
            <video src={value} controls playsInline className="max-h-40 w-full object-cover" />
          ) : (
            <img src={value} alt="" className="max-h-40 w-full object-cover" />
          )}
        </div>
      ) : null}
    </div>
  );
}
