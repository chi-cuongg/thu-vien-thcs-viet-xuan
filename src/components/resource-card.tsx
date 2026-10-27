import Image from "next/image";
import Link from "next/link";
import { FileText, Lock, PlayCircle } from "lucide-react";
import { tenLoai } from "@/config/taxonomy";
import type { TheTaiLieu } from "@/db/queries";
import { driveThumbnailUrl } from "@/lib/drive-urls";

function anhBia(t: TheTaiLieu): string | null {
  if (t.anhBiaUrl) return t.anhBiaUrl;
  if (t.youtubeId) return `https://i.ytimg.com/vi/${t.youtubeId}/hqdefault.jpg`;
  // Drive chỉ trả ảnh thu nhỏ cho file đã chia sẻ công khai
  if (t.driveFileId && t.quyenTruyCap === "cong_khai") return driveThumbnailUrl(t.driveFileId, 400);
  return null;
}

export function ResourceCard({ taiLieu: t }: { taiLieu: TheTaiLieu }) {
  const anh = anhBia(t);
  return (
    <Link
      href={`/tai-lieu/${t.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {anh ? (
          <Image
            src={anh}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <FileText className="absolute inset-0 m-auto size-10 text-muted" aria-hidden />
        )}
        {t.youtubeId && <PlayCircle className="absolute inset-0 m-auto size-12 text-white drop-shadow" aria-hidden />}
        <span className="absolute left-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-xs font-medium backdrop-blur">
          {tenLoai(t.loai)}
        </span>
        {t.quyenTruyCap === "dang_nhap" && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 text-xs backdrop-blur">
            <Lock className="size-3" aria-hidden /> Cần đăng nhập
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">{t.tieuDe}</p>
        <p className="mt-auto pt-2 text-xs text-muted">
          {[t.monHoc, t.khoiLop.length ? `Lớp ${t.khoiLop.join(", ")}` : null].filter(Boolean).join(" · ") || " "}
        </p>
      </div>
    </Link>
  );
}

export function ResourceGrid({ items }: { items: TheTaiLieu[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {items.map((t) => (
        <li key={t.id}>
          <ResourceCard taiLieu={t} />
        </li>
      ))}
    </ul>
  );
}
