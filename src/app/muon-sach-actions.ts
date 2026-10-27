"use server";

import { and, eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { TOI_DA_MUON } from "@/config/muon-sach";
import { getDb } from "@/db";
import { demPhieuHieuLuc } from "@/db/muon-sach";
import { TAG_SACH_GIAY } from "@/db/queries";
import { banSach, phieuMuon } from "@/db/schema";
import { getSession } from "@/lib/session";
import type { KetQua } from "./quan-tri/tai-lieu-actions";

/** Học sinh đặt mượn một đầu sách; đến thư viện nhận bản cụ thể. */
export async function datMuon(dauSachId: number): Promise<KetQua | { ok: false; error: string; canDangNhap: true }> {
  try {
    const session = await getSession();
    if (!session) return { ok: false, error: "Cần đăng nhập để đặt mượn sách.", canDangNhap: true };
    const userId = session.user.id;
    const db = getDb();

    const [daDat] = await db
      .select({ id: phieuMuon.id })
      .from(phieuMuon)
      .where(
        and(
          eq(phieuMuon.userId, userId),
          eq(phieuMuon.dauSachId, dauSachId),
          sql`${phieuMuon.trangThai} in ('cho_nhan', 'dang_muon')`,
        ),
      );
    if (daDat) return { ok: false, error: "Em đã đặt hoặc đang mượn cuốn này rồi." };

    if ((await demPhieuHieuLuc(userId)) >= TOI_DA_MUON) {
      return { ok: false, error: `Mỗi em giữ tối đa ${TOI_DA_MUON} cuốn cùng lúc. Trả bớt sách hoặc huỷ phiếu đặt để mượn thêm.` };
    }

    const [{ trenGia }] = await db
      .select({ trenGia: sql<number>`count(*)::int` })
      .from(banSach)
      .where(and(eq(banSach.dauSachId, dauSachId), eq(banSach.tinhTrang, "tren_gia")));
    const [{ dangDat }] = await db
      .select({ dangDat: sql<number>`count(*)::int` })
      .from(phieuMuon)
      .where(and(eq(phieuMuon.dauSachId, dauSachId), eq(phieuMuon.trangThai, "cho_nhan")));
    if (trenGia - dangDat <= 0) return { ok: false, error: "Sách vừa hết bản trên giá. Hãy thử lại sau khi có bạn trả." };

    await db.insert(phieuMuon).values({ userId, dauSachId });
    updateTag(TAG_SACH_GIAY);
    return { ok: true };
  } catch (error) {
    console.error("[datMuon]", error);
    return { ok: false, error: "Không đặt được, thử lại sau." };
  }
}

/** Học sinh tự huỷ phiếu chưa nhận sách. */
export async function huyDatMuon(phieuId: number): Promise<KetQua> {
  try {
    const session = await getSession();
    if (!session) return { ok: false, error: "Phiên đăng nhập đã hết, hãy đăng nhập lại." };
    const rows = await getDb()
      .update(phieuMuon)
      .set({ trangThai: "da_huy" })
      .where(
        and(eq(phieuMuon.id, phieuId), eq(phieuMuon.userId, session.user.id), eq(phieuMuon.trangThai, "cho_nhan")),
      )
      .returning({ id: phieuMuon.id });
    if (!rows.length) return { ok: false, error: "Phiếu này không còn huỷ được." };
    updateTag(TAG_SACH_GIAY);
    return { ok: true };
  } catch (error) {
    console.error("[huyDatMuon]", error);
    return { ok: false, error: "Không huỷ được, thử lại sau." };
  }
}
