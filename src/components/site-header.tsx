import Link from "next/link";
import { Suspense } from "react";
import { Library, LogIn, Search } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { NavLink } from "@/components/nav-link";
import { TaiKhoanMenu } from "@/components/tai-khoan-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV, SITE } from "@/config/site";
import { TEN_VAI_TRO } from "@/config/vai-tro";
import type { VaiTro } from "@/db/schema";
import { laEmailGia } from "@/lib/ma-hoc-sinh";
import { getSession } from "@/lib/session";

const NAV_TIM_KIEM = { href: "/tim-kiem", nhan: "Tìm kiếm", icon: "Search" };

/** Chưa đăng nhập: nút Đăng nhập. Đã đăng nhập: menu tài khoản (có lối vào trang quản trị nếu có quyền). */
async function TaiKhoan() {
  const session = await getSession();
  if (!session) {
    return (
      <Link
        href="/dang-nhap"
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-3 text-sm font-bold text-primary-fg shadow-nut transition hover:-translate-y-0.5 hover:brightness-110 xl:px-5"
      >
        <LogIn className="size-5" aria-hidden />
        {/* Chữ chỉ hiện trên màn hình rộng — dưới xl menu ngang với nhãn đầy đủ đã chiếm gần hết chỗ */}
        <span className="sr-only xl:not-sr-only">Đăng nhập</span>
      </Link>
    );
  }
  const { name, email, role, lop } = session.user;
  const vaiTro = role as VaiTro;
  const phu = laEmailGia(email) ? `Học sinh${lop ? ` lớp ${lop}` : ""}` : `${email} · ${TEN_VAI_TRO[vaiTro]}`;
  return <TaiKhoanMenu ten={name} phu={phu} coQuanTri={vaiTro !== "nguoi_dung"} />;
}

export function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b-[1.5px] border-border bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 rounded-2xl sm:gap-3">
            <span className="grid size-11 shrink-0 -rotate-3 place-items-center rounded-2xl bg-gradient-to-br from-primary to-tone-violet text-primary-fg shadow-nut transition-transform group-hover:rotate-0">
              <Library className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              {/* Chữ nhỏ hơn dưới lg để tên trường không bị cắt cạnh menu và nút tài khoản */}
              <span className="block truncate font-display text-base font-bold leading-tight lg:text-lg">{SITE.name}</span>
              <span className="block truncate text-xs font-semibold text-muted">{SITE.address}</span>
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
                      className="block whitespace-nowrap rounded-full px-3 py-2 text-muted transition hover:text-fg lg:px-4"
                      activeClassName="bg-surface !text-primary shadow-clay"
                    >
                      {/* Tablet: nhãn ngắn để menu nằm trên một dòng cạnh logo và các nút */}
                      <span className="lg:hidden">{item.nhan}</span>
                      <span className="hidden lg:inline">{item.label}</span>
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
            <Suspense fallback={<span className="size-11 shrink-0 rounded-full bg-surface-muted" aria-hidden />}>
              <TaiKhoan />
            </Suspense>
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
