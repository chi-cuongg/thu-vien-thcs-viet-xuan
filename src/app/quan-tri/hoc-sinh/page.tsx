import { and, asc, eq, isNotNull, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CapLaiMatKhauNut, TaoTaiKhoanHocSinh } from "@/components/admin/tai-khoan-hoc-sinh";
import { ChipLoc } from "@/components/ui";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import { requireRole, STAFF_ROLES } from "@/lib/session";

export const metadata: Metadata = { title: "Tài khoản học sinh" };

async function DanhSach({ searchParams }: Pick<PageProps<"/quan-tri/hoc-sinh">, "searchParams">) {
  await requireRole(STAFF_ROLES, "/quan-tri/hoc-sinh");
  const { lop: lopParam } = await searchParams;
  const db = getDb();
  const laHocSinh = and(isNotNull(user.username), eq(user.role, "nguoi_dung"));
  const dsLop = await db
    .select({ lop: user.lop, so: sql<number>`count(*)::int` })
    .from(user)
    .where(laHocSinh)
    .groupBy(user.lop)
    .orderBy(asc(user.lop));
  // Lớp đang xem; "" là nhóm chưa có lớp
  const chon = dsLop.find((l) => (l.lop ?? "") === lopParam) ?? dsLop[0];
  const lop = chon?.lop ?? null;

  if (dsLop.length === 0) {
    return <p className="rounded-3xl bg-surface-muted px-5 py-8 text-center text-sm text-muted">Chưa có tài khoản học sinh nào.</p>;
  }

  const rows = await db
    .select({ id: user.id, hoTen: user.name, ma: user.displayUsername })
    .from(user)
    .where(and(laHocSinh, lop ? eq(user.lop, lop) : sql`${user.lop} is null`))
    .orderBy(asc(user.displayUsername));

  return (
    <>
      <ChipLoc
        muc={dsLop.map((l) => ({
          href: `/quan-tri/hoc-sinh?lop=${encodeURIComponent(l.lop ?? "")}`,
          nhan: `${l.lop ? `Lớp ${l.lop}` : "Chưa có lớp"} (${l.so})`,
          dangChon: l.lop === lop,
        }))}
      />
      <ul className="the mt-4 divide-y divide-border">
        {rows.map((hs) => (
          <li key={hs.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium">{hs.hoTen}</p>
              <p className="font-mono text-sm text-muted">{hs.ma}</p>
            </div>
            <CapLaiMatKhauNut userId={hs.id} ten={hs.hoTen} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default function HocSinhPage({ searchParams }: PageProps<"/quan-tri/hoc-sinh">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Tài khoản học sinh</h1>
      <p className="mt-1 text-sm text-muted">
        Học sinh không có Gmail đăng nhập bằng mã học sinh và mật khẩu ở đây. Học sinh có Gmail thì tự đăng nhập bằng Google, không
        cần tạo.
      </p>
      <div className="mt-6">
        <TaoTaiKhoanHocSinh />
      </div>
      <h2 className="mt-10 text-xl font-bold">Danh sách theo lớp</h2>
      <div className="mt-4">
        <Suspense fallback={<div className="h-48 the" aria-busy />}>
          <DanhSach searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
