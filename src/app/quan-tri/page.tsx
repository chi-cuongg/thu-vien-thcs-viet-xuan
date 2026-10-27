import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth-buttons";
import { PageHeader } from "@/components/page-header";
import type { VaiTro } from "@/db/schema";
import { getSession, STAFF_ROLES } from "@/lib/session";

export const metadata: Metadata = { title: "Quản trị" };

const TEN_VAI_TRO: Record<VaiTro, string> = {
  admin: "Quản trị viên",
  thu_thu: "Thủ thư",
  giao_vien: "Giáo viên",
  nguoi_dung: "Chưa được cấp quyền",
};

async function QuanTriContent() {
  const session = await getSession();
  if (!session) redirect("/dang-nhap");

  const role = session.user.role as VaiTro;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5">
        <div>
          <p className="font-semibold">{session.user.name}</p>
          <p className="text-sm text-muted">
            {session.user.email} · {TEN_VAI_TRO[role]}
          </p>
        </div>
        <SignOutButton />
      </div>

      {role === "nguoi_dung" ? (
        <p className="mt-6 rounded-xl border border-accent bg-accent-soft p-5 text-sm">
          Tài khoản của bạn chưa được cấp quyền. Hãy báo thủ thư để được cấp quyền giáo viên hoặc thủ thư.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* TODO: các chức năng quản trị — đăng tài liệu, duyệt, nhập sổ ĐKCB, quản lý người dùng */}
          <li className="rounded-xl border border-dashed border-border bg-surface p-5 text-sm text-muted">
            Đăng tài liệu (sắp có)
          </li>
          {STAFF_ROLES.includes(role) && (
            <>
              <li className="rounded-xl border border-dashed border-border bg-surface p-5 text-sm text-muted">
                Duyệt tài liệu (sắp có)
              </li>
              <li className="rounded-xl border border-dashed border-border bg-surface p-5 text-sm text-muted">
                Nhập sổ đăng ký cá biệt (sắp có)
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
}

export default function QuanTriPage() {
  return (
    <>
      <PageHeader title="Quản trị thư viện" />
      <Suspense fallback={<div className="mx-auto h-40 max-w-6xl px-4 py-10" aria-busy />}>
        <QuanTriContent />
      </Suspense>
    </>
  );
}
