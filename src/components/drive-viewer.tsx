import { drivePreviewUrl } from "@/lib/drive-urls";

/** Trình đọc PDF/tài liệu của Google Drive nhúng vào trang. File phải được chia sẻ "ai có link đều xem". */
export function DriveViewer({ fileId, title }: { fileId: string; title: string }) {
  return (
    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-surface-muted md:aspect-[4/3]">
      <iframe
        src={drivePreviewUrl(fileId)}
        title={title}
        className="size-full"
        allow="autoplay; fullscreen"
        loading="lazy"
      />
    </div>
  );
}
