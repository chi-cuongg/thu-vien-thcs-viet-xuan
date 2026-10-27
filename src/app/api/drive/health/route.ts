import { connection } from "next/server";
import { getFile, rootFolderId } from "@/lib/google-drive";

// Kiểm tra nhanh kết nối Drive sau khi deploy: GET /api/drive/health
export async function GET() {
  await connection();
  try {
    const folder = await getFile(rootFolderId());
    return Response.json({ ok: true, folder: folder.name });
  } catch (error) {
    console.error("[drive/health]", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
