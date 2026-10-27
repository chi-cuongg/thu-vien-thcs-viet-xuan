// Đọc dữ liệu sổ đăng ký cá biệt (Excel/CSV) thành từng bản sách, kèm cảnh báo cho thủ thư kiểm tra.
// Dùng được ở cả trình duyệt (xem trước) và server (kiểm tra lại trước khi ghi).

import { boDau } from "@/lib/text";

export type DongSo = {
  dong: number; // số dòng trong file, để báo lỗi
  soDkcb: string;
  ten: string;
  tap: string | null;
  tacGia: string | null;
  nhaXb: string | null;
  noiXb: string | null;
  namXb: number | null;
  nguon: "mua" | "cap_phat" | "tang";
  gia: number | null;
  monLoai: string | null;
  ngayNhap: string | null; // yyyy-mm-dd
  ghiChu: string | null;
};

export type CanhBao = { dong: number; noiDung: string; loi?: boolean };

type Cot = Exclude<keyof DongSo, "dong" | "nguon"> | "phatKhong" | "nguon";

// Tên cột (đã bỏ dấu, chữ thường) → trường dữ liệu
const TEN_COT: [Cot, string[]][] = [
  ["soDkcb", ["so dkcb", "dkcb", "so dang ky ca biet", "so dang ky"]],
  ["ten", ["ten sach", "nhan de", "ten tai lieu", "ten"]],
  ["tap", ["tap"]],
  ["tacGia", ["tac gia"]],
  ["nhaXb", ["nha xb", "nha xuat ban", "nxb"]],
  ["noiXb", ["noi xb", "noi xuat ban"]],
  ["namXb", ["nam xb", "nam xuat ban", "nam"]],
  ["phatKhong", ["phat khong", "cap phat"]],
  ["gia", ["gia tien", "gia", "mua", "don gia"]],
  ["nguon", ["nguon"]],
  ["monLoai", ["mon loai", "ky hieu phan loai", "phan loai"]],
  ["ngayNhap", ["ngay nhap", "ngay vao so"]],
  ["ghiChu", ["ghi chu"]],
];

