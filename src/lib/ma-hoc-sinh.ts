import { boDau } from "@/lib/text";

// Mã học sinh dùng làm tên đăng nhập: chữ, số, dấu chấm, gạch ngang, gạch dưới (vd. 2024001, hs.6a.01)
const MAU_MA = /^[a-z0-9._-]{3,30}$/i;

export function laMaHocSinhHopLe(ma: string): boolean {
  return MAU_MA.test(ma);
}

/** Better Auth chuẩn hoá tên đăng nhập về chữ thường — làm giống vậy khi tạo / so khớp. */
export function chuanHoaMa(ma: string): string {
  return ma.trim().toLowerCase();
}

/** Email bắt buộc trong Better Auth: tài khoản học sinh dùng địa chỉ giả, đuôi .invalid không bao giờ gửi được. */
export function emailGiaHocSinh(ma: string): string {
  return `${chuanHoaMa(ma)}@hoc-sinh.invalid`;
}

export function laEmailGia(email: string): boolean {
  return email.endsWith("@hoc-sinh.invalid");
}

function tenCot(o: unknown): string {
  return boDau(String(o ?? ""))
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/**
 * Đọc danh sách lớp từ Excel / CSV: tìm dòng tiêu đề có cột Mã HS và Họ tên (Lớp không bắt buộc),
 * lấy các dòng bên dưới. Trả về null nếu không thấy tiêu đề.
 */
export function docDanhSachHocSinh(rows: unknown[][]): { ma: string; hoTen: string; lop: string }[] | null {
  const iTieuDe = rows.findIndex((r) => r.some((o) => /^ma(hs|hocsinh)?$/.test(tenCot(o))));
  if (iTieuDe < 0) return null;
  const tieuDe = rows[iTieuDe].map(tenCot);
  const cMa = tieuDe.findIndex((t) => /^ma(hs|hocsinh)?$/.test(t));
  const cTen = tieuDe.findIndex((t) => /^(hoten|hovaten|hotenhocsinh|ten)$/.test(t));
  const cLop = tieuDe.findIndex((t) => t === "lop");
  if (cTen < 0) return null;
  return rows
    .slice(iTieuDe + 1)
    .map((r) => ({
      ma: String(r[cMa] ?? "").trim(),
      hoTen: String(r[cTen] ?? "").trim(),
      lop: cLop >= 0 ? String(r[cLop] ?? "").trim() : "",
    }))
    .filter((hs) => hs.ma || hs.hoTen);
}
