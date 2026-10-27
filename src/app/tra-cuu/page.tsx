import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SearchBox } from "@/components/search-box";
import { demSachGiay, traCuuSachGiay } from "@/db/queries";

export const metadata: Metadata = { title: "Tra cứu sách giấy" };

async function KetQua({ searchParams }: Pick<PageProps<"/tra-cuu">, "searchParams">) {
  const { q } = await searchParams;
  const tuKhoa = ((Array.isArray(q) ? q[0] : q)?.trim() ?? "").slice(0, 100);
  const [ketQua, tong] = await Promise.all([tuKhoa ? traCuuSachGiay(tuKhoa) : Promise.resolve([]), demSachGiay()]);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <SearchBox id="q-tra-cuu" action="/tra-cuu" defaultValue={tuKhoa} placeholder="Tên sách, tác giả, số ĐKCB…" />
        {tong.banSach > 0 && (
          <p className="mt-2 text-sm text-muted">
            Kho có {tong.dauSach.toLocaleString("vi-VN")} đầu sách, {tong.banSach.toLocaleString("vi-VN")} bản.
          </p>
        )}
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {ketQua.length ? (
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
            {ketQua.map((s) => (
              <li key={s.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {s.ten}
                    {s.tap && ` – ${s.tap}`}
                  </p>
                  <p className="text-sm text-muted">
                    {[s.tacGia, s.nhaXb, s.noiXb, s.namXb, s.monLoai && `Môn loại ${s.monLoai}`].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted">{s.dsDkcb.join(", ")}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${s.conTrenGia > 0 ? "bg-primary-soft text-primary" : "bg-surface-muted text-muted"}`}
                >
                  {s.conTrenGia > 0 ? `Còn ${s.conTrenGia}/${s.soBan} bản trên giá` : `Đã mượn hết (${s.soBan} bản)`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={tuKhoa ? `Không tìm thấy sách cho “${tuKhoa}”` : "Nhập tên sách, tác giả hoặc số ĐKCB"}>
            {tong.banSach === 0 && "Thư viện đang nhập dữ liệu từ sổ đăng ký cá biệt."}
          </EmptyState>
        )}
      </div>
    </>
  );
}

export default function TraCuuPage({ searchParams }: PageProps<"/tra-cuu">) {
  return (
    <>
      <PageHeader
        title="Tra cứu sách giấy"
        description="Tìm sách có trong kho của thư viện, xem còn bao nhiêu bản trên giá để đến mượn."
      />
      <Suspense fallback={<div className="mx-auto h-40 max-w-6xl px-4 py-8" aria-busy />}>
        <KetQua searchParams={searchParams} />
      </Suspense>
    </>
  );
}
