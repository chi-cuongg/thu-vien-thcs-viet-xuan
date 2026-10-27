"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { user, VAI_TRO, type VaiTro } from "@/db/schema";
import { assertRole } from "@/lib/session";
import type { KetQua } from "./tai-lieu-actions";

/** Chỉ admin cấp quyền; không tự hạ quyền của chính mình để tránh mất quyền quản trị. */
export async function doiVaiTro(userId: string, vaiTro: VaiTro): Promise<KetQua> {
  try {
    const session = await assertRole(["admin"]);
    if (!VAI_TRO.includes(vaiTro)) return { ok: false, error: "Vai trò không hợp lệ." };
    if (userId === session.user.id) return { ok: false, error: "Không thể tự đổi quyền của chính mình." };
    await getDb().update(user).set({ role: vaiTro }).where(eq(user.id, userId));
    return { ok: true };
  } catch (error) {
    console.error("[doiVaiTro]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra." };
  }
}
