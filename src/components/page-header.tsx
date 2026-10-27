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
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-1 text-sm text-muted">
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>
          {crumbs.map((c) => (
            <span key={c.href} className="inline-flex items-center gap-1">
              <ChevronRight className="size-4" aria-hidden />
              <Link href={c.href} className="hover:text-primary">
                {c.label}
              </Link>
            </span>
          ))}
        </nav>
        <h1 className="mt-2 text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}
