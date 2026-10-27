"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Download, KeyRound, Printer } from "lucide-react";
import { capLaiMatKhau, type HocSinhMoi, type MatKhauCap, taoTaiKhoanHocSinh } from "@/app/quan-tri/hoc-sinh-actions";
import { NUT_CHINH, NUT_PHU } from "@/components/ui";
import { docDanhSachHocSinh } from "@/lib/ma-hoc-sinh";
import { docCsv } from "@/lib/so-dkcb";

const O_NHAP =
  "mt-1 block min-h-11 w-full rounded-2xl border-[1.5px] border-border bg-surface-muted px-4 text-base outline-none transition focus:border-primary focus:bg-surface";

async function docFile(file: File): Promise<unknown[][]> {
  if (/\.csv$/i.test(file.name)) return docCsv(await file.text());
  const { readSheet } = await import("read-excel-file/browser");
  return readSheet(file);
}

function taiCsv(ds: MatKhauCap[]) {
  const dong = [["Mã HS", "Họ tên", "Lớp", "Mật khẩu"], ...ds.map((d) => [d.ma, d.hoTen, d.lop, d.matKhau])];
  const csv = "﻿" + dong.map((r) => r.map((o) => `"${o.replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = "mat-khau-hoc-sinh.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Thêm một học sinh hoặc nhập cả lớp từ file; hiện mật khẩu vừa cấp để in phát. */
export function TaoTaiKhoanHocSinh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [ketQua, setKetQua] = useState<{ moi: MatKhauCap[]; capNhat: number; loi: string[] } | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  function gui(ds: HocSinhMoi[], form?: HTMLFormElement) {
    setLoi(null);
    startTransition(async () => {
      const kq = await taoTaiKhoanHocSinh(ds);
      if (!kq.ok) return setLoi(kq.error);
      setKetQua({ moi: kq.moi, capNhat: kq.capNhat, loi: kq.loi });
      form?.reset();
      router.refresh();
    });
  }

  async function chonFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const ds = docDanhSachHocSinh(await docFile(file));
      if (!ds) return setLoi("Không thấy dòng tiêu đề có cột “Mã HS” và “Họ tên” trong file.");
      gui(ds);
    } catch {
      setLoi("Không đọc được file. Hãy dùng .xlsx hoặc .csv (UTF-8).");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <form
          className="the space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            gui([{ ma: String(f.get("ma")), hoTen: String(f.get("ho-ten")), lop: String(f.get("lop")) }], e.currentTarget);
          }}
        >
          <h2 className="text-lg font-bold">Thêm một học sinh</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_2fr_6rem]">
            <label className="text-sm font-bold">
              Mã HS
              <input name="ma" required autoComplete="off" className={O_NHAP} />
            </label>
            <label className="text-sm font-bold">
              Họ tên
              <input name="ho-ten" required autoComplete="off" className={O_NHAP} />
            </label>
            <label className="text-sm font-bold">
              Lớp
              <input name="lop" placeholder="6A" autoComplete="off" className={O_NHAP} />
            </label>
          </div>
          <button type="submit" disabled={pending} className={NUT_CHINH}>
            {pending ? "Đang tạo…" : "Tạo tài khoản"}
          </button>
        </form>

        <div className="the space-y-3 p-5">
          <h2 className="text-lg font-bold">Nhập cả lớp từ Excel</h2>
          <p className="text-sm text-muted">
            File .xlsx hoặc .csv có dòng tiêu đề gồm các cột <strong>Mã HS</strong>, <strong>Họ tên</strong>, <strong>Lớp</strong>.
            Mã đã có thì chỉ cập nhật họ tên, lớp — không đổi mật khẩu.
          </p>
          <label className={`${NUT_PHU} has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary`}>
            {pending ? "Đang nhập…" : "Chọn file danh sách"}
            <input type="file" accept=".xlsx,.csv" onChange={chonFile} disabled={pending} className="sr-only" />
          </label>
        </div>
      </div>

      {loi && (
        <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {loi}
        </p>
      )}

      {ketQua && (
        <div role="status" className="the space-y-3 p-5 print:border-0 print:shadow-none">
          <p className="font-bold">
            Đã tạo {ketQua.moi.length} tài khoản mới
            {ketQua.capNhat > 0 && `, cập nhật ${ketQua.capNhat} tài khoản đã có`}.
          </p>
          {ketQua.loi.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-5 text-sm text-danger">
              {ketQua.loi.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          )}
          {ketQua.moi.length > 0 && (
            <>
              <p className="rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent print:hidden">
                Mật khẩu chỉ hiện <strong>một lần</strong>. Hãy in hoặc tải danh sách để phát cho học sinh.
              </p>
              <div className="flex flex-wrap gap-2 print:hidden">
                <button type="button" onClick={() => window.print()} className={NUT_PHU}>
                  <Printer className="size-4" aria-hidden /> In danh sách
                </button>
                <button type="button" onClick={() => taiCsv(ketQua.moi)} className={NUT_PHU}>
                  <Download className="size-4" aria-hidden /> Tải file CSV
                </button>
              </div>
              <div className="overflow-x-auto rounded-2xl border-[1.5px] border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-muted text-xs uppercase text-muted">
                    <tr>
                      {["Mã HS", "Họ tên", "Lớp", "Mật khẩu"].map((h) => (
                        <th key={h} className="px-3 py-2 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ketQua.moi.map((d) => (
                      <tr key={d.ma}>
                        <td className="px-3 py-2 font-mono">{d.ma}</td>
                        <td className="px-3 py-2">{d.hoTen}</td>
                        <td className="px-3 py-2">{d.lop}</td>
                        <td className="px-3 py-2 font-mono font-bold">{d.matKhau}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function CapLaiMatKhauNut({ userId, ten }: { userId: string; ten: string }) {
  const [pending, startTransition] = useTransition();
  const [matKhau, setMatKhau] = useState<string | null>(null);

  if (matKhau) {
    return (
      <span className="rounded-full bg-accent-soft px-3 py-1.5 text-sm text-accent">
        Mật khẩu mới: <strong className="font-mono">{matKhau}</strong>
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Cấp mật khẩu mới cho ${ten}? Mật khẩu cũ sẽ không dùng được nữa.`)) return;
        startTransition(async () => {
          const kq = await capLaiMatKhau(userId);
          if (kq.ok) setMatKhau(kq.matKhau);
          else window.alert(kq.error);
        });
      }}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[1.5px] border-border px-4 text-sm font-bold transition hover:border-primary hover:text-primary disabled:opacity-60"
    >
      <KeyRound className="size-4" aria-hidden />
      {pending ? "Đang cấp…" : "Cấp lại mật khẩu"}
    </button>
  );
}
