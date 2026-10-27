"use client";

import Link from "next/link";
import { useState } from "react";
import { luuTaiLieu, taoPhienUpload, type ThongTinTaiLieu } from "@/app/quan-tri/tai-lieu-actions";
import { BO_SACH, DANH_MUC, KHOI_LOP, LOAI_TAI_LIEU, MON_HOC, QUYEN_TRUY_CAP } from "@/config/taxonomy";

type TrangThai =
  | { buoc: "nhap" }
  | { buoc: "dang-tai"; phanTram: number }
  | { buoc: "dang-luu" }
  | { buoc: "xong"; slug: string; daDuyet: boolean }
  | { buoc: "loi"; thongBao: string };

/** Gửi file thẳng lên Google Drive qua phiên upload resumable, báo tiến độ. Trả về id file trên Drive. */
function guiFileLenDrive(uploadUrl: string, file: File, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText).id);
        } catch {
          reject(new Error("Google Drive trả về dữ liệu không đọc được."));
        }
      } else reject(new Error(`Tải file lên Drive thất bại (mã ${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Mất kết nối khi tải file lên Drive."));
    xhr.send(file);
  });
}

const input = "mt-1 min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/20";
const label = "block text-sm font-medium";

export function UploadForm({ laThuThu }: { laThuThu: boolean }) {
  const [trangThai, setTrangThai] = useState<TrangThai>({ buoc: "nhap" });
  const [nguon, setNguon] = useState<"file" | "youtube">("file");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    const thongTin: ThongTinTaiLieu = {
      tieuDe: String(form.get("tieuDe") ?? ""),
      tacGia: String(form.get("tacGia") ?? ""),
      moTa: String(form.get("moTa") ?? ""),
      loai: String(form.get("loai") ?? ""),
      danhMucSlug: String(form.get("danhMuc") ?? ""),
      monHocId: String(form.get("monHoc") ?? ""),
      khoiLop: form.getAll("khoiLop").map(Number),
      boSach: String(form.get("boSach") ?? ""),
      quyenTruyCap: String(form.get("quyenTruyCap") ?? "cong_khai"),
      choPhepTai: form.get("choPhepTai") === "on",
      nguon: String(form.get("nguon") ?? ""),
    };

    try {
      if (nguon === "file") {
        if (!(file instanceof File) || file.size === 0) throw new Error("Hãy chọn file cần đăng.");
        setTrangThai({ buoc: "dang-tai", phanTram: 0 });
        const phien = await taoPhienUpload({
          tenFile: file.name,
          mimeType: file.type || "application/octet-stream",
          kichThuoc: file.size,
          danhMucSlug: thongTin.danhMucSlug,
        });
        if (!phien.ok) throw new Error(phien.error);
        thongTin.driveFileId = await guiFileLenDrive(phien.uploadUrl, file, (phanTram) =>
          setTrangThai({ buoc: "dang-tai", phanTram }),
        );
      } else {
        thongTin.youtubeUrl = String(form.get("youtubeUrl") ?? "");
      }
      setTrangThai({ buoc: "dang-luu" });
      const ketQua = await luuTaiLieu(thongTin);
      if (!ketQua.ok) throw new Error(ketQua.error);
      setTrangThai({ buoc: "xong", slug: ketQua.slug, daDuyet: ketQua.daDuyet });
    } catch (error) {
      setTrangThai({ buoc: "loi", thongBao: error instanceof Error ? error.message : "Có lỗi xảy ra." });
    }
  }

  if (trangThai.buoc === "xong") {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="font-semibold">Đã đăng tài liệu.</p>
        <p className="mt-1 text-sm text-muted">
          {trangThai.daDuyet ? "Tài liệu đã hiển thị trên website." : "Tài liệu đang chờ thủ thư duyệt."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {trangThai.daDuyet && (
            <Link href={`/tai-lieu/${trangThai.slug}`} className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-fg">
              Xem tài liệu
            </Link>
          )}
          <button
            type="button"
            onClick={() => setTrangThai({ buoc: "nhap" })}
            className="rounded-lg border border-border px-4 py-2 font-medium hover:bg-surface-muted"
          >
            Đăng tài liệu khác
          </button>
        </div>
      </div>
    );
  }

  const dangXuLy = trangThai.buoc === "dang-tai" || trangThai.buoc === "dang-luu";

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-border bg-surface p-5 md:p-6">
      <fieldset disabled={dangXuLy} className="space-y-6">
        <div>
          <span className={label}>Nội dung</span>
          <div className="mt-2 inline-flex rounded-lg border border-border bg-surface-muted p-1 text-sm">
            {(["file", "youtube"] as const).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={nguon === n}
                onClick={() => setNguon(n)}
                className={`min-h-9 rounded-md px-4 font-medium transition-colors ${nguon === n ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-fg"}`}
              >
                {n === "file" ? "Tải file lên" : "Video YouTube"}
              </button>
            ))}
          </div>
          {nguon === "file" ? (
            <input
              name="file"
              type="file"
              required
              aria-label="Chọn file tài liệu"
              className={`${input} border-dashed py-3 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:font-medium file:text-primary`}
            />
          ) : (
            <input name="youtubeUrl" type="url" required placeholder="https://www.youtube.com/watch?v=…" className={input} />
          )}
          <p className="mt-1 text-xs text-muted">PDF, Word, PowerPoint, ảnh, âm thanh, video — tối đa 300 MB. File được lưu vào Google Drive của thư viện.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className={label}>Tiêu đề *</span>
            <input name="tieuDe" required minLength={3} className={input} />
          </label>
          <label>
            <span className={label}>Tác giả</span>
            <input name="tacGia" className={input} />
          </label>
          <label>
            <span className={label}>Loại tài liệu *</span>
            <select name="loai" required className={input} defaultValue="sach">
              {LOAI_TAI_LIEU.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.ten}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={label}>Danh mục *</span>
            <select name="danhMuc" required className={input}>
              {DANH_MUC.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.ten}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={label}>Môn học</span>
            <select name="monHoc" className={input} defaultValue="">
              <option value="">— Không theo môn —</option>
              {MON_HOC.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.ten}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className={label}>Khối lớp</legend>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              {KHOI_LOP.map((k) => (
                <label key={k} className="inline-flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="khoiLop" value={k} className="size-4 accent-primary" /> Lớp {k}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            <span className={label}>Bộ sách</span>
            <select name="boSach" className={input} defaultValue="">
              <option value="">— Không áp dụng —</option>
              {BO_SACH.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.ten}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className={label}>Mô tả</span>
            <textarea name="moTa" rows={3} className={input} />
          </label>
          <label>
            <span className={label}>Quyền xem</span>
            <select name="quyenTruyCap" className={input} defaultValue="cong_khai">
              {QUYEN_TRUY_CAP.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.ten} — {q.moTa}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={label}>Nguồn / giấy phép</span>
            <input name="nguon" placeholder="Ví dụ: giáo viên tự biên soạn" className={input} />
          </label>
          <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="choPhepTai" className="size-4 accent-primary" /> Cho phép tải file về (mặc định chỉ đọc online)
          </label>
        </div>
      </fieldset>

      {trangThai.buoc === "dang-tai" && (
        <div aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${trangThai.phanTram}%` }} />
          </div>
          <p className="mt-1 text-sm text-muted">Đang tải lên Google Drive… {trangThai.phanTram}%</p>
        </div>
      )}
      {trangThai.buoc === "dang-luu" && <p className="text-sm text-muted" aria-live="polite">Đang lưu thông tin…</p>}
      {trangThai.buoc === "loi" && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {trangThai.thongBao}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={dangXuLy} className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-fg transition-opacity hover:opacity-90 disabled:opacity-60">
          {laThuThu ? "Đăng tài liệu" : "Gửi để thủ thư duyệt"}
        </button>
      </div>
    </form>
  );
}
