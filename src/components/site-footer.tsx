import Link from "next/link";
import { ExternalLink, Library } from "lucide-react";
import { NAV, SITE } from "@/config/site";
import { LIEN_KET } from "@/config/taxonomy";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.4fr]">
        <div>
          <p className="flex items-center gap-2 font-semibold">
            <Library className="size-5 text-primary" aria-hidden />
            {SITE.name}
          </p>
          <p className="mt-2 text-sm text-muted">{SITE.school}</p>
          <p className="text-sm text-muted">{SITE.address}</p>
          <Link
            href="/quan-tri"
            className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary"
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
