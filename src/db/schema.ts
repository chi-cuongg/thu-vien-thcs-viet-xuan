// Schema CSDL (Neon Postgres) — Drizzle ORM.
// Bảng người dùng / phiên đăng nhập theo đúng cấu trúc Better Auth; các bảng còn lại là dữ liệu thư viện.
// Hàm vn_unaccent và extension unaccent, pg_trgm được tạo ở migration drizzle/0000_extensions.sql.

import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
const id = () => bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity();

export const VAI_TRO = ["admin", "thu_thu", "giao_vien", "nguoi_dung"] as const;
export type VaiTro = (typeof VAI_TRO)[number];

// ---------------------------------------------------------------------------
// Better Auth: user, session, account, verification
// ---------------------------------------------------------------------------

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    // admin, thu_thu: quản lý toàn bộ; giao_vien: đăng tài liệu chờ duyệt; nguoi_dung: học sinh / bạn đọc (đặt mượn sách)
    role: text("role").$type<VaiTro>().notNull().default("nguoi_dung"),
    // Tài khoản học sinh do thủ thư cấp: đăng nhập bằng mã học sinh (plugin username của Better Auth)
    username: text("username").unique(),
    displayUsername: text("display_username"),
    lop: text("lop"), // '6A', '9C'
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [check("user_role_check", sql`${t.role} in ('admin', 'thu_thu', 'giao_vien', 'nguoi_dung')`)],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// ---------------------------------------------------------------------------
// Danh mục & bảng tra
// ---------------------------------------------------------------------------

export const monHoc = pgTable("mon_hoc", {
  id: text("id").primaryKey(), // slug: 'toan', 'ngu-van', ...
  ten: text("ten").notNull(),
  thuTu: smallint("thu_tu").notNull().default(0),
});

export const danhMuc = pgTable("danh_muc", {
  id: id(),
  slug: text("slug").notNull().unique(),
  ten: text("ten").notNull(),
  nhom: text("nhom").notNull(), // 'sach-dien-tu', 'hoc-lieu', 'van-ban', 'hoat-dong'
  moTa: text("mo_ta"),
  thuTu: smallint("thu_tu").notNull().default(0),
});

// Ký hiệu môn loại (bảng phân loại 19 lớp) trong sổ đăng ký cá biệt, ví dụ '51(083)'
export const monLoai = pgTable("mon_loai", {
  ma: text("ma").primaryKey(),
  ten: text("ten").notNull(),
});

// ---------------------------------------------------------------------------
// Sách giấy: một đầu sách có nhiều bản, mỗi bản một số ĐKCB
// ---------------------------------------------------------------------------

export const dauSach = pgTable(
  "dau_sach",
  {
    id: id(),
    ten: text("ten").notNull(),
    tap: text("tap"), // 'Tập 1'
    tacGia: text("tac_gia"),
    nhaXb: text("nha_xb"),
    noiXb: text("noi_xb"),
    namXb: smallint("nam_xb"),
    isbn: text("isbn"),
    monLoai: text("mon_loai").references(() => monLoai.ma, { onUpdate: "cascade" }),
    monHocId: text("mon_hoc_id").references(() => monHoc.id),
    khoiLop: smallint("khoi_lop").array().notNull().default(sql`'{}'`),
    tomTat: text("tom_tat"),
    anhBiaUrl: text("anh_bia_url"),
    createdAt: createdAt(),
    searchText: text("search_text").generatedAlwaysAs(
      (): ReturnType<typeof sql> =>
        sql`vn_unaccent(${dauSach.ten} || ' ' || coalesce(${dauSach.tap}, '') || ' ' || coalesce(${dauSach.tacGia}, ''))`,
    ),
  },
  (t) => [index("dau_sach_search_idx").using("gin", t.searchText.op("gin_trgm_ops"))],
);

