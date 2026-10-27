import type { Metadata } from "next";
import { Suspense } from "react";
import { UploadForm } from "@/components/admin/upload-form";
import { hasRole, requireRole, STAFF_ROLES, UPLOAD_ROLES } from "@/lib/session";

export const metadata: Metadata = { title: "Đăng tài liệu" };

async function NoiDung() {
  const session = await requireRole(UPLOAD_ROLES);
  return <UploadForm laThuThu={hasRole(session, STAFF_ROLES)} />;
}

export default function DangTaiLieuPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Đăng tài liệu</h1>
      <p className="mt-1 text-sm text-muted">Tài liệu của giáo viên sẽ hiển thị sau khi thủ thư duyệt.</p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-96 rounded-xl border border-border bg-surface" aria-busy />}>
          <NoiDung />
        </Suspense>
      </div>
    </div>
  );
}
