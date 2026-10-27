"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookMarked, LayoutDashboard, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Props = {
  ten: string;
  phu: string; // lớp / email / vai trò
  coQuanTri: boolean;
};

const MUC = "flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-bold transition hover:bg-surface-muted";

/** Nút tròn chữ cái đầu tên + menu: Sách của tôi, Trang quản trị (nếu có quyền), Đăng xuất. */
export function TaiKhoanMenu({ ten, phu, coQuanTri }: Props) {
  const router = useRouter();
  const [mo, setMo] = useState(false);
  const khung = useRef<HTMLDivElement>(null);

  // Đóng khi bấm ra ngoài hoặc nhấn Esc (bấm mục trong menu thì tự đóng ở onClick)
  useEffect(() => {
    if (!mo) return;
    const ngoai = (e: PointerEvent) => !khung.current?.contains(e.target as Node) && setMo(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMo(false);
    document.addEventListener("pointerdown", ngoai);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", ngoai);
      document.removeEventListener("keydown", esc);
    };
  }, [mo]);

  const chuDau = ten.trim().split(/\s+/).pop()?.[0]?.toUpperCase() ?? "?";

  return (
    <div ref={khung} className="relative">
      <button
        type="button"
        onClick={() => setMo((v) => !v)}
        aria-expanded={mo}
        aria-haspopup="true"
        title={ten}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-tone-orange to-tone-pink font-display text-lg font-bold text-white shadow-nut transition hover:-translate-y-0.5 dark:text-bg"
      >
        <span className="sr-only">Tài khoản của {ten}</span>
        <span aria-hidden>{chuDau}</span>
      </button>

      {mo && (
        <div className="the absolute right-0 top-full z-50 mt-2 w-64 p-2 shadow-clay-lg">
          <div className="border-b-[1.5px] border-border px-3 pb-3 pt-2">
            <p className="truncate font-bold">{ten}</p>
            <p className="truncate text-xs text-muted">{phu}</p>
          </div>
          <ul className="mt-2 space-y-0.5" onClick={(e) => (e.target as HTMLElement).closest("a") && setMo(false)}>
            <li>
              <Link href="/tai-khoan" className={MUC}>
                <BookMarked className="size-5 text-tone-orange" aria-hidden /> Sách tôi mượn
              </Link>
            </li>
            {coQuanTri && (
              <li>
                <Link href="/quan-tri" className={MUC}>
                  <LayoutDashboard className="size-5 text-primary" aria-hidden /> Trang quản trị
                </Link>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={async () => {
                  await authClient.signOut();
                  setMo(false);
                  router.push("/");
                  router.refresh();
                }}
                className={`${MUC} text-danger hover:bg-danger-soft`}
              >
                <LogOut className="size-5" aria-hidden /> Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
