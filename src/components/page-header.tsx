import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHeader({
  title,
  description,
  crumbs = [],
  children,
}: {
  title: string;
  description?: string;
  crumbs?: { href: string; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-soft via-bg to-tone-violet-soft">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-tone-yellow-soft opacity-80" />
      <div className="relative mx-auto max-w-6xl px-4 py-7 md:py-10">
        <nav aria-label="Đường dẫn">
          <ol className="flex flex-wrap items-center gap-1 text-sm font-semibold text-muted">
            {[{ href: "/", label: "Trang chủ" }, ...crumbs].map((c) => (
              <li key={c.href} className="inline-flex items-center gap-1">
                <Link href={c.href} className="hover:text-primary hover:underline">
                  {c.label}
                </Link>
                <ChevronRight className="size-4" aria-hidden />
              </li>
            ))}
            <li aria-current="page" className="line-clamp-1 max-w-[16rem] text-fg">
              {title}
            </li>
          </ol>
        </nav>
        <h1 className="mt-2 text-3xl font-bold text-balance md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted md:text-lg">{description}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}
