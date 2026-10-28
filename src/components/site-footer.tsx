import Link from "next/link";
import { ExternalLink, Library } from "lucide-react";
import { NAV, SITE } from "@/config/site";
import { LIEN_KET } from "@/config/taxonomy";

export function SiteFooter() {
  return (
    <footer className="mt-16 rounded-t-[2.5rem] border-t-[1.5px] border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.4fr]">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid size-9 -rotate-3 place-items-center rounded-xl bg-gradient-to-br from-primary to-tone-violet text-primary-fg">
              <Library className="size-4" aria-hidden />
            </span>
            {SITE.name}
          </p>
          <p className="mt-2 text-sm text-muted">{SITE.address}</p>
          <Link
            href="/quan-tri"
            className="mt-4 inline-flex min-h-10 items-center rounded-full border-[1.5px] border-border px-4 text-sm font-bold text-muted transition hover:border-primary hover:text-primary"
          >
            Đăng nhập dành cho thủ thư, giáo viên
          </Link>
        </div>
        <div>
          <p className="text-sm font-semibold">Khám phá</p>
          <ul className="mt-2 space-y-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-block py-1 text-muted hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/tim-kiem" className="inline-block py-1 text-muted hover:text-primary">
                Tìm kiếm tài liệu
              </Link>
            </li>
            <li>
              <Link href="/chinh-sach-bao-mat" className="inline-block py-1 text-muted hover:text-primary">
                Chính sách quyền riêng tư
              </Link>
            </li>
          </ul>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-semibold">Liên kết học liệu số</p>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-1">
            {LIEN_KET.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-block py-1 text-muted hover:text-primary"
                >
                  <span className="inline-flex items-center gap-1 font-medium text-fg group-hover:text-primary">
                    {link.ten}
                    <ExternalLink className="size-3" aria-hidden />
                    <span className="sr-only">(mở tab mới)</span>
                  </span>
                  <span className="block text-xs">{link.moTa}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