const DAU_NHAY = /^(〃|"|''|”|“|〃〃|ditto|-\s*nt\s*-|nt)$/i;
const NOI_XB: Record<string, string> = { h: "Hà Nội", hn: "Hà Nội", "tp hcm": "TP. Hồ Chí Minh", hcm: "TP. Hồ Chí Minh" };

function chuan(s: string): string {
  return boDau(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function chuoi(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).trim();
}

function soNguyen(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v) : null;
  const s = chuoi(v).replace(/[.,\s]/g, "").replace(/đ|vnd/gi, "");
  return /^\d+$/.test(s) ? Number(s) : null;
}

function ngay(v: unknown): string | null {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = chuoi(v);
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

/** Tách "Những bài toán… / Tập 1" thành tên + tập */
function tachTap(ten: string): { ten: string; tap: string | null } {
  const m = ten.match(/^(.*?)[\s/–-]*\b(T(?:ậ|a)p\s*\d+|T\.?\s*\d+)\s*$/i);
  if (!m || !m[1].trim()) return { ten, tap: null };
  const so = m[2].match(/\d+/)![0];
  return { ten: m[1].trim().replace(/[\s/–-]+$/, ""), tap: `Tập ${so}` };
}

export function docBang(rows: unknown[][]): { dong: DongSo[]; canhBao: CanhBao[] } {
  const canhBao: CanhBao[] = [];
  // Tìm dòng tiêu đề: dòng đầu tiên có cột "Số ĐKCB" và "Tên sách"
  const viTriTieuDe = rows.findIndex((r) => {
    const cells = r.map((c) => chuan(chuoi(c)));
    return cells.some((c) => c.includes("dkcb")) && cells.some((c) => c.startsWith("ten") || c.includes("nhan de"));
  });
  if (viTriTieuDe < 0) {
    return { dong: [], canhBao: [{ dong: 0, noiDung: "Không tìm thấy dòng tiêu đề có cột “Số ĐKCB” và “Tên sách”.", loi: true }] };
  }

  const tieuDe = rows[viTriTieuDe].map((c) => chuan(chuoi(c)));
  const cot = new Map<Cot, number>();
  for (const [truong, ten] of TEN_COT) {
    const i = tieuDe.findIndex((h, idx) => ![...cot.values()].includes(idx) && ten.some((t) => h === t || h.startsWith(t)));
    if (i >= 0) cot.set(truong, i);
  }

  const ketQua: DongSo[] = [];
  const truoc: Record<string, string> = {};
  const daGap = new Map<string, number>();
  const namNay = new Date().getFullYear();

  rows.slice(viTriTieuDe + 1).forEach((r, idx) => {
    const soDong = viTriTieuDe + idx + 2;
    const lay = (truong: Cot): string => {
      const i = cot.get(truong);
      const v = i == null ? "" : chuoi(r[i]);
      // Ô ghi bằng dấu nháy "〃" nghĩa là giống dòng trên
      if (DAU_NHAY.test(v)) return truoc[truong] ?? "";
      if (v) truoc[truong] = v;
      return v;
    };
    const soDkcb = lay("soDkcb").toUpperCase().replace(/\s+/g, "");
    const tenGoc = lay("ten");
    if (!soDkcb && !tenGoc) return; // dòng trống
    if (!soDkcb) return canhBao.push({ dong: soDong, noiDung: "Thiếu số ĐKCB — bỏ qua dòng này.", loi: true });
    if (!tenGoc) return canhBao.push({ dong: soDong, noiDung: `${soDkcb}: thiếu tên sách — bỏ qua dòng này.`, loi: true });
    if (daGap.has(soDkcb)) {
      return canhBao.push({ dong: soDong, noiDung: `${soDkcb} trùng với dòng ${daGap.get(soDkcb)} — bỏ qua.`, loi: true });
    }
    daGap.set(soDkcb, soDong);
    if (!/^[A-Z]{2,5}\.?\d+$/.test(soDkcb)) canhBao.push({ dong: soDong, noiDung: `Số ĐKCB “${soDkcb}” không đúng dạng thường gặp (vd. STK.01033).` });

    const tapCot = lay("tap");
    const { ten, tap } = tapCot ? { ten: tenGoc, tap: /^\d+$/.test(tapCot) ? `Tập ${tapCot}` : tapCot } : tachTap(tenGoc);

    const namXb = soNguyen(lay("namXb"));
    if (namXb != null && (namXb < 1900 || namXb > namNay)) canhBao.push({ dong: soDong, noiDung: `${soDkcb}: năm xuất bản ${namXb} bất thường.` });

    const gia = soNguyen(lay("gia"));
    const phatKhong = chuan(lay("phatKhong"));
    const nguonCot = chuan(lay("nguon"));
    const nguon: DongSo["nguon"] =
      phatKhong === "x" || nguonCot.includes("phat") || nguonCot.includes("cap") ? "cap_phat" : nguonCot.includes("tang") ? "tang" : "mua";

    // Giá tăng đúng 1 đồng so với bản trước cùng tên — thường do kéo-thả tự điền trong Excel
    const banTruoc = ketQua.at(-1);
    if (banTruoc && gia != null && banTruoc.gia != null && banTruoc.ten === ten && gia - banTruoc.gia === 1) {
      canhBao.push({ dong: soDong, noiDung: `${soDkcb}: giá ${gia.toLocaleString("vi-VN")} hơn bản trước đúng 1 đồng — có thể do Excel tự điền.` });
    }

    const noiXbGoc = lay("noiXb");
    ketQua.push({
      dong: soDong,
      soDkcb,
      ten,
      tap,
      tacGia: lay("tacGia") || null,
      nhaXb: lay("nhaXb") || null,
      noiXb: noiXbGoc ? (NOI_XB[chuan(noiXbGoc)] ?? noiXbGoc) : null,
      namXb,
      nguon,
      gia,
      monLoai: lay("monLoai").replace(/\s+/g, "") || null,
      ngayNhap: ngay(lay("ngayNhap")),
      ghiChu: lay("ghiChu") || null,
    });
  });

  return { dong: ketQua, canhBao };
}

/** Đọc CSV (dấu phẩy, chấm phẩy hoặc tab; có ngoặc kép). */
export function docCsv(text: string): string[][] {
  const noiDung = text.replace(/^﻿/, "");
  const dongDau = noiDung.split(/\r?\n/, 1)[0] ?? "";
  const phanCach = [";", "\t", ","].sort((a, b) => dongDau.split(b).length - dongDau.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let trongNgoac = false;
  for (let i = 0; i < noiDung.length; i++) {
    const ch = noiDung[i];
    if (trongNgoac) {
      if (ch === '"' && noiDung[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') trongNgoac = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") trongNgoac = true;
    else if (ch === phanCach) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && noiDung[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) rows.push([...row, cell]);
  return rows;
}

/** Khoá gom các bản thành một đầu sách */
export function khoaDauSach(d: Pick<DongSo, "ten" | "tap" | "tacGia" | "namXb">): string {
  return [chuan(d.ten), chuan(d.tap ?? ""), chuan(d.tacGia ?? ""), d.namXb ?? ""].join("|");
}
