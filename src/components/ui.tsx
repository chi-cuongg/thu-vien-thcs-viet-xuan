import Link from "next/link";
import type { NhomDanhMuc } from "@/config/taxonomy";

// Kiểu nút dạng viên thuốc "dày" (Soft Clay), cao ≥ 44px để dễ bấm trên điện thoại
export const NUT_CHINH =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-fg shadow-nut transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-60";
export const NUT_PHU =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-border bg-surface px-5 font-bold shadow-clay transition hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-60";

export type Tone = "blue" | "violet" | "green" | "orange" | "pink" | "yellow";

// Viết đủ tên class để Tailwind quét được
// chip: ô icon; vach: vạch màu đậm cạnh tiêu đề; vien: viền khi rê chuột
export const TONE: Record<Tone, { chip: string; vach: string; vien: string }> = {
  blue: { chip: "bg-tone-blue-soft text-tone-blue", vach: "bg-tone-blue", vien: "hover:border-tone-blue" },
  violet: { chip: "bg-tone-violet-soft text-tone-violet", vach: "bg-tone-violet", vien: "hover:border-tone-violet" },
  green: { chip: "bg-tone-green-soft text-tone-green", vach: "bg-tone-green", vien: "hover:border-tone-green" },
  orange: { chip: "bg-tone-orange-soft text-tone-orange", vach: "bg-tone-orange", vien: "hover:border-tone-orange" },
  pink: { chip: "bg-tone-pink-soft text-tone-pink", vach: "bg-tone-pink", vien: "hover:border-tone-pink" },
  yellow: { chip: "bg-tone-yellow-soft text-tone-yellow", vach: "bg-tone-yellow", vien: "hover:border-tone-yellow" },
};

export const TONE_NHOM: Record<NhomDanhMuc, Tone> = {
  "sach-dien-tu": "blue",
  "hoc-lieu": "violet",
  "van-ban": "green",
  "hoat-dong": "pink",
};

/** Hàng chip lọc dạng link (giữ trạng thái trên URL nên chia sẻ được). */
export function ChipLoc({ muc }: { muc: { href: string; nhan: string; dangChon: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-2 text-sm">
      {muc.map((m) => (
        <li key={m.href}>
          <Link
            href={m.href}
            scroll={false}
            aria-current={m.dangChon ? "true" : undefined}
            className={`inline-flex min-h-10 items-center rounded-full border-[1.5px] px-4 font-bold transition ${
              m.dangChon
                ? "border-primary bg-primary text-primary-fg shadow-nut"
                : "border-border bg-surface text-muted hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            }`}
          >
            {m.nhan}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Khung giữ chỗ khi đang tải lưới tài liệu — tránh trang nhảy. */
export function LuoiDangTai({ so = 8 }: { so?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-busy aria-label="Đang tải">
      {Array.from({ length: so }, (_, i) => (
        <li key={i} className="the overflow-hidden">
          <div className="aspect-[4/3] animate-pulse bg-surface-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-surface-muted" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DongDangTai({ so = 4 }: { so?: number }) {
  return (
    <ul className="the divide-y divide-border" aria-busy aria-label="Đang tải">
      {Array.from({ length: so }, (_, i) => (
        <li key={i} className="space-y-2 px-5 py-4">
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-surface-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded-full bg-surface-muted" />
        </li>
      ))}
    </ul>
  );
}
