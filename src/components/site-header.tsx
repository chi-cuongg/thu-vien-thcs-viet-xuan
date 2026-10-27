import Link from "next/link";
import { Library, Search } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { NavLink } from "@/components/nav-link";
import { NAV, SITE } from "@/config/site";

export function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3 rounded-lg">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-fg">
              <Library className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold leading-tight">{SITE.name}</span>
              <span className="block truncate text-xs text-muted">{SITE.school}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <nav aria-label="Điều hướng chính" className="hidden md:block">
              <ul className="flex items-center gap-1 text-sm font-medium">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      exact={item.href === "/"}
                      className="block rounded-lg px-3 py-2 text-muted transition-colors hover:bg-surface-muted hover:text-fg"
                      activeClassName="bg-primary-soft !text-primary"
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <Link
              href="/tim-kiem"
              aria-label="Tìm kiếm tài liệu"
              className="grid size-10 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-fg"
            >
              <Search className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      {/* Trên điện thoại: thanh điều hướng cố định ở đáy, 4 mục chia đều — bấm bằng ngón cái, không phải cuộn ngang.
          Đặt ngoài <header> vì backdrop-blur của header khiến `fixed` bám theo header thay vì màn hình. */}
      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-4 text-xs font-medium">
          {NAV.map((item) => (
            <li key={item.href}>
              <NavLink
                href={item.href}
                exact={item.href === "/"}
                className="flex min-h-14 flex-col items-center justify-center gap-1 border-t-2 border-transparent px-1 text-muted transition-colors hover:text-fg"
                activeClassName="!border-primary !text-primary"
              >
                <CategoryIcon name={item.icon} className="size-5" />
                {item.nhan}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
