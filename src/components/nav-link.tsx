"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

type Props = {
  href: string;
  className: string;
  activeClassName: string;
  /** Chỉ sáng khi đúng đường dẫn (dùng cho "/" và trang tổng quan) */
  exact?: boolean;
  children: React.ReactNode;
};

function NavLinkActive({ href, className, activeClassName, exact, children }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`${className} ${active ? activeClassName : ""}`}>
      {children}
    </Link>
  );
}

/** Link menu tự đánh dấu trang đang mở. Với Cache Components, usePathname có thể treo ở route động nên bọc Suspense. */
export function NavLink(props: Props) {
  return (
    <Suspense
      fallback={
        <Link href={props.href} className={props.className}>
          {props.children}
        </Link>
      }
    >
      <NavLinkActive {...props} />
    </Suspense>
  );
}