export const banSach = pgTable(
  "ban_sach",
  {
    id: id(),
    soDkcb: text("so_dkcb").notNull().unique(), // 'STK.01033'
    dauSachId: bigint("dau_sach_id", { mode: "number" })
      .notNull()
      .references(() => dauSach.id, { onDelete: "cascade" }),
    kho: text("kho").notNull(), // tiền tố ĐKCB: 'STK', 'SGK', 'SNV', ...
    nguon: text("nguon").notNull().default("mua"),
    gia: integer("gia"),
    ngayNhap: date("ngay_nhap"),
    tinhTrang: text("tinh_trang").notNull().default("tren_gia"),
    viTri: text("vi_tri"),
    ghiChu: text("ghi_chu"),
  },
  (t) => [
    index("ban_sach_dau_sach_idx").on(t.dauSachId),
    check("ban_sach_nguon_check", sql`${t.nguon} in ('mua', 'cap_phat', 'tang')`),
    check(
      "ban_sach_tinh_trang_check",
      sql`${t.tinhTrang} in ('tren_gia', 'dang_muon', 'hong', 'mat', 'thanh_ly')`,
    ),
  ],
);

// Phiếu mượn: học sinh đặt một đầu sách (cho_nhan) → thủ thư giao một bản cụ thể (dang_muon) → trả (da_tra).
// Huỷ khi học sinh đổi ý hoặc không đến nhận (da_huy).
export const TRANG_THAI_MUON = ["cho_nhan", "dang_muon", "da_tra", "da_huy"] as const;
export type TrangThaiMuon = (typeof TRANG_THAI_MUON)[number];

export const phieuMuon = pgTable(
  "phieu_muon",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    dauSachId: bigint("dau_sach_id", { mode: "number" })
      .notNull()
      .references(() => dauSach.id, { onDelete: "cascade" }),
    banSachId: bigint("ban_sach_id", { mode: "number" }).references(() => banSach.id, { onDelete: "set null" }),
    trangThai: text("trang_thai").$type<TrangThaiMuon>().notNull().default("cho_nhan"),
    ngayMuon: timestamp("ngay_muon", { withTimezone: true }),
    hanTra: date("han_tra"),
    ngayTra: timestamp("ngay_tra", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("phieu_muon_user_idx").on(t.userId),
    index("phieu_muon_trang_thai_idx").on(t.trangThai),
    // Mỗi học sinh chỉ giữ một phiếu đang hiệu lực cho cùng một đầu sách
    uniqueIndex("phieu_muon_dang_hieu_luc_idx")
      .on(t.userId, t.dauSachId)
      .where(sql`${t.trangThai} in ('cho_nhan', 'dang_muon')`),
    check("phieu_muon_trang_thai_check", sql`${t.trangThai} in ('cho_nhan', 'dang_muon', 'da_tra', 'da_huy')`),
  ],
);

// ---------------------------------------------------------------------------
// Tài liệu số (file trên Google Drive hoặc video YouTube)
// ---------------------------------------------------------------------------

export const taiLieu = pgTable(
  "tai_lieu",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    tieuDe: text("tieu_de").notNull(),
    tacGia: text("tac_gia"),
    moTa: text("mo_ta"),
    loai: text("loai").notNull(),
    danhMucId: bigint("danh_muc_id", { mode: "number" }).references(() => danhMuc.id, { onDelete: "set null" }),
    monHocId: text("mon_hoc_id").references(() => monHoc.id),
    khoiLop: smallint("khoi_lop").array().notNull().default(sql`'{}'`),
    boSach: text("bo_sach"), // 'kntt', 'ctst', 'canh-dieu', ...
    driveFileId: text("drive_file_id").unique(),
    mimeType: text("mime_type"),
    kichThuoc: bigint("kich_thuoc", { mode: "number" }),
    soTrang: integer("so_trang"),
    youtubeId: text("youtube_id"),
    anhBiaUrl: text("anh_bia_url"),
    dauSachId: bigint("dau_sach_id", { mode: "number" }).references(() => dauSach.id, { onDelete: "set null" }),
    quyenTruyCap: text("quyen_truy_cap").notNull().default("cong_khai"),
    choPhepTai: boolean("cho_phep_tai").notNull().default(false),
    trangThai: text("trang_thai").notNull().default("cho_duyet"),
    nguon: text("nguon"),
    giayPhep: text("giay_phep"),
    nguoiDang: text("nguoi_dang").references(() => user.id, { onDelete: "set null" }),
    luotXem: integer("luot_xem").notNull().default(0),
    luotTai: integer("luot_tai").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    searchText: text("search_text").generatedAlwaysAs(
      (): ReturnType<typeof sql> =>
        sql`vn_unaccent(${taiLieu.tieuDe} || ' ' || coalesce(${taiLieu.tacGia}, '') || ' ' || coalesce(${taiLieu.moTa}, ''))`,
    ),
  },
  (t) => [
    index("tai_lieu_search_idx").using("gin", t.searchText.op("gin_trgm_ops")),
    index("tai_lieu_danh_muc_idx").on(t.danhMucId, t.trangThai),
    index("tai_lieu_mon_hoc_idx").on(t.monHocId, t.trangThai),
    check(
      "tai_lieu_loai_check",
      sql`${t.loai} in ('sach', 'bai_giang', 'giao_an', 'de_thi', 'tu_lieu', 'video', 'audio', 'van_ban', 'hinh_anh')`,
    ),
    check("tai_lieu_quyen_check", sql`${t.quyenTruyCap} in ('cong_khai', 'dang_nhap', 'noi_bo')`),
    check("tai_lieu_trang_thai_check", sql`${t.trangThai} in ('cho_duyet', 'da_duyet', 'tu_choi')`),
  ],
);

