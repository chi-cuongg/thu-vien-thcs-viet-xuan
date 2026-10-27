"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { ngayVN, SO_NGAY_MUON } from "@/config/muon-sach";
import { getDb } from "@/db";
import { TAG_SACH_GIAY } from "@/db/queries";
import { banSach, phieuMuon } from "@/db/schema";
import { assertRole, STAFF_ROLES } from "@/lib/session";
import type { KetQua } from "./tai-lieu-actions";

function loi(ten: string, error: unknown): { ok: false; error: string } {
  console.error(`[${ten}]`, error);
  return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra." };
}

/** Học sinh đến nhận: thủ thư chọn bản (số ĐKCB) đưa cho học sinh. */
export async function giaoSach(phieuId: number, soDkcb: string): Promise<KetQua<{ hanTra: string }>> {
  try {
    await assertRole(STAFF_ROLES);
    const db = getDb();
    const [phieu] = await db
      .select({ dauSachId: phieuMuon.dauSachId })
      .from(phieuMuon)
      .where(and(eq(phieuMuon.id, phieuId), eq(phieuMuon.trangThai, "cho_nhan")));
    if (!phieu) return { ok: false, error: "Phiếu không còn ở trạng thái chờ nhận." };

    const [ban] = await db
      .select({ id: banSach.id, dauSachId: banSach.dauSachId, tinhTrang: banSach.tinhTrang })
      .from(banSach)
      .where(eq(banSach.soDkcb, soDkcb));
    if (!ban || ban.dauSachId !== phieu.dauSachId) return { ok: false, error: `Số ĐKCB ${soDkcb} không thuộc đầu sách này.` };
    if (ban.tinhTrang !== "tren_gia") return { ok: false, error: `Bản ${soDkcb} không còn trên giá.` };

    const hanTra = ngayVN(SO_NGAY_MUON);
    // Driver HTTP của Neon không có transaction tương tác; batch chạy cả hai lệnh trong một transaction
    await db.batch([
      db
        .update(phieuMuon)
        .set({ trangThai: "dang_muon", banSachId: ban.id, ngayMuon: new Date(), hanTra })
        .where(and(eq(phieuMuon.id, phieuId), eq(phieuMuon.trangThai, "cho_nhan"))),
      db.update(banSach).set({ tinhTrang: "dang_muon" }).where(eq(banSach.id, ban.id)),
    ]);
    updateTag(TAG_SACH_GIAY);
    return { ok: true, hanTra };
  } catch (error) {
    return loi("giaoSach", error);
  }
}

/** Học sinh trả sách: phiếu đóng lại, bản sách về trên giá. */
export async function nhanTraSach(phieuId: number): Promise<KetQua> {
  try {
    await assertRole(STAFF_ROLES);
    const db = getDb();
    const [phieu] = await db
      .select({ banSachId: phieuMuon.banSachId })
      .from(phieuMuon)
      .where(and(eq(phieuMuon.id, phieuId), eq(phieuMuon.trangThai, "dang_muon")));
    if (!phieu) return { ok: false, error: "Phiếu không còn ở trạng thái đang mượn." };

    await db.batch([
      db.update(phieuMuon).set({ trangThai: "da_tra", ngayTra: new Date() }).where(eq(phieuMuon.id, phieuId)),
      ...(phieu.banSachId
        ? [db.update(banSach).set({ tinhTrang: "tren_gia" }).where(eq(banSach.id, phieu.banSachId))]
        : []),
    ] as const);
    updateTag(TAG_SACH_GIAY);
    return { ok: true };
  } catch (error) {
    return loi("nhanTraSach", error);
  }
}

/** Gia hạn thêm SO_NGAY_MUON ngày tính từ hôm nay. */
export async function giaHan(phieuId: number): Promise<KetQua<{ hanTra: string }>> {
  try {
    await assertRole(STAFF_ROLES);
    const hanTra = ngayVN(SO_NGAY_MUON);
    const rows = await getDb()
      .update(phieuMuon)
      .set({ hanTra })
      .where(and(eq(phieuMuon.id, phieuId), eq(phieuMuon.trangThai, "dang_muon")))
      .returning({ id: phieuMuon.id });
    if (!rows.length) return { ok: false, error: "Phiếu không còn ở trạng thái đang mượn." };
    return { ok: true, hanTra };
  } catch (error) {
    return loi("giaHan", error);
  }
}

/** Huỷ phiếu đặt khi học sinh không đến nhận. */
export async function huyPhieu(phieuId: number): Promise<KetQua> {
  try {
    await assertRole(STAFF_ROLES);
    const rows = await getDb()
      .update(phieuMuon)
      .set({ trangThai: "da_huy" })
      .where(and(eq(phieuMuon.id, phieuId), eq(phieuMuon.trangThai, "cho_nhan")))
      .returning({ id: phieuMuon.id });
    if (!rows.length) return { ok: false, error: "Phiếu không còn ở trạng thái chờ nhận." };
    updateTag(TAG_SACH_GIAY);
    return { ok: true };
  } catch (error) {
    return loi("huyPhieu", error);
  }
}
