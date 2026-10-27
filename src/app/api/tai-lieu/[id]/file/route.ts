import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { taiLieu } from "@/db/schema";
import { downloadFile } from "@/lib/google-drive";
import { getSession, hasRole, STAFF_ROLES } from "@/lib/session";

// Xem file chưa công khai trên Drive qua server: tài liệu chờ duyệt (thủ thư / người đăng),
// tài liệu "cần đăng nhập" và "nội bộ". Tài liệu công khai thì xem thẳng bằng trình xem Drive.
export async function GET(request: Request, { params }: RouteContext<"/api/tai-lieu/[id]/file">) {
  const { id } = await params;
  const session = await getSession();
  const [row] = await getDb()
    .select()
    .from(taiLieu)
    .where(eq(taiLieu.id, Number(id)));
  if (!row?.driveFileId) return new Response("Không tìm thấy", { status: 404 });

  const laThuThu = hasRole(session, STAFF_ROLES);
  const laNguoiDang = !!session && row.nguoiDang === session.user.id;
  const docDuoc =
    laThuThu ||
    laNguoiDang ||
    (row.trangThai === "da_duyet" &&
      (row.quyenTruyCap === "cong_khai" || (row.quyenTruyCap === "dang_nhap" && !!session)));
  if (!docDuoc) return new Response("Không có quyền xem tài liệu này", { status: session ? 403 : 401 });

  const file = await downloadFile(row.driveFileId);
  const taiVe = new URL(request.url).searchParams.has("tai-ve") && (row.choPhepTai || laThuThu);
  const tenFile = encodeURIComponent(row.tieuDe);
  return new Response(file.body, {
    headers: {
      "Content-Type": row.mimeType ?? file.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": `${taiVe ? "attachment" : "inline"}; filename*=UTF-8''${tenFile}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
