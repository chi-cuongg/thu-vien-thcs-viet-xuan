import Link from "next/link";
import { Library, Search } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { NavLink } from "@/components/nav-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV, SITE } from "@/config/site";

const NAV_TIM_KIEM = { href: "/tim-kiem", nhan: "Tìm kiếm", icon: "Search" };

export function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b-[1.5px] border-border bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="group flex min-w-0 items-center gap-3 rounded-2xl">
            <span className="grid size-11 shrink-0 -rotate-3 place-items-center rounded-2xl bg-gradient-to-br from-primary to-tone-violet text-primary-fg shadow-nut transition-transform group-hover:rotate-0">
              <Library className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-lg font-bold leading-tight">{SITE.name}</span>
              <span className="block truncate text-xs font-semibold text-muted">{SITE.school}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <nav aria-label="Điều hướng chính" className="hidden md:block">
              <ul className="flex items-center gap-1 rounded-full bg-surface-muted p-1 text-sm font-bold">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      exact={item.href === "/"}
                      className="block rounded-full px-4 py-2 text-muted transition hover:text-fg"
                      activeClassName="bg-surface !text-primary shadow-clay"
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
              className="hidden size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-border bg-surface text-muted shadow-clay transition hover:-translate-y-0.5 hover:border-primary hover:text-primary md:grid"
            >
              <Search className="size-5" aria-hidden />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Trên điện thoại: thanh điều hướng cố định ở đáy (kèm Tìm kiếm), chia đều — bấm bằng ngón cái, không phải cuộn ngang.
          Đặt ngoài <header> vì backdrop-blur của header khiến `fixed` bám theo header thay vì màn hình. */}
      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-40 border-t-[1.5px] border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-5 py-1.5 text-xs font-bold">
          {[...NAV, NAV_TIM_KIEM].map((item) => (
            <li key={item.href}>
              <NavLink
                href={item.href}
                exact={item.href === "/"}
                className="group flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 text-muted transition hover:text-fg"
                activeClassName="!text-primary [&>span]:bg-primary-soft"
              >
                <span className="grid h-8 w-11 place-items-center rounded-full transition-colors">
                  <CategoryIcon name={item.icon} className="size-5" />
                </span>
                {item.nhan}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
