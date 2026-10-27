import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookMarked, Clock, LayoutDashboard, Search, TriangleAlert } from "lucide-react";
import { SignOutButton } from "@/components/auth-buttons";
import { HuyDatNut } from "@/components/dat-muon-nut";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { DongDangTai, NUT_CHINH, NUT_PHU } from "@/components/ui";
import { hienNgay, SO_NGAY_MUON, soNgayConLai, TEN_TRANG_THAI_MUON, TOI_DA_MUON } from "@/config/muon-sach";
import { TEN_VAI_TRO } from "@/config/vai-tro";
import { getPhieuCuaToi } from "@/db/muon-sach";
import type { VaiTro } from "@/db/schema";
import { laEmailGia } from "@/lib/ma-hoc-sinh";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sách tôi mượn" };

type Phieu = Awaited<ReturnType<typeof getPhieuCuaToi>>[number];

function TenSach({ p }: { p: Phieu }) {
  return (
    <div className="min-w-0">
      <p className="font-semibold">
        {p.ten}
        {p.tap && ` – ${p.tap}`}
      </p>
      {p.tacGia && <p className="mt-0.5 text-sm text-muted">{p.tacGia}</p>}
    </div>
  );
}

function HanTra({ hanTra }: { hanTra: string }) {
  const con = soNgayConLai(hanTra);
  const [mau, chu] =
    con < 0
      ? ["bg-danger-soft text-danger", `Quá hạn ${-con} ngày — trả sớm nhé!`]
      : con <= 2
        ? ["bg-accent-soft text-accent", con === 0 ? "Hạn trả hôm nay" : `Còn ${con} ngày`]
        : ["bg-success-soft text-success", `Còn ${con} ngày`];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${mau}`}>
      {con < 0 ? <TriangleAlert className="size-4" aria-hidden /> : <Clock className="size-4" aria-hidden />}
      {chu} · hạn {hienNgay(hanTra)}
    </span>
  );
}

async function NoiDung() {
  const session = await requireSession("/tai-khoan");
  const { id, name, email, role, lop, displayUsername } = session.user;
  const vaiTro = role as VaiTro;
  const phieu = await getPhieuCuaToi(id);
  const choNhan = phieu.filter((p) => p.trangThai === "cho_nhan");
  const dangMuon = phieu.filter((p) => p.trangThai === "dang_muon");
  const lichSu = phieu.filter((p) => p.trangThai === "da_tra" || p.trangThai === "da_huy");

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[18rem_1fr]">
      <aside className="space-y-4">
        <div className="the p-5">
          <span
            className="grid size-14 -rotate-3 place-items-center rounded-2xl bg-gradient-to-br from-tone-orange to-tone-pink font-display text-2xl font-bold text-white shadow-nut dark:text-bg"
            aria-hidden
          >
            {name.trim().split(/\s+/).pop()?.[0]?.toUpperCase()}
          </span>
          <p className="mt-4 font-display text-xl font-bold">{name}</p>
          <p className="mt-0.5 text-sm text-muted [overflow-wrap:anywhere]">
            {laEmailGia(email) ? `Mã HS: ${displayUsername}${lop ? ` · Lớp ${lop}` : ""}` : email}
          </p>
          {vaiTro !== "nguoi_dung" && (
            <span className="mt-2 inline-block rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-bold">{TEN_VAI_TRO[vaiTro]}</span>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {vaiTro !== "nguoi_dung" && (
              <Link href="/quan-tri" className={`${NUT_CHINH} min-h-10 px-4 text-sm`}>
                <LayoutDashboard className="size-4" aria-hidden /> Trang quản trị
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
        <div className="rounded-3xl bg-tone-yellow-soft p-5 text-sm text-tone-yellow">
          <p className="font-bold">Quy định mượn</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Giữ tối đa {TOI_DA_MUON} cuốn cùng lúc.</li>
            <li>Mượn {SO_NGAY_MUON} ngày, hết hạn có thể nhờ thủ thư gia hạn.</li>
            <li>Đặt xong hãy đến thư viện nhận sách trong vài ngày.</li>
          </ul>
        </div>
      </aside>

      <div className="min-w-0 space-y-8">
        {phieu.length === 0 && (
          <EmptyState
            icon={BookMarked}
            title="Em chưa mượn cuốn nào"
            actions={
              <Link href="/tra-cuu" className={NUT_CHINH}>
                <Search className="size-4" aria-hidden /> Tìm sách để mượn
              </Link>
            }
          >
            Tra cứu sách giấy, bấm “Đặt mượn” ở cuốn còn trên giá rồi đến thư viện nhận sách.
          </EmptyState>
        )}

        {dangMuon.length > 0 && (
          <section aria-labelledby="dang-muon">
            <h2 id="dang-muon" className="text-xl font-bold">
              Đang mượn ({dangMuon.length})
            </h2>
            <ul className="the mt-3 divide-y divide-border">
              {dangMuon.map((p) => (
                <li key={p.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <TenSach p={p} />
                    <p className="mt-1 text-xs text-muted">
                      Số ĐKCB <span className="font-mono text-fg">{p.soDkcb}</span> · nhận ngày {hienNgay(p.ngayMuon)}
                    </p>
                  </div>
                  {p.hanTra && <HanTra hanTra={p.hanTra} />}
                </li>
              ))}
            </ul>
          </section>
        )}

        {choNhan.length > 0 && (
          <section aria-labelledby="cho-nhan">
            <h2 id="cho-nhan" className="text-xl font-bold">
              Đã đặt, chờ nhận ({choNhan.length})
            </h2>
            <p className="mt-1 text-sm text-muted">Đến thư viện, báo tên cho thủ thư để nhận sách.</p>
            <ul className="the mt-3 divide-y divide-border">
              {choNhan.map((p) => (
                <li key={p.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <TenSach p={p} />
                    <p className="mt-1 text-xs text-muted">Đặt ngày {hienNgay(p.createdAt)}</p>
                  </div>
                  <HuyDatNut phieuId={p.id} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {lichSu.length > 0 && (
          <section aria-labelledby="lich-su">
            <h2 id="lich-su" className="text-xl font-bold">
              Đã mượn trước đây
            </h2>
            <ul className="the mt-3 divide-y divide-border">
              {lichSu.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <TenSach p={p} />
                  <span className="text-sm text-muted">
                    {TEN_TRANG_THAI_MUON[p.trangThai]}
                    {p.trangThai === "da_tra" && p.ngayTra && ` ngày ${hienNgay(p.ngayTra)}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {phieu.length > 0 && (
          <Link href="/tra-cuu" className={NUT_PHU}>
            <Search className="size-4" aria-hidden /> Mượn thêm sách
          </Link>
        )}
      </div>
    </div>
  );
}

export default function TaiKhoanPage() {
  return (
    <>
      <PageHeader title="Sách tôi mượn" description="Theo dõi sách đang mượn, hạn trả và các phiếu đã đặt." />
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-8">
            <DongDangTai />
          </div>
        }
      >
        <NoiDung />
      </Suspense>
    </>
  );
}
