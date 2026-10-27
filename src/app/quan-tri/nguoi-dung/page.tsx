import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { VaiTroSelect } from "@/components/admin/vai-tro-select";
import { getDb } from "@/db";
import { user, type VaiTro } from "@/db/schema";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Người dùng" };

async function DanhSach() {
  const session = await requireRole(["admin"]);
  const rows = await getDb()
    .select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt })
    .from(user)
    .orderBy(desc(user.createdAt));

  return (
    <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
      {rows.map((u) => (
        <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="font-medium">
              {u.name}
              {u.id === session.user.id && <span className="ml-2 text-xs text-muted">(bạn)</span>}
            </p>
            <p className="text-sm text-muted">{u.email}</p>
          </div>
          <VaiTroSelect userId={u.id} vaiTro={u.role as VaiTro} khoa={u.id === session.user.id} />
        </li>
      ))}
    </ul>
  );
}

export default function NguoiDungPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Người dùng</h1>
      <p className="mt-1 text-sm text-muted">
        Giáo viên đăng nhập bằng Google lần đầu sẽ ở trạng thái “Chưa được cấp quyền”. Chọn vai trò để cho phép đăng tài liệu
        (Giáo viên) hoặc duyệt, nhập sổ (Thủ thư).
      </p>
      <Suspense fallback={<div className="mt-6 h-48 rounded-xl border border-border bg-surface" aria-busy />}>
        <DanhSach />
      </Suspense>
    </div>
  );
}
