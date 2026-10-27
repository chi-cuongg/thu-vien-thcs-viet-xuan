import { sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, BookText, FileCheck2, Upload, Users } from "lucide-react";
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
    {
      href: "/quan-tri/dang-tai-lieu",
      ten: "Đăng tài liệu",
      moTa: "Tải file lên Drive hoặc gắn video YouTube",
      icon: Upload,
      hien: role !== "nguoi_dung",
    },
    {
      href: "/quan-tri/tai-lieu",
      ten: laThuThu ? "Duyệt & quản lý tài liệu" : "Tài liệu của tôi",
      moTa: laThuThu ? `${taiLieuDem?.choDuyet ?? 0} chờ duyệt · ${taiLieuDem?.daDuyet ?? 0} đã đăng` : "Xem trạng thái duyệt",
      icon: FileCheck2,
      hien: role !== "nguoi_dung",
      noiBat: (taiLieuDem?.choDuyet ?? 0) > 0,
    },
    { href: "/quan-tri/so-dkcb", ten: "Sổ đăng ký cá biệt", moTa: `${(sachDem?.ban ?? 0).toLocaleString("vi-VN")} bản sách giấy`, icon: BookText, hien: laThuThu },
    {
      href: "/quan-tri/nguoi-dung",
      ten: "Người dùng",
      moTa: `${nguoiDem?.chuaCap ?? 0} tài khoản chờ cấp quyền`,
      icon: Users,
      hien: role === "admin",
      noiBat: (nguoiDem?.chuaCap ?? 0) > 0,
    },
  ].filter((o) => o.hien);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Xin chào, {session.user.name}</h1>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-lg font-bold text-primary" aria-hidden>
            {session.user.name.trim().split(/\s+/).pop()?.[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm text-muted">{session.user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium">{TEN_VAI_TRO[role]}</span>
          </div>
        </div>
        <SignOutButton />
      </div>

      {role === "nguoi_dung" ? (
        <div role="status" className="mt-6 rounded-xl border border-accent bg-accent-soft p-5">
          <p className="font-semibold">Tài khoản đang chờ cấp quyền</p>
          <p className="mt-1 text-sm">
            Hãy báo thủ thư (kèm email <strong>{session.user.email}</strong>) để được cấp quyền giáo viên hoặc thủ thư, sau đó tải lại
            trang này.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {oChucNang.map((o) => (
            <li key={o.href}>
              <Link
                href={o.href}
                className={`group flex h-full flex-col rounded-xl border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md ${o.noiBat ? "border-accent ring-1 ring-accent" : "border-border"}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                    <o.icon className="size-5" aria-hidden />
                  </span>
                  {o.noiBat && (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">Cần xử lý</span>
                  )}
                </span>
                <span className="mt-4 block font-semibold group-hover:text-primary">{o.ten}</span>
                <span className="mt-1 block text-sm text-muted">{o.moTa}</span>
                <ArrowRight
                  className="mt-auto size-4 self-end text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden
                />
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
