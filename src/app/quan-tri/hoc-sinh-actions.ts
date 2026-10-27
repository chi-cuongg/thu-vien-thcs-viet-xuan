"use server";

import { randomInt, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { account, session, user } from "@/db/schema";
import { chuanHoaMa, emailGiaHocSinh, laMaHocSinhHopLe } from "@/lib/ma-hoc-sinh";
import { assertRole, STAFF_ROLES } from "@/lib/session";
import type { KetQua } from "./tai-lieu-actions";

export type HocSinhMoi = { ma: string; hoTen: string; lop: string };
export type MatKhauCap = { ma: string; hoTen: string; lop: string; matKhau: string };

const TOI_DA = 1500;
// Bỏ các ký tự dễ nhầm (0/o, 1/l/i) vì học sinh gõ lại từ giấy
const KY_TU = "abcdefghjkmnpqrstuvwxyz23456789";

function taoMatKhau(): string {
  return Array.from({ length: 8 }, () => KY_TU[randomInt(KY_TU.length)]).join("");
}

/**
 * Tạo tài khoản học sinh (đăng nhập bằng mã HS). Mã đã có thì chỉ cập nhật họ tên, lớp — giữ nguyên mật khẩu.
 * Trả về mật khẩu của tài khoản mới để thủ thư in phát cho học sinh (chỉ hiện một lần).
 */
export async function taoTaiKhoanHocSinh(
  ds: HocSinhMoi[],
): Promise<KetQua<{ moi: MatKhauCap[]; capNhat: number; loi: string[] }>> {
  try {
    await assertRole(STAFF_ROLES);
    if (ds.length === 0) return { ok: false, error: "Chưa có học sinh nào." };
    if (ds.length > TOI_DA) return { ok: false, error: `Mỗi lần tối đa ${TOI_DA} học sinh — hãy chia file nhỏ hơn.` };

    const loi: string[] = [];
    const theoMa = new Map<string, HocSinhMoi>();
    for (const hs of ds) {
      const ma = chuanHoaMa(hs.ma);
      const hoTen = hs.hoTen.trim().replace(/\s+/g, " ");
      if (!laMaHocSinhHopLe(ma)) loi.push(`Mã “${hs.ma}” không hợp lệ (3–30 ký tự: chữ, số, . - _).`);
      else if (!hoTen) loi.push(`Mã ${hs.ma}: thiếu họ tên.`);
      else theoMa.set(ma, { ma, hoTen, lop: hs.lop.trim().toUpperCase() });
    }

    const db = getDb();
    const daCo = new Set(
      theoMa.size
        ? (await db.select({ ma: user.username }).from(user).where(inArray(user.username, [...theoMa.keys()]))).map((r) => r.ma!)
        : [],
    );

    for (const ma of daCo) {
      const hs = theoMa.get(ma)!;
      await db.update(user).set({ name: hs.hoTen, lop: hs.lop || null }).where(eq(user.username, ma));
    }

    const moi: MatKhauCap[] = [];
    const canTao = [...theoMa.values()].filter((hs) => !daCo.has(hs.ma));
    for (const hs of canTao) {
      const matKhau = taoMatKhau();
      const id = randomUUID();
      // Tạo user + tài khoản mật khẩu ("credential" — cùng cấu trúc Better Auth tự tạo khi đăng ký bằng mật khẩu)
      await db.batch([
        db.insert(user).values({
          id,
          name: hs.hoTen,
          email: emailGiaHocSinh(hs.ma),
          emailVerified: true,
          username: hs.ma,
          displayUsername: hs.ma,
          lop: hs.lop || null,
          role: "nguoi_dung",
        }),
        db.insert(account).values({
          id: randomUUID(),
          accountId: id,
          providerId: "credential",
          userId: id,
          password: await hashPassword(matKhau),
        }),
      ]);
      moi.push({ ...hs, matKhau });
    }

    return { ok: true, moi, capNhat: daCo.size, loi };
  } catch (error) {
    console.error("[taoTaiKhoanHocSinh]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra." };
  }
}

/** Học sinh quên mật khẩu: cấp mật khẩu mới và đăng xuất khỏi mọi thiết bị. */
export async function capLaiMatKhau(userId: string): Promise<KetQua<{ matKhau: string }>> {
  try {
    await assertRole(STAFF_ROLES);
    const db = getDb();
    const [hs] = await db
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.id, userId), isNotNull(user.username)));
    if (!hs) return { ok: false, error: "Không tìm thấy tài khoản học sinh." };

    const matKhau = taoMatKhau();
    await db.batch([
      db
        .update(account)
        .set({ password: await hashPassword(matKhau) })
        .where(and(eq(account.userId, userId), eq(account.providerId, "credential"))),
      db.delete(session).where(eq(session.userId, userId)),
    ]);
    return { ok: true, matKhau };
  } catch (error) {
    console.error("[capLaiMatKhau]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra." };
  }
}
