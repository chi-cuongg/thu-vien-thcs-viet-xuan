import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Library } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth-buttons";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function DangNhapPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <div className="the p-6 shadow-clay-lg md:p-8">
        <span className="grid size-14 -rotate-3 place-items-center rounded-2xl bg-gradient-to-br from-primary to-tone-violet text-primary-fg shadow-nut">
          <Library className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-bold">Đăng nhập</h1>
        <p className="mt-2 text-sm text-muted">
          Dành cho thủ thư và giáo viên của {SITE.shortName} để đăng, duyệt tài liệu.
        </p>
        <p className="mt-4 rounded-2xl bg-tone-green-soft px-4 py-3 text-sm text-tone-green">
          Học sinh <strong>không cần đăng nhập</strong> để đọc sách và tra cứu.
        </p>
        <div className="mt-6">
          <GoogleSignInButton />
        </div>
      </div>
      <Link href="/" className="mt-6 inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-muted transition hover:bg-surface hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Về trang chủ
      </Link>
    </div>
  );
}
