"use client";

import { Moon, Sun } from "lucide-react";
import { KHOA_GIAO_DIEN } from "@/lib/giao-dien";

/** Nút chuyển sáng ↔ tối. Icon và nhãn đổi bằng CSS (biến thể dark:) nên không lệch khi hydrate. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  function doi() {
    const goc = document.documentElement;
    const moi = goc.getAttribute("data-theme") === "dark" ? "light" : "dark";
    goc.setAttribute("data-theme", moi);
    try {
      localStorage.setItem(KHOA_GIAO_DIEN, moi);
    } catch {
      // Trình duyệt chặn lưu trữ: vẫn đổi được trong phiên này
    }
  }

  return (
    <button
      type="button"
      onClick={doi}
      title="Đổi giao diện sáng / tối"
      className={`grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-border bg-surface text-muted shadow-clay transition hover:-translate-y-0.5 hover:border-primary hover:text-primary ${className}`}
    >
      <Moon className="size-5 dark:hidden" aria-hidden />
      <Sun className="hidden size-5 dark:block" aria-hidden />
      <span className="sr-only dark:hidden">Chuyển sang giao diện tối</span>
      <span className="sr-only hidden dark:inline">Chuyển sang giao diện sáng</span>
    </button>
  );
}
