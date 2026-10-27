"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { BO_SACH, findDanhMuc, KHOI_LOP, LOAI_TAI_LIEU, MON_HOC, QUYEN_TRUY_CAP } from "@/config/taxonomy";
import { getDb } from "@/db";
import { TAG_TAI_LIEU } from "@/db/queries";
import { danhMuc, taiLieu } from "@/db/schema";
import {
  createResumableUploadSession,
  findOrCreateFolder,
  getFile,
  makePublicReadable,
  setDownloadRestricted,
  trashFile,
} from "@/lib/google-drive";
import { assertRole, hasRole, STAFF_ROLES, UPLOAD_ROLES } from "@/lib/session";
import { slugify } from "@/lib/text";

export type KetQua<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const MAX_SIZE = 300 * 1024 * 1024; // 300 MB
const MIME_CHO_PHEP = [
  /^application\/pdf$/,
  /^application\/epub\+zip$/,
  /^application\/msword$/,
  /^application\/vnd\.ms-(powerpoint|excel)$/,
  /^application\/vnd\.openxmlformats-officedocument\./,
  /^image\//,
  /^audio\//,
  /^video\//,
];

function loiThanThien(error: unknown): string {
  return error instanceof Error ? error.message : "Có lỗi xảy ra, thử lại sau.";
}

/** Bước 1: tạo phiên upload trên Drive; trình duyệt tự gửi file lên Google. */
export async function taoPhienUpload(input: {
  tenFile: string;
  mimeType: string;
  kichThuoc: number;
  danhMucSlug: string;
}): Promise<KetQua<{ uploadUrl: string }>> {
  try {
    const session = await assertRole(UPLOAD_ROLES);
    if (input.kichThuoc <= 0 || input.kichThuoc > MAX_SIZE) return { ok: false, error: "File phải nhỏ hơn 300 MB." };
    if (!MIME_CHO_PHEP.some((re) => re.test(input.mimeType))) {
      return { ok: false, error: "Chỉ nhận PDF, EPUB, Word, PowerPoint, Excel, ảnh, âm thanh, video." };
    }
    const dm = findDanhMuc(input.danhMucSlug);
    if (!dm) return { ok: false, error: "Danh mục không hợp lệ." };

    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin") ?? process.env.BETTER_AUTH_URL ?? "";
    const uploadUrl = await createResumableUploadSession({
      name: input.tenFile.slice(0, 200),
      mimeType: input.mimeType,
      size: input.kichThuoc,
      parentId: await findOrCreateFolder(dm.ten),
      origin,
      appProperties: { uploader: session.user.id },
    });
    return { ok: true, uploadUrl };
  } catch (error) {
    console.error("[taoPhienUpload]", error);
    return { ok: false, error: loiThanThien(error) };
  }
}

export type ThongTinTaiLieu = {
  tieuDe: string;
  tacGia: string;
  moTa: string;
  loai: string;
  danhMucSlug: string;
  monHocId: string;
  khoiLop: number[];
  boSach: string;
  quyenTruyCap: string;
  choPhepTai: boolean;
  nguon: string;
  driveFileId?: string;
  youtubeUrl?: string;
};

function layYoutubeId(url: string): string | null {
  const m = url.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m?.[1] ?? null;
}

/** Chia sẻ file trên Drive theo quyền truy cập: công khai thì ai có link đều xem; chặn tải nếu không cho phép. */
async function congBoTrenDrive(fileId: string, quyenTruyCap: string, choPhepTai: boolean) {
  if (quyenTruyCap === "cong_khai") await makePublicReadable(fileId);
  await setDownloadRestricted(fileId, !choPhepTai);
}

