"use server";

import { inArray, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { getDb } from "@/db";
import { TAG_SACH_GIAY } from "@/db/queries";
import { banSach, dauSach, monLoai } from "@/db/schema";
import { assertRole, STAFF_ROLES } from "@/lib/session";
import { type DongSo, khoaDauSach } from "@/lib/so-dkcb";
import type { KetQua } from "./tai-lieu-actions";

const TOI_DA = 3000;

function cat<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
}

/**
 * Ghi các bản sách vào CSDL: gom thành đầu sách (theo tên + tập + tác giả + năm),
 * bỏ qua số ĐKCB đã có. Chạy lại cùng một file không bị nhân đôi.
 */
export async function nhapSoDkcb(
  dong: DongSo[],
): Promise<KetQua<{ dauSachMoi: number; banSachMoi: number; daCo: number }>> {
  try {
    await assertRole(STAFF_ROLES);
    if (dong.length === 0) return { ok: false, error: "Không có dòng nào để nhập." };
    if (dong.length > TOI_DA) return { ok: false, error: `Mỗi lần nhập tối đa ${TOI_DA} dòng — hãy chia file nhỏ hơn.` };
    const hopLe = dong.filter((d) => d.soDkcb && d.ten);

    const db = getDb();
    const daCo = new Set<string>();
    for (const phan of cat(hopLe.map((d) => d.soDkcb), 500)) {
      const rows = await db.select({ so: banSach.soDkcb }).from(banSach).where(inArray(banSach.soDkcb, phan));
      rows.forEach((r) => daCo.add(r.so));
    }
    const canNhap = hopLe.filter((d) => !daCo.has(d.soDkcb));
    if (canNhap.length === 0) return { ok: true, dauSachMoi: 0, banSachMoi: 0, daCo: daCo.size };

    // Ký hiệu môn loại mới: thêm vào bảng tra (tên tạm = ký hiệu, thủ thư sửa sau)
    const maMonLoai = [...new Set(canNhap.map((d) => d.monLoai).filter((m): m is string => !!m))];
    if (maMonLoai.length) {
      await db.insert(monLoai).values(maMonLoai.map((ma) => ({ ma, ten: ma }))).onConflictDoNothing();
    }

    // Đầu sách đã có trong CSDL
    const idTheoKhoa = new Map<string, number>();
    const tenCanTim = [...new Set(canNhap.map((d) => d.ten))];
    for (const phan of cat(tenCanTim, 500)) {
      const rows = await db
        .select({ id: dauSach.id, ten: dauSach.ten, tap: dauSach.tap, tacGia: dauSach.tacGia, namXb: dauSach.namXb })
        .from(dauSach)
        .where(inArray(dauSach.ten, phan));
      rows.forEach((r) => idTheoKhoa.set(khoaDauSach(r), r.id));
    }

    // Tạo đầu sách mới
    const dauSachMoi = new Map<string, DongSo>();
    for (const d of canNhap) {
      const khoa = khoaDauSach(d);
      if (!idTheoKhoa.has(khoa) && !dauSachMoi.has(khoa)) dauSachMoi.set(khoa, d);
    }
    for (const phan of cat([...dauSachMoi.entries()], 300)) {
      const rows = await db
        .insert(dauSach)
        .values(
          phan.map(([, d]) => ({
            ten: d.ten,
            tap: d.tap,
            tacGia: d.tacGia,
            nhaXb: d.nhaXb,
            noiXb: d.noiXb,
            namXb: d.namXb,
            monLoai: d.monLoai,
          })),
        )
        .returning({ id: dauSach.id, ten: dauSach.ten, tap: dauSach.tap, tacGia: dauSach.tacGia, namXb: dauSach.namXb });
      rows.forEach((r) => idTheoKhoa.set(khoaDauSach(r), r.id));
    }

    let banSachMoi = 0;
    for (const phan of cat(canNhap, 500)) {
      const rows = await db
        .insert(banSach)
        .values(
          phan.map((d) => ({
            soDkcb: d.soDkcb,
            dauSachId: idTheoKhoa.get(khoaDauSach(d))!,
            kho: d.soDkcb.match(/^[A-Z]+/)?.[0] ?? "KHAC",
            nguon: d.nguon,
            gia: d.gia,
            ngayNhap: d.ngayNhap,
            ghiChu: d.ghiChu,
          })),
        )
        .onConflictDoNothing({ target: banSach.soDkcb })
        .returning({ id: banSach.id });
      banSachMoi += rows.length;
    }

    updateTag(TAG_SACH_GIAY);
    return { ok: true, dauSachMoi: dauSachMoi.size, banSachMoi, daCo: daCo.size };
  } catch (error) {
    console.error("[nhapSoDkcb]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra." };
  }
}

export async function doiTinhTrangBanSach(soDkcb: string, tinhTrang: string): Promise<KetQua> {
  try {
    await assertRole(STAFF_ROLES);
    if (!["tren_gia", "dang_muon", "hong", "mat", "thanh_ly"].includes(tinhTrang)) {
      return { ok: false, error: "Tình trạng không hợp lệ." };
    }
    await getDb()
      .update(banSach)
      .set({ tinhTrang })
      .where(sql`${banSach.soDkcb} = ${soDkcb}`);
    updateTag(TAG_SACH_GIAY);
    return { ok: true };
  } catch (error) {
    console.error("[doiTinhTrangBanSach]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra." };
  }
}
