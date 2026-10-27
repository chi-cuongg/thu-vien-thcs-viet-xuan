import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { banSach, dauSach, phieuMuon, user } from "@/db/schema";

// Dữ liệu mượn trả thay đổi liên tục và gắn với từng người — không cache.

const thongTinSach = {
  ten: dauSach.ten,
  tap: dauSach.tap,
  tacGia: dauSach.tacGia,
};

const thongTinHocSinh = {
  hoTen: user.name,
  lop: user.lop,
  ma: user.displayUsername,
  email: user.email,
};

export async function getPhieuCuaToi(userId: string) {
  return getDb()
    .select({
      id: phieuMuon.id,
      trangThai: phieuMuon.trangThai,
      hanTra: phieuMuon.hanTra,
      ngayMuon: phieuMuon.ngayMuon,
      ngayTra: phieuMuon.ngayTra,
      createdAt: phieuMuon.createdAt,
      soDkcb: banSach.soDkcb,
      ...thongTinSach,
    })
    .from(phieuMuon)
    .innerJoin(dauSach, eq(dauSach.id, phieuMuon.dauSachId))
    .leftJoin(banSach, eq(banSach.id, phieuMuon.banSachId))
    .where(eq(phieuMuon.userId, userId))
    .orderBy(desc(phieuMuon.createdAt))
    .limit(50);
}

/** Phiếu học sinh đã đặt, chờ đến thư viện nhận — kèm các số ĐKCB còn trên giá để thủ thư chọn bản giao. */
export async function getPhieuChoNhan() {
  return getDb()
    .select({
      id: phieuMuon.id,
      createdAt: phieuMuon.createdAt,
      ...thongTinSach,
      ...thongTinHocSinh,
      banConTrenGia: sql<string[]>`array(
        select ${banSach.soDkcb} from ${banSach}
        where ${banSach.dauSachId} = ${phieuMuon.dauSachId} and ${banSach.tinhTrang} = 'tren_gia'
        order by ${banSach.soDkcb}
      )`,
    })
    .from(phieuMuon)
    .innerJoin(dauSach, eq(dauSach.id, phieuMuon.dauSachId))
    .innerJoin(user, eq(user.id, phieuMuon.userId))
    .where(eq(phieuMuon.trangThai, "cho_nhan"))
    .orderBy(asc(phieuMuon.createdAt));
}

export async function getPhieuDangMuon() {
  return getDb()
    .select({
      id: phieuMuon.id,
      hanTra: phieuMuon.hanTra,
      ngayMuon: phieuMuon.ngayMuon,
      soDkcb: banSach.soDkcb,
      ...thongTinSach,
      ...thongTinHocSinh,
    })
    .from(phieuMuon)
    .innerJoin(dauSach, eq(dauSach.id, phieuMuon.dauSachId))
    .innerJoin(user, eq(user.id, phieuMuon.userId))
    .leftJoin(banSach, eq(banSach.id, phieuMuon.banSachId))
    .where(eq(phieuMuon.trangThai, "dang_muon"))
    .orderBy(asc(phieuMuon.hanTra));
}

/** Số phiếu chờ nhận / đang mượn / quá hạn — cho ô tổng quan ở trang quản trị */
export async function demPhieuMuon() {
  const [row] = await getDb()
    .select({
      choNhan: sql<number>`(count(*) filter (where ${phieuMuon.trangThai} = 'cho_nhan'))::int`,
      dangMuon: sql<number>`(count(*) filter (where ${phieuMuon.trangThai} = 'dang_muon'))::int`,
      quaHan: sql<number>`(count(*) filter (where ${phieuMuon.trangThai} = 'dang_muon' and ${phieuMuon.hanTra} < (now() at time zone 'Asia/Ho_Chi_Minh')::date))::int`,
    })
    .from(phieuMuon)
    .where(inArray(phieuMuon.trangThai, ["cho_nhan", "dang_muon"]));
  return row;
}

/** Số phiếu đang hiệu lực của một học sinh (để giới hạn số cuốn giữ cùng lúc) */
export async function demPhieuHieuLuc(userId: string) {
  const [row] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(phieuMuon)
    .where(and(eq(phieuMuon.userId, userId), inArray(phieuMuon.trangThai, ["cho_nhan", "dang_muon"])));
  return row.n;
}
