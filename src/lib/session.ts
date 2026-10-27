import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { VaiTro } from "@/db/schema";
import { getAuth, type Session } from "@/lib/auth";

/** Quản lý toàn bộ: duyệt tài liệu, nhập sổ ĐKCB */
export const STAFF_ROLES: VaiTro[] = ["admin", "thu_thu"];
/** Được đăng tài liệu (giáo viên đăng thì chờ duyệt) */
export const UPLOAD_ROLES: VaiTro[] = ["admin", "thu_thu", "giao_vien"];

/** Phiên đăng nhập hiện tại (null nếu chưa đăng nhập). Đọc headers nên phải gọi trong <Suspense>. */
export async function getSession(): Promise<Session | null> {
  // Đọc headers trước để Next dừng prerender ở đây, không khởi tạo auth/DB lúc build
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
}

export function hasRole(session: Session | null, roles: VaiTro[]): boolean {
  return !!session && roles.includes(session.user.role as VaiTro);
}

/** Dùng trong trang: chưa đăng nhập → /dang-nhap, thiếu quyền → /quan-tri. */
export async function requireRole(roles: VaiTro[]): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/dang-nhap");
  if (!hasRole(session, roles)) redirect("/quan-tri");
  return session;
}

/** Dùng trong Server Action / Route Handler: thiếu quyền thì ném lỗi. */
export async function assertRole(roles: VaiTro[]): Promise<Session> {
  const session = await getSession();
  if (!hasRole(session, roles)) throw new Error("Bạn không có quyền thực hiện thao tác này.");
  return session!;
}
