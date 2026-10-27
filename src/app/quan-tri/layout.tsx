import Link from "next/link";

const MENU = [
  { href: "/quan-tri", label: "Tổng quan" },
  { href: "/quan-tri/dang-tai-lieu", label: "Đăng tài liệu" },
  { href: "/quan-tri/tai-lieu", label: "Duyệt & quản lý tài liệu" },
  { href: "/quan-tri/so-dkcb", label: "Sổ đăng ký cá biệt" },
  { href: "/quan-tri/nguoi-dung", label: "Người dùng" },
];

export default function QuanTriLayout({ children }: LayoutProps<"/quan-tri">) {
  return (
    <>
      <div className="border-b border-border bg-surface">
        <nav aria-label="Quản trị" className="mx-auto max-w-6xl overflow-x-auto px-4">
          <ul className="flex gap-1 py-2 text-sm font-medium">
            {MENU.map((m) => (
              <li key={m.href} className="shrink-0">
                <Link href={m.href} className="block rounded-md px-3 py-1.5 text-muted hover:bg-surface-muted hover:text-fg">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {children}
    </>
  );
}
