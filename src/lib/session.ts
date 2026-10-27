import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { VaiTro } from "@/db/schema";
import { getAuth, type Session } from "@/lib/auth";

/** Quản lý toàn bộ: duyệt tài liệu, nhập sổ ĐKCB */
export const STAFF_ROLES: VaiTro[] = ["admin", "thu_thu"];
/** Được đăng tài liệu (giáo viên đăng thì chờ duyệt) */
export const UPLOAD_ROLES: VaiTro[] = ["admin", "thu_thu", "giao_vien"];

/** Phiên đăng nhập hiện tại (null nếu chưa đăng nhập). Đọc headers nên phải gọi trong <Suspense>. */
export async function getSession(): Promise<Session | null> {
  // connection(): phiên đăng nhập chỉ đọc lúc có request thật — không chạy trong prerender (kể cả bản prerender
  // có cookie mà Next dùng để kiểm tra ở chế độ dev), tránh lỗi new Date() / truy vấn bị huỷ giữa chừng.
  await connection();
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
}

export function hasRole(session: Session | null, roles: VaiTro[]): boolean {
  return !!session && roles.includes(session.user.role as VaiTro);
}

/** Đường dẫn trang đăng nhập, quay lại `tiep` sau khi đăng nhập xong. */
export function duongDanDangNhap(tiep: string): string {
  return `/dang-nhap?tiep=${encodeURIComponent(tiep)}`;
}

/** Chỉ nhận đường dẫn nội bộ ("/..."), chặn chuyển hướng sang trang khác ("//evil.com"). */
export function tiepHopLe(tiep: string | string[] | undefined): string | null {
  const s = Array.isArray(tiep) ? tiep[0] : tiep;
  return s && s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : null;
}

/** Dùng trong trang cần đăng nhập (bất kỳ vai trò nào). */
export async function requireSession(tiep: string): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(duongDanDangNhap(tiep));
  return session;
}

/** Dùng trong trang: chưa đăng nhập → /dang-nhap, thiếu quyền → /quan-tri. */
export async function requireRole(roles: VaiTro[], tiep = "/quan-tri"): Promise<Session> {
  const session = await requireSession(tiep);
  if (!hasRole(session, roles)) redirect("/quan-tri");
  return session;
}

/** Dùng trong Server Action / Route Handler: thiếu quyền thì ném lỗi. */
export async function assertRole(roles: VaiTro[]): Promise<Session> {
  const session = await getSession();
  if (!hasRole(session, roles)) throw new Error("Bạn không có quyền thực hiện thao tác này.");
  return session!;
}
