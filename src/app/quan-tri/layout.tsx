import { BookText, FileCheck2, LayoutDashboard, Upload, Users } from "lucide-react";
import { NavLink } from "@/components/nav-link";

const MENU = [
  { href: "/quan-tri", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/quan-tri/dang-tai-lieu", label: "Đăng tài liệu", icon: Upload },
  { href: "/quan-tri/tai-lieu", label: "Duyệt & quản lý tài liệu", icon: FileCheck2 },
  { href: "/quan-tri/so-dkcb", label: "Sổ đăng ký cá biệt", icon: BookText },
  { href: "/quan-tri/nguoi-dung", label: "Người dùng", icon: Users },
];

export default function QuanTriLayout({ children }: LayoutProps<"/quan-tri">) {
  return (
    <>
      <div className="border-b-[1.5px] border-border bg-surface">
        <nav aria-label="Quản trị" className="mx-auto max-w-6xl overflow-x-auto px-4 [scrollbar-width:none]">
          <ul className="flex gap-1 py-2 text-sm font-medium">
            {MENU.map(({ href, label, icon: Icon }) => (
              <li key={href} className="shrink-0">
                <NavLink
                  href={href}
                  exact={href === "/quan-tri"}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 font-bold text-muted transition hover:bg-surface-muted hover:text-fg"
                  activeClassName="bg-primary-soft !text-primary"
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {children}
    </>
  );
}
