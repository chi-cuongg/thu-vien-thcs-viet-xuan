import "server-only";
import { and, arrayContains, desc, eq, inArray, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/db";
import { banSach, danhMuc, dauSach, monHoc, phieuMuon, taiLieu } from "@/db/schema";

// Dữ liệu công khai, cache theo giờ. Khi thủ thư duyệt / nhập sổ, Server Action gọi updateTag để làm mới ngay.
export const TAG_TAI_LIEU = "tai-lieu";
export const TAG_SACH_GIAY = "sach-giay";

// Tài liệu hiện trong danh sách công khai: đã duyệt, không phải nội bộ (loại "dang_nhap" hiện kèm ổ khoá)
const congKhai = and(eq(taiLieu.trangThai, "da_duyet"), inArray(taiLieu.quyenTruyCap, ["cong_khai", "dang_nhap"]));

const theTaiLieu = {
  id: taiLieu.id,
  slug: taiLieu.slug,
  tieuDe: taiLieu.tieuDe,
  tacGia: taiLieu.tacGia,
  loai: taiLieu.loai,
  khoiLop: taiLieu.khoiLop,
  driveFileId: taiLieu.driveFileId,
  youtubeId: taiLieu.youtubeId,
  anhBiaUrl: taiLieu.anhBiaUrl,
  quyenTruyCap: taiLieu.quyenTruyCap,
  monHoc: monHoc.ten,
  createdAt: taiLieu.createdAt,
};

export type TheTaiLieu = Awaited<ReturnType<typeof getTaiLieuMoi>>[number];

export async function getTaiLieuMoi(limit = 8) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_TAI_LIEU);
  return getDb()
    .select(theTaiLieu)
    .from(taiLieu)
    .leftJoin(monHoc, eq(monHoc.id, taiLieu.monHocId))
    .where(congKhai)
    .orderBy(desc(taiLieu.createdAt))
    .limit(limit);
}

export async function getTaiLieuTheoDanhMuc(slug: string, khoi?: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_TAI_LIEU);
  return getDb()
    .select(theTaiLieu)
    .from(taiLieu)
    .innerJoin(danhMuc, eq(danhMuc.id, taiLieu.danhMucId))
    .leftJoin(monHoc, eq(monHoc.id, taiLieu.monHocId))
    .where(and(congKhai, eq(danhMuc.slug, slug), khoi ? arrayContains(taiLieu.khoiLop, [khoi]) : undefined))
    .orderBy(desc(taiLieu.createdAt))
    .limit(200);
}

export async function timTaiLieu(q: string, khoi?: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_TAI_LIEU);
  const khop = q
    ? sql`(${taiLieu.searchText} like '%' || vn_unaccent(${q}) || '%' or ${taiLieu.searchText} % vn_unaccent(${q}))`
    : undefined;
  return getDb()
    .select(theTaiLieu)
    .from(taiLieu)
    .leftJoin(monHoc, eq(monHoc.id, taiLieu.monHocId))
    .where(and(congKhai, khop, khoi ? arrayContains(taiLieu.khoiLop, [khoi]) : undefined))
    .orderBy(q ? sql`similarity(${taiLieu.searchText}, vn_unaccent(${q})) desc` : desc(taiLieu.createdAt))
    .limit(60);
}

export async function getTaiLieuChiTiet(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_TAI_LIEU);
  const [row] = await getDb()
    .select({
      ...theTaiLieu,
      moTa: taiLieu.moTa,
      boSach: taiLieu.boSach,
      choPhepTai: taiLieu.choPhepTai,
      mimeType: taiLieu.mimeType,
      kichThuoc: taiLieu.kichThuoc,
      nguon: taiLieu.nguon,
      danhMucSlug: danhMuc.slug,
      danhMucTen: danhMuc.ten,
    })
    .from(taiLieu)
    .leftJoin(monHoc, eq(monHoc.id, taiLieu.monHocId))
    .leftJoin(danhMuc, eq(danhMuc.id, taiLieu.danhMucId))
    .where(and(congKhai, eq(taiLieu.slug, slug)));
  return row ?? null;
}

/** Tra cứu sách giấy: đầu sách kèm số bản và số bản còn trên giá. */
export async function traCuuSachGiay(q: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_SACH_GIAY);
  const tuKhoa = q.trim();
  // Gõ số ĐKCB (vd. STK.01033) thì tìm theo bản sách
  const theoDkcb = /^[a-z]{2,4}\.?\d+$/i.test(tuKhoa);
  return getDb()
    .select({
      id: dauSach.id,
      ten: dauSach.ten,
      tap: dauSach.tap,
      tacGia: dauSach.tacGia,
      nhaXb: dauSach.nhaXb,
      noiXb: dauSach.noiXb,
      namXb: dauSach.namXb,
      monLoai: dauSach.monLoai,
      soBan: sql<number>`count(${banSach.id})::int`,
      conTrenGia: sql<number>`(count(${banSach.id}) filter (where ${banSach.tinhTrang} = 'tren_gia'))::int`,
      // Bản trên giá nhưng đã có bạn đặt trước, chờ đến nhận
      dangDat: sql<number>`(select count(*) from ${phieuMuon} where ${phieuMuon.dauSachId} = ${dauSach.id} and ${phieuMuon.trangThai} = 'cho_nhan')::int`,
      dsDkcb: sql<string[]>`array_agg(${banSach.soDkcb} order by ${banSach.soDkcb})`,
    })
    .from(dauSach)
    .innerJoin(banSach, eq(banSach.dauSachId, dauSach.id))
    .where(
      theoDkcb
        ? sql`${dauSach.id} in (select dau_sach_id from ban_sach where upper(so_dkcb) like upper(${tuKhoa}) || '%')`
        : sql`(${dauSach.searchText} like '%' || vn_unaccent(${tuKhoa}) || '%' or ${dauSach.searchText} % vn_unaccent(${tuKhoa}))`,
    )
    .groupBy(dauSach.id)
    .orderBy(theoDkcb ? dauSach.ten : sql`similarity(${dauSach.searchText}, vn_unaccent(${tuKhoa})) desc`)
    .limit(50);
}

export async function demSachGiay() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_SACH_GIAY);
  const [row] = await getDb()
    .select({
      dauSach: sql<number>`count(distinct ${banSach.dauSachId})::int`,
      banSach: sql<number>`count(*)::int`,
    })
    .from(banSach);
  return row;
}
