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
    <div className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <nav aria-label="Đường dẫn">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
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
        <h1 className="mt-2 text-2xl font-bold text-balance md:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}
