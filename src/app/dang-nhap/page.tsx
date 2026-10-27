import type { Metadata } from "next";
import { GoogleSignInButton } from "@/components/auth-buttons";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function DangNhapPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="mt-2 text-sm text-muted">
          Dành cho thủ thư và giáo viên để đăng, duyệt tài liệu. Học sinh không cần đăng nhập để đọc sách.
        </p>
        <div className="mt-6">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
