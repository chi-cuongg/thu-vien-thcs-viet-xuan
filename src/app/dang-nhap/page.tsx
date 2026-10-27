import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Library } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth-buttons";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function DangNhapPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-fg">
          <Library className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Đăng nhập</h1>
        <p className="mt-2 text-sm text-muted">
          Dành cho thủ thư và giáo viên của {SITE.shortName} để đăng, duyệt tài liệu.
        </p>
        <p className="mt-3 rounded-lg bg-primary-soft px-3 py-2 text-sm text-primary">
          Học sinh <strong>không cần đăng nhập</strong> để đọc sách và tra cứu.
        </p>
        <div className="mt-6">
          <GoogleSignInButton />
        </div>
      </div>
      <Link href="/" className="mt-6 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Về trang chủ
      </Link>
    </div>
  );
}