/** Bước 2: lưu thông tin tài liệu. Thủ thư đăng thì duyệt luôn; giáo viên đăng thì chờ duyệt. */
export async function luuTaiLieu(input: ThongTinTaiLieu): Promise<KetQua<{ slug: string; daDuyet: boolean }>> {
  try {
    const session = await assertRole(UPLOAD_ROLES);
    const tieuDe = input.tieuDe.trim();
    if (tieuDe.length < 3) return { ok: false, error: "Tiêu đề quá ngắn." };
    if (!LOAI_TAI_LIEU.some((l) => l.id === input.loai)) return { ok: false, error: "Loại tài liệu không hợp lệ." };
    if (!QUYEN_TRUY_CAP.some((q) => q.id === input.quyenTruyCap)) return { ok: false, error: "Quyền truy cập không hợp lệ." };
    if (input.monHocId && !MON_HOC.some((m) => m.id === input.monHocId)) return { ok: false, error: "Môn học không hợp lệ." };
    if (input.boSach && !BO_SACH.some((b) => b.id === input.boSach)) return { ok: false, error: "Bộ sách không hợp lệ." };
    const khoiLop = input.khoiLop.filter((k) => (KHOI_LOP as readonly number[]).includes(k));

    const db = getDb();
    const [dm] = await db.select({ id: danhMuc.id }).from(danhMuc).where(eq(danhMuc.slug, input.danhMucSlug));
    if (!dm) return { ok: false, error: "Danh mục không hợp lệ." };

    let file: Awaited<ReturnType<typeof getFile>> | null = null;
    if (input.driveFileId) {
      file = await getFile(input.driveFileId);
      // Chỉ nhận file do chính người này vừa upload qua website
      if (file.appProperties?.uploader !== session.user.id) return { ok: false, error: "File không hợp lệ." };
    }
    const youtubeId = input.youtubeUrl ? layYoutubeId(input.youtubeUrl) : null;
    if (input.youtubeUrl && !youtubeId) return { ok: false, error: "Link YouTube không hợp lệ." };
    if (!file && !youtubeId) return { ok: false, error: "Cần chọn file hoặc nhập link YouTube." };

    const daDuyet = hasRole(session, STAFF_ROLES);
    if (file && daDuyet) await congBoTrenDrive(file.id, input.quyenTruyCap, input.choPhepTai);

    const slug = `${slugify(tieuDe).slice(0, 70)}-${Date.now().toString(36)}`;
    await db.insert(taiLieu).values({
      slug,
      tieuDe,
      tacGia: input.tacGia.trim() || null,
      moTa: input.moTa.trim() || null,
      loai: input.loai,
      danhMucId: dm.id,
      monHocId: input.monHocId || null,
      khoiLop,
      boSach: input.boSach || null,
      driveFileId: file?.id ?? null,
      mimeType: file?.mimeType ?? null,
      kichThuoc: file?.size ? Number(file.size) : null,
      youtubeId,
      quyenTruyCap: input.quyenTruyCap,
      choPhepTai: input.choPhepTai,
      nguon: input.nguon.trim() || null,
      trangThai: daDuyet ? "da_duyet" : "cho_duyet",
      nguoiDang: session.user.id,
    });
    if (daDuyet) updateTag(TAG_TAI_LIEU);
    return { ok: true, slug, daDuyet };
  } catch (error) {
    console.error("[luuTaiLieu]", error);
    return { ok: false, error: loiThanThien(error) };
  }
}

export async function duyetTaiLieu(id: number): Promise<KetQua> {
  try {
    await assertRole(STAFF_ROLES);
    const db = getDb();
    const [row] = await db.select().from(taiLieu).where(eq(taiLieu.id, id));
    if (!row) return { ok: false, error: "Không tìm thấy tài liệu." };
    if (row.driveFileId) await congBoTrenDrive(row.driveFileId, row.quyenTruyCap, row.choPhepTai);
    await db.update(taiLieu).set({ trangThai: "da_duyet" }).where(eq(taiLieu.id, id));
    updateTag(TAG_TAI_LIEU);
    return { ok: true };
  } catch (error) {
    console.error("[duyetTaiLieu]", error);
    return { ok: false, error: loiThanThien(error) };
  }
}

export async function tuChoiTaiLieu(id: number): Promise<KetQua> {
  try {
    await assertRole(STAFF_ROLES);
    await getDb().update(taiLieu).set({ trangThai: "tu_choi" }).where(eq(taiLieu.id, id));
    updateTag(TAG_TAI_LIEU);
    return { ok: true };
  } catch (error) {
    console.error("[tuChoiTaiLieu]", error);
    return { ok: false, error: loiThanThien(error) };
  }
}

/** Thủ thư xoá mọi tài liệu; giáo viên chỉ xoá tài liệu của mình đang chờ duyệt. File Drive vào thùng rác. */
export async function xoaTaiLieu(id: number): Promise<KetQua> {
  try {
    const session = await assertRole(UPLOAD_ROLES);
    const db = getDb();
    const laThuThu = hasRole(session, STAFF_ROLES);
    const [row] = await db
      .select()
      .from(taiLieu)
      .where(
        laThuThu
          ? eq(taiLieu.id, id)
          : and(eq(taiLieu.id, id), eq(taiLieu.nguoiDang, session.user.id), eq(taiLieu.trangThai, "cho_duyet")),
      );
    if (!row) return { ok: false, error: "Không xoá được tài liệu này." };
    if (row.driveFileId) await trashFile(row.driveFileId);
    await db.delete(taiLieu).where(eq(taiLieu.id, id));
    updateTag(TAG_TAI_LIEU);
    return { ok: true };
  } catch (error) {
    console.error("[xoaTaiLieu]", error);
    return { ok: false, error: loiThanThien(error) };
  }
}