// ---------------------------------------------------------------------------
// Tủ sách chuyên đề, bài viết, liên kết, báo lỗi
// ---------------------------------------------------------------------------

export const boSuuTap = pgTable("bo_suu_tap", {
  id: id(),
  slug: text("slug").notNull().unique(),
  ten: text("ten").notNull(),
  moTa: text("mo_ta"),
  anhBiaUrl: text("anh_bia_url"),
  thuTu: smallint("thu_tu").notNull().default(0),
  hienTrangChu: boolean("hien_trang_chu").notNull().default(true),
});

export const boSuuTapMuc = pgTable(
  "bo_suu_tap_muc",
  {
    boSuuTapId: bigint("bo_suu_tap_id", { mode: "number" })
      .notNull()
      .references(() => boSuuTap.id, { onDelete: "cascade" }),
    taiLieuId: bigint("tai_lieu_id", { mode: "number" })
      .notNull()
      .references(() => taiLieu.id, { onDelete: "cascade" }),
    thuTu: smallint("thu_tu").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.boSuuTapId, t.taiLieuId] })],
);

export const baiViet = pgTable(
  "bai_viet",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    tieuDe: text("tieu_de").notNull(),
    loai: text("loai").notNull().default("gioi_thieu_sach"),
    noiDung: text("noi_dung"),
    anhBiaUrl: text("anh_bia_url"),
    trangThai: text("trang_thai").notNull().default("nhap"),
    tacGia: text("tac_gia").references(() => user.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    check("bai_viet_loai_check", sql`${t.loai} in ('gioi_thieu_sach', 'tin_tuc', 'hoat_dong')`),
    check("bai_viet_trang_thai_check", sql`${t.trangThai} in ('nhap', 'da_dang')`),
  ],
);

export const lienKet = pgTable(
  "lien_ket",
  {
    id: id(),
    nhom: text("nhom").notNull(),
    ten: text("ten").notNull(),
    url: text("url").notNull(),
    thuTu: smallint("thu_tu").notNull().default(0),
  },
  (t) => [check("lien_ket_nhom_check", sql`${t.nhom} in ('hoc_lieu_so', 'lien_thong_thu_vien', 'bao_tap_chi')`)],
);

export const baoLoi = pgTable(
  "bao_loi",
  {
    id: id(),
    taiLieuId: bigint("tai_lieu_id", { mode: "number" })
      .notNull()
      .references(() => taiLieu.id, { onDelete: "cascade" }),
    noiDung: text("noi_dung").notNull(),
    trangThai: text("trang_thai").notNull().default("moi"),
    createdAt: createdAt(),
  },
  (t) => [
    check("bao_loi_noi_dung_check", sql`char_length(${t.noiDung}) between 3 and 2000`),
    check("bao_loi_trang_thai_check", sql`${t.trangThai} in ('moi', 'da_xu_ly')`),
  ],
);
