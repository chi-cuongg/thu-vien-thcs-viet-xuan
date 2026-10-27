import { sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftRight, ArrowRight, BookText, FileCheck2, GraduationCap, Upload, Users } from "lucide-react";
import { SignOutButton } from "@/components/auth-buttons";
import { TEN_VAI_TRO } from "@/config/vai-tro";
import { getDb } from "@/db";
import { demPhieuMuon } from "@/db/muon-sach";
import { banSach, taiLieu, user, type VaiTro } from "@/db/schema";
import { duongDanDangNhap, getSession, hasRole, STAFF_ROLES } from "@/lib/session";

export const metadata: Metadata = { title: "Quản trị" };

async function QuanTriContent() {
  const session = await getSession();
  if (!session) redirect(duongDanDangNhap("/quan-tri"));
  const role = session.user.role as VaiTro;
  const laThuThu = hasRole(session, STAFF_ROLES);

  const db = getDb();
  const [[taiLieuDem], [sachDem], [nguoiDem], muon] = laThuThu
    ? await Promise.all([
        db
          .select({
            choDuyet: sql<number>`(count(*) filter (where ${taiLieu.trangThai} = 'cho_duyet'))::int`,
            daDuyet: sql<number>`(count(*) filter (where ${taiLieu.trangThai} = 'da_duyet'))::int`,
          })
          .from(taiLieu),
        db.select({ ban: sql<number>`count(*)::int` }).from(banSach),
        db
          .select({
            hocSinh: sql<number>`(count(*) filter (where ${user.username} is not null))::int`,
            tong: sql<number>`count(*)::int`,
          })
          .from(user),
        demPhieuMuon(),
      ])
    : [[null], [null], [null], null];

  const oChucNang = [
    {
      href: "/quan-tri/dang-tai-lieu",
      ten: "Đăng tài liệu",
      moTa: "Tải file lên Drive hoặc gắn video YouTube",
      icon: Upload,
      tone: "bg-tone-blue-soft text-tone-blue",
      hien: role !== "nguoi_dung",
    },
    {
      href: "/quan-tri/tai-lieu",
      ten: laThuThu ? "Duyệt & quản lý tài liệu" : "Tài liệu của tôi",
      moTa: laThuThu ? `${taiLieuDem?.choDuyet ?? 0} chờ duyệt · ${taiLieuDem?.daDuyet ?? 0} đã đăng` : "Xem trạng thái duyệt",
      icon: FileCheck2,
      tone: "bg-tone-violet-soft text-tone-violet",
      hien: role !== "nguoi_dung",
      noiBat: (taiLieuDem?.choDuyet ?? 0) > 0,
    },
    {
      href: "/quan-tri/muon-tra",
      ten: "Mượn trả",
      moTa: `${muon?.choNhan ?? 0} chờ nhận · ${muon?.dangMuon ?? 0} đang mượn${muon?.quaHan ? ` · ${muon.quaHan} quá hạn` : ""}`,
      icon: ArrowLeftRight,
      tone: "bg-tone-orange-soft text-tone-orange",
      hien: laThuThu,
      noiBat: (muon?.choNhan ?? 0) + (muon?.quaHan ?? 0) > 0,
    },
    { href: "/quan-tri/so-dkcb", ten: "Sổ đăng ký cá biệt", moTa: `${(sachDem?.ban ?? 0).toLocaleString("vi-VN")} bản sách giấy`, icon: BookText, tone: "bg-tone-green-soft text-tone-green", hien: laThuThu },
    {
      href: "/quan-tri/hoc-sinh",
      ten: "Tài khoản học sinh",
      moTa: `${(nguoiDem?.hocSinh ?? 0).toLocaleString("vi-VN")} tài khoản đăng nhập bằng mã HS`,
      icon: GraduationCap,
      tone: "bg-tone-yellow-soft text-tone-yellow",
      hien: laThuThu,
    },
    {
      href: "/quan-tri/nguoi-dung",
      ten: "Người dùng",
      moTa: `${nguoiDem?.tong ?? 0} tài khoản · cấp quyền giáo viên, thủ thư`,
      icon: Users,
      tone: "bg-tone-pink-soft text-tone-pink",
      hien: role === "admin",
    },
  ].filter((o) => o.hien);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Xin chào, {session.user.name}</h1>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 the p-5">
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
        <div role="status" className="mt-6 rounded-3xl border-[1.5px] border-accent bg-accent-soft p-5">
          <p className="font-semibold">Tài khoản chưa có quyền quản trị</p>
          <p className="mt-1 text-sm">
            Nếu bạn là giáo viên hoặc thủ thư, hãy báo quản trị viên (kèm email <strong>{session.user.email}</strong>) để được cấp
            quyền, sau đó tải lại trang này. Học sinh xem sách đã mượn ở{" "}
            <Link href="/tai-khoan" className="font-bold text-primary underline">
              Sách tôi mượn
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {oChucNang.map((o) => (
            <li key={o.href}>
              <Link
                href={o.href}
                className={`the group flex h-full flex-col p-5 transition hover:-translate-y-1 hover:border-primary hover:shadow-clay-lg ${o.noiBat ? "!border-accent ring-2 ring-accent-soft" : ""}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className={`grid size-12 -rotate-3 place-items-center rounded-2xl shadow-clay ${o.tone}`}>
                    <o.icon className="size-5" aria-hidden />
                  </span>
                  {o.noiBat && (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">Cần xử lý</span>
                  )}
                </span>
                <span className="mt-4 block font-display text-lg font-bold group-hover:text-primary">{o.ten}</span>
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
