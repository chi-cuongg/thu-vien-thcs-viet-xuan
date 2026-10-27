import Link from "next/link";

// Kiểu nút/link dùng chung, giữ cùng chiều cao (≥ 40px) để dễ bấm trên điện thoại
export const NUT_CHINH =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-fg transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60";
export const NUT_PHU =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 font-medium transition-colors hover:border-primary hover:text-primary disabled:opacity-60";

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
            className={`inline-flex min-h-10 items-center rounded-full border px-4 transition-colors ${
              m.dangChon
                ? "border-primary bg-primary font-semibold text-primary-fg"
                : "border-border bg-surface text-muted hover:border-primary hover:text-primary"
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
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4" aria-busy aria-label="Đang tải">
      {Array.from({ length: so }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="aspect-[4/3] animate-pulse bg-surface-muted" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-4/5 animate-pulse rounded bg-surface-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DongDangTai({ so = 4 }: { so?: number }) {
  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-surface" aria-busy aria-label="Đang tải">
      {Array.from({ length: so }, (_, i) => (
        <li key={i} className="space-y-2 px-4 py-4">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
        </li>
      ))}
    </ul>
  );
}
