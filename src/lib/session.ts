import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { VaiTro } from "@/db/schema";
import { getAuth, type Session } from "@/lib/auth";

export const STAFF_ROLES: VaiTro[] = ["admin", "thu_thu"];

/** Phiên đăng nhập hiện tại (null nếu chưa đăng nhập). Đọc headers nên phải gọi trong <Suspense>. */
export async function getSession(): Promise<Session | null> {
  // Đọc headers trước để Next dừng prerender ở đây, không khởi tạo auth/DB lúc build
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
}

/** Bắt buộc đăng nhập với một trong các quyền cho trước; chưa đăng nhập thì chuyển tới /dang-nhap. */
export async function requireRole(roles: VaiTro[]): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/dang-nhap");
  if (!roles.includes(session.user.role as VaiTro)) redirect("/quan-tri");
  return session;
}
