import type { Metadata } from "next";
import { Suspense } from "react";
import { GiaoSachForm, NutTraSach } from "@/components/admin/muon-tra";
import { hienNgay, SO_NGAY_MUON, soNgayConLai } from "@/config/muon-sach";
import { getPhieuChoNhan, getPhieuDangMuon } from "@/db/muon-sach";
import { requireRole, STAFF_ROLES } from "@/lib/session";

export const metadata: Metadata = { title: "Mượn trả sách" };

function HocSinh({ hoTen, lop, ma, email }: { hoTen: string; lop: string | null; ma: string | null; email: string }) {
  return (
    <p className="text-sm">
      <strong>{hoTen}</strong>
      <span className="text-muted">
        {lop && ` · Lớp ${lop}`}
        {ma ? ` · Mã ${ma}` : ` · ${email}`}
      </span>
    </p>
  );
}

async function DanhSach() {
  await requireRole(STAFF_ROLES, "/quan-tri/muon-tra");
  const [choNhan, dangMuon] = await Promise.all([getPhieuChoNhan(), getPhieuDangMuon()]);

  return (
    <div className="space-y-10">
      <section aria-labelledby="cho-nhan">
        <h2 id="cho-nhan" className="text-xl font-bold">
          Chờ nhận sách ({choNhan.length})
        </h2>
        <p className="mt-1 text-sm text-muted">
          Học sinh đến nhận: chọn bản đưa cho em rồi bấm “Giao sách”. Hạn trả tự đặt sau {SO_NGAY_MUON} ngày.
        </p>
        {choNhan.length === 0 ? (
          <p className="mt-3 rounded-3xl bg-surface-muted px-5 py-6 text-center text-sm text-muted">Không có phiếu nào đang chờ.</p>
        ) : (
          <ul className="the mt-3 divide-y divide-border">
            {choNhan.map((p) => (
              <li key={p.id} className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {p.ten}
                    {p.tap && ` – ${p.tap}`}
                  </p>
                  <HocSinh {...p} />
                  <p className="mt-0.5 text-xs text-muted">Đặt ngày {hienNgay(p.createdAt)}</p>
                </div>
                <GiaoSachForm phieuId={p.id} dsDkcb={p.banConTrenGia} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="dang-muon">
        <h2 id="dang-muon" className="text-xl font-bold">
          Đang mượn ({dangMuon.length})
        </h2>
        <p className="mt-1 text-sm text-muted">Sắp theo hạn trả, phiếu quá hạn ở trên cùng.</p>
        {dangMuon.length === 0 ? (
          <p className="mt-3 rounded-3xl bg-surface-muted px-5 py-6 text-center text-sm text-muted">Chưa có sách nào đang được mượn.</p>
        ) : (
          <ul className="the mt-3 divide-y divide-border">
            {dangMuon.map((p) => {
              const con = p.hanTra ? soNgayConLai(p.hanTra) : 0;
              return (
                <li
                  key={p.id}
                  className={`flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between ${con < 0 ? "bg-danger-soft/50" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {p.ten}
                      {p.tap && ` – ${p.tap}`} <span className="font-mono text-sm font-normal text-muted">{p.soDkcb}</span>
                    </p>
                    <HocSinh {...p} />
                    <p className={`mt-0.5 text-xs font-bold ${con < 0 ? "text-danger" : "text-muted"}`}>
                      Hạn trả {hienNgay(p.hanTra)}
                      {con < 0 && ` · quá hạn ${-con} ngày`}
                    </p>
                  </div>
                  <NutTraSach phieuId={p.id} ten={p.ten} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function MuonTraPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Mượn trả sách</h1>
      <p className="mt-1 text-sm text-muted">Phiếu học sinh đặt mượn trên web và sách đang cho mượn.</p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-48 the" aria-busy />}>
          <DanhSach />
        </Suspense>
      </div>
    </div>
  );
}
