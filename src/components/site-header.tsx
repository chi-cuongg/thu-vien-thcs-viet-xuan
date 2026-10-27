import Link from "next/link";
import { Library } from "lucide-react";
import { NAV, SITE } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-fg">
            <Library className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold leading-tight">{SITE.name}</span>
            <span className="block truncate text-xs text-muted">{SITE.school}</span>
          </span>
        </Link>
        <nav aria-label="Điều hướng chính" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm font-medium">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-md px-3 py-2 text-muted hover:bg-surface-muted hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Trên điện thoại: menu là một hàng cuộn ngang */}
      <nav aria-label="Điều hướng chính" className="border-t border-border md:hidden">
        <ul className="flex gap-1 overflow-x-auto px-4 py-2 text-sm font-medium">
          {NAV.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link href={item.href} className="block rounded-md px-3 py-1.5 text-muted hover:bg-surface-muted hover:text-fg">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
