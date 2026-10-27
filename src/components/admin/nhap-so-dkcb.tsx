"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { nhapSoDkcb } from "@/app/quan-tri/so-dkcb-actions";
import { type CanhBao, docBang, docCsv, type DongSo } from "@/lib/so-dkcb";

const TEN_NGUON = { mua: "Mua", cap_phat: "Cấp phát", tang: "Tặng" };

async function docFile(file: File): Promise<unknown[][]> {
  if (/\.csv$/i.test(file.name)) return docCsv(await file.text());
  const { readSheet } = await import("read-excel-file/browser");
  return readSheet(file);
}

export function NhapSoDkcb() {
  const router = useRouter();
  const [dong, setDong] = useState<DongSo[]>([]);
  const [canhBao, setCanhBao] = useState<CanhBao[]>([]);
  const [tenFile, setTenFile] = useState("");
  const [thongBao, setThongBao] = useState<{ loai: "ok" | "loi"; noiDung: string } | null>(null);
  const [pending, startTransition] = useTransition();

  async function chonFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setThongBao(null);
    if (!file) return;
    try {
      const ketQua = docBang(await docFile(file));
      setTenFile(file.name);
      setDong(ketQua.dong);
      setCanhBao(ketQua.canhBao);
    } catch {
      setDong([]);
      setCanhBao([{ dong: 0, noiDung: "Không đọc được file. Hãy dùng .xlsx hoặc .csv (UTF-8).", loi: true }]);
    }
  }

  function nhap() {
    startTransition(async () => {
      const ketQua = await nhapSoDkcb(dong);
      if (!ketQua.ok) return setThongBao({ loai: "loi", noiDung: ketQua.error });
      setThongBao({
        loai: "ok",
        noiDung: `Đã nhập ${ketQua.banSachMoi} bản sách (${ketQua.dauSachMoi} đầu sách mới). ${ketQua.daCo ? `${ketQua.daCo} số ĐKCB đã có từ trước nên bỏ qua.` : ""}`,
      });
      setDong([]);
      setCanhBao([]);
      router.refresh();
    });
  }

  const canhBaoTheoDong = new Map<number, CanhBao[]>();
  canhBao.forEach((c) => canhBaoTheoDong.set(c.dong, [...(canhBaoTheoDong.get(c.dong) ?? []), c]));
  const soLoi = canhBao.filter((c) => c.loi).length;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg transition-opacity hover:opacity-90 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary">
          Chọn file Excel / CSV
          <input type="file" accept=".xlsx,.csv" onChange={chonFile} className="sr-only" />
        </label>
        <a href="/mau-so-dkcb.csv" download className="text-sm text-primary underline">
          Tải file mẫu
        </a>
        {tenFile && <span className="text-sm text-muted">{tenFile}</span>}
      </div>
      <p className="text-xs text-muted">
        Cột cần có: Số ĐKCB, Tên sách. Nên có: Tập, Tác giả, Nhà XB, Nơi XB, Năm XB, Phát không (x), Giá, Môn loại, Ngày nhập, Ghi chú.
        Ô ghi dấu nháy “〃” được hiểu là giống dòng trên.
      </p>

      {thongBao && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${thongBao.loai === "ok" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}
        >
          {thongBao.noiDung}
        </p>
      )}

      {canhBao.some((c) => c.dong === 0) && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {canhBao.find((c) => c.dong === 0)!.noiDung}
        </p>
      )}

      {dong.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <strong>{dong.length}</strong> bản sách hợp lệ ·{" "}
              <span className="text-accent">{canhBao.length - soLoi} cảnh báo</span> ·{" "}
              <span className="text-danger">{soLoi} dòng bị bỏ qua</span>
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={nhap}
              className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Đang nhập…" : `Nhập ${dong.length} bản sách`}
            </button>
          </div>

          {canhBao.length > 0 && (
            <details className="rounded-lg border border-accent bg-accent-soft p-3 text-sm" open={canhBao.length <= 15}>
              <summary className="cursor-pointer font-medium">Cần thủ thư xem lại ({canhBao.length})</summary>
              <ul className="mt-2 space-y-1">
                {canhBao.map((c, i) => (
                  <li key={i} className={c.loi ? "text-danger" : ""}>
                    Dòng {c.dong}: {c.noiDung}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="max-h-[28rem] overflow-auto rounded-lg border border-border">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="sticky top-0 bg-surface-muted text-xs uppercase text-muted">
                <tr>
                  {["Dòng", "Số ĐKCB", "Tên sách", "Tập", "Tác giả", "Nơi XB", "Năm", "Nguồn", "Giá", "Môn loại"].map((h) => (
                    <th key={h} className="px-2 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dong.slice(0, 500).map((d) => (
                  <tr key={d.soDkcb} className={canhBaoTheoDong.has(d.dong) ? "bg-accent-soft" : ""}>
                    <td className="px-2 py-1.5 text-muted">{d.dong}</td>
                    <td className="px-2 py-1.5 font-mono">{d.soDkcb}</td>
                    <td className="px-2 py-1.5">{d.ten}</td>
                    <td className="px-2 py-1.5">{d.tap}</td>
                    <td className="px-2 py-1.5">{d.tacGia}</td>
                    <td className="px-2 py-1.5">{d.noiXb}</td>
                    <td className="px-2 py-1.5">{d.namXb}</td>
                    <td className="px-2 py-1.5">{TEN_NGUON[d.nguon]}</td>
                    <td className="px-2 py-1.5 text-right">{d.gia?.toLocaleString("vi-VN")}</td>
                    <td className="px-2 py-1.5">{d.monLoai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dong.length > 500 && <p className="text-xs text-muted">Đang hiện 500 dòng đầu; khi nhập sẽ ghi đủ {dong.length} dòng.</p>}
        </>
      )}
    </div>
  );
}
