import { sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth-buttons";
import { TEN_VAI_TRO } from "@/config/vai-tro";
import { getDb } from "@/db";
import { banSach, taiLieu, user, type VaiTro } from "@/db/schema";
import { getSession, hasRole, STAFF_ROLES } from "@/lib/session";

export const metadata: Metadata = { title: "Quản trị" };

async function QuanTriContent() {
  const session = await getSession();
  if (!session) redirect("/dang-nhap");
  const role = session.user.role as VaiTro;
  const laThuThu = hasRole(session, STAFF_ROLES);

  const db = getDb();
  const [[taiLieuDem], [sachDem], [nguoiDem]] = laThuThu
    ? await Promise.all([
        db
          .select({
            choDuyet: sql<number>`(count(*) filter (where ${taiLieu.trangThai} = 'cho_duyet'))::int`,
            daDuyet: sql<number>`(count(*) filter (where ${taiLieu.trangThai} = 'da_duyet'))::int`,
          })
          .from(taiLieu),
        db.select({ ban: sql<number>`count(*)::int` }).from(banSach),
        db.select({ chuaCap: sql<number>`(count(*) filter (where ${user.role} = 'nguoi_dung'))::int` }).from(user),
      ])
    : [[null], [null], [null]];

  const oChucNang = [
    { href: "/quan-tri/dang-tai-lieu", ten: "Đăng tài liệu", moTa: "Tải file lên Drive hoặc gắn video YouTube", hien: role !== "nguoi_dung" },
    {
      href: "/quan-tri/tai-lieu",
      ten: laThuThu ? "Duyệt & quản lý tài liệu" : "Tài liệu của tôi",
      moTa: laThuThu ? `${taiLieuDem?.choDuyet ?? 0} chờ duyệt · ${taiLieuDem?.daDuyet ?? 0} đã đăng` : "Xem trạng thái duyệt",
      hien: role !== "nguoi_dung",
      noiBat: (taiLieuDem?.choDuyet ?? 0) > 0,
    },
    { href: "/quan-tri/so-dkcb", ten: "Sổ đăng ký cá biệt", moTa: `${sachDem?.ban ?? 0} bản sách giấy`, hien: laThuThu },
    {
      href: "/quan-tri/nguoi-dung",
      ten: "Người dùng",
      moTa: `${nguoiDem?.chuaCap ?? 0} tài khoản chờ cấp quyền`,
      hien: role === "admin",
      noiBat: (nguoiDem?.chuaCap ?? 0) > 0,
    },
  ].filter((o) => o.hien);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
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
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {oChucNang.map((o) => (
            <li key={o.href}>
              <Link
                href={o.href}
                className={`block h-full rounded-xl border bg-surface p-5 transition hover:border-primary ${o.noiBat ? "border-accent" : "border-border"}`}
              >
                <span className="block font-semibold">{o.ten}</span>
                <span className="mt-1 block text-sm text-muted">{o.moTa}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function QuanTriPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-40 max-w-6xl px-4 py-8" aria-busy />}>
      <QuanTriContent />
    </Suspense>
  );
}
