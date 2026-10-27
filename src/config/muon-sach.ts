import type { TrangThaiMuon } from "@/db/schema";

/** Số ngày được mượn kể từ khi nhận sách */
export const SO_NGAY_MUON = 14;
/** Số cuốn tối đa một học sinh giữ cùng lúc (đang đặt + đang mượn) */
export const TOI_DA_MUON = 3;

export const TEN_TRANG_THAI_MUON: Record<TrangThaiMuon, string> = {
  cho_nhan: "Chờ nhận sách",
  dang_muon: "Đang mượn",
  da_tra: "Đã trả",
  da_huy: "Đã huỷ",
};

/** Ngày dạng YYYY-MM-DD theo giờ Việt Nam, cộng thêm `soNgay` ngày */
export function ngayVN(soNgay = 0): string {
  return new Date(Date.now() + soNgay * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

/** "2026-11-10" → "10/11/2026" */
export function hienNgay(ngay: string | Date | null): string {
  if (!ngay) return "";
  if (ngay instanceof Date) return ngay.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const [y, m, d] = ngay.split("-");
  return `${d}/${m}/${y}`;
}

/** Số ngày còn lại tới hạn trả (âm = quá hạn) */
export function soNgayConLai(hanTra: string): number {
  return Math.round((Date.parse(hanTra) - Date.parse(ngayVN())) / 86_400_000);
}
