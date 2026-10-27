CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bai_viet" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bai_viet_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"tieu_de" text NOT NULL,
	"loai" text DEFAULT 'gioi_thieu_sach' NOT NULL,
	"noi_dung" text,
	"anh_bia_url" text,
	"trang_thai" text DEFAULT 'nhap' NOT NULL,
	"tac_gia" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bai_viet_slug_unique" UNIQUE("slug"),
	CONSTRAINT "bai_viet_loai_check" CHECK ("bai_viet"."loai" in ('gioi_thieu_sach', 'tin_tuc', 'hoat_dong')),
	CONSTRAINT "bai_viet_trang_thai_check" CHECK ("bai_viet"."trang_thai" in ('nhap', 'da_dang'))
);
--> statement-breakpoint
CREATE TABLE "ban_sach" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ban_sach_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"so_dkcb" text NOT NULL,
	"dau_sach_id" bigint NOT NULL,
	"kho" text NOT NULL,
	"nguon" text DEFAULT 'mua' NOT NULL,
	"gia" integer,
	"ngay_nhap" date,
	"tinh_trang" text DEFAULT 'tren_gia' NOT NULL,
	"vi_tri" text,
	"ghi_chu" text,
	CONSTRAINT "ban_sach_so_dkcb_unique" UNIQUE("so_dkcb"),
	CONSTRAINT "ban_sach_nguon_check" CHECK ("ban_sach"."nguon" in ('mua', 'cap_phat', 'tang')),
	CONSTRAINT "ban_sach_tinh_trang_check" CHECK ("ban_sach"."tinh_trang" in ('tren_gia', 'dang_muon', 'hong', 'mat', 'thanh_ly'))
);
--> statement-breakpoint
CREATE TABLE "bao_loi" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bao_loi_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"tai_lieu_id" bigint NOT NULL,
	"noi_dung" text NOT NULL,
	"trang_thai" text DEFAULT 'moi' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bao_loi_noi_dung_check" CHECK (char_length("bao_loi"."noi_dung") between 3 and 2000),
	CONSTRAINT "bao_loi_trang_thai_check" CHECK ("bao_loi"."trang_thai" in ('moi', 'da_xu_ly'))
);
--> statement-breakpoint
CREATE TABLE "bo_suu_tap" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bo_suu_tap_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"ten" text NOT NULL,
	"mo_ta" text,
	"anh_bia_url" text,
	"thu_tu" smallint DEFAULT 0 NOT NULL,
	"hien_trang_chu" boolean DEFAULT true NOT NULL,
	CONSTRAINT "bo_suu_tap_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bo_suu_tap_muc" (
	"bo_suu_tap_id" bigint NOT NULL,
	"tai_lieu_id" bigint NOT NULL,
	"thu_tu" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "bo_suu_tap_muc_bo_suu_tap_id_tai_lieu_id_pk" PRIMARY KEY("bo_suu_tap_id","tai_lieu_id")
);
--> statement-breakpoint
CREATE TABLE "danh_muc" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "danh_muc_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"ten" text NOT NULL,
	"nhom" text NOT NULL,
	"mo_ta" text,
	"thu_tu" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "danh_muc_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "dau_sach" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dau_sach_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"ten" text NOT NULL,
	"tap" text,
	"tac_gia" text,
	"nha_xb" text,
	"noi_xb" text,
	"nam_xb" smallint,
	"isbn" text,
	"mon_loai" text,
	"mon_hoc_id" text,
	"khoi_lop" smallint[] DEFAULT '{}' NOT NULL,
	"tom_tat" text,
	"anh_bia_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_text" text GENERATED ALWAYS AS (vn_unaccent("dau_sach"."ten" || ' ' || coalesce("dau_sach"."tap", '') || ' ' || coalesce("dau_sach"."tac_gia", ''))) STORED
);
--> statement-breakpoint
CREATE TABLE "lien_ket" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lien_ket_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"nhom" text NOT NULL,
	"ten" text NOT NULL,
	"url" text NOT NULL,
	"thu_tu" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "lien_ket_nhom_check" CHECK ("lien_ket"."nhom" in ('hoc_lieu_so', 'lien_thong_thu_vien', 'bao_tap_chi'))
);
--> statement-breakpoint
CREATE TABLE "mon_hoc" (
	"id" text PRIMARY KEY NOT NULL,
	"ten" text NOT NULL,
	"thu_tu" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mon_loai" (
	"ma" text PRIMARY KEY NOT NULL,
	"ten" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tai_lieu" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tai_lieu_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"tieu_de" text NOT NULL,
	"tac_gia" text,
	"mo_ta" text,
	"loai" text NOT NULL,
	"danh_muc_id" bigint,
	"mon_hoc_id" text,
	"khoi_lop" smallint[] DEFAULT '{}' NOT NULL,
	"bo_sach" text,
	"drive_file_id" text,
	"mime_type" text,
	"kich_thuoc" bigint,
	"so_trang" integer,
	"youtube_id" text,
	"anh_bia_url" text,
	"dau_sach_id" bigint,
	"quyen_truy_cap" text DEFAULT 'cong_khai' NOT NULL,
	"cho_phep_tai" boolean DEFAULT false NOT NULL,
	"trang_thai" text DEFAULT 'cho_duyet' NOT NULL,
	"nguon" text,
	"giay_phep" text,
	"nguoi_dang" text,
	"luot_xem" integer DEFAULT 0 NOT NULL,
	"luot_tai" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_text" text GENERATED ALWAYS AS (vn_unaccent("tai_lieu"."tieu_de" || ' ' || coalesce("tai_lieu"."tac_gia", '') || ' ' || coalesce("tai_lieu"."mo_ta", ''))) STORED,
	CONSTRAINT "tai_lieu_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tai_lieu_drive_file_id_unique" UNIQUE("drive_file_id"),
	CONSTRAINT "tai_lieu_loai_check" CHECK ("tai_lieu"."loai" in ('sach', 'bai_giang', 'giao_an', 'de_thi', 'tu_lieu', 'video', 'audio', 'van_ban', 'hinh_anh')),
	CONSTRAINT "tai_lieu_quyen_check" CHECK ("tai_lieu"."quyen_truy_cap" in ('cong_khai', 'dang_nhap', 'noi_bo')),
	CONSTRAINT "tai_lieu_trang_thai_check" CHECK ("tai_lieu"."trang_thai" in ('cho_duyet', 'da_duyet', 'tu_choi'))
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'nguoi_dung' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_role_check" CHECK ("user"."role" in ('admin', 'thu_thu', 'giao_vien', 'nguoi_dung'))
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bai_viet" ADD CONSTRAINT "bai_viet_tac_gia_user_id_fk" FOREIGN KEY ("tac_gia") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ban_sach" ADD CONSTRAINT "ban_sach_dau_sach_id_dau_sach_id_fk" FOREIGN KEY ("dau_sach_id") REFERENCES "public"."dau_sach"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bao_loi" ADD CONSTRAINT "bao_loi_tai_lieu_id_tai_lieu_id_fk" FOREIGN KEY ("tai_lieu_id") REFERENCES "public"."tai_lieu"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bo_suu_tap_muc" ADD CONSTRAINT "bo_suu_tap_muc_bo_suu_tap_id_bo_suu_tap_id_fk" FOREIGN KEY ("bo_suu_tap_id") REFERENCES "public"."bo_suu_tap"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bo_suu_tap_muc" ADD CONSTRAINT "bo_suu_tap_muc_tai_lieu_id_tai_lieu_id_fk" FOREIGN KEY ("tai_lieu_id") REFERENCES "public"."tai_lieu"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dau_sach" ADD CONSTRAINT "dau_sach_mon_loai_mon_loai_ma_fk" FOREIGN KEY ("mon_loai") REFERENCES "public"."mon_loai"("ma") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "dau_sach" ADD CONSTRAINT "dau_sach_mon_hoc_id_mon_hoc_id_fk" FOREIGN KEY ("mon_hoc_id") REFERENCES "public"."mon_hoc"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tai_lieu" ADD CONSTRAINT "tai_lieu_danh_muc_id_danh_muc_id_fk" FOREIGN KEY ("danh_muc_id") REFERENCES "public"."danh_muc"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tai_lieu" ADD CONSTRAINT "tai_lieu_mon_hoc_id_mon_hoc_id_fk" FOREIGN KEY ("mon_hoc_id") REFERENCES "public"."mon_hoc"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tai_lieu" ADD CONSTRAINT "tai_lieu_dau_sach_id_dau_sach_id_fk" FOREIGN KEY ("dau_sach_id") REFERENCES "public"."dau_sach"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tai_lieu" ADD CONSTRAINT "tai_lieu_nguoi_dang_user_id_fk" FOREIGN KEY ("nguoi_dang") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ban_sach_dau_sach_idx" ON "ban_sach" USING btree ("dau_sach_id");--> statement-breakpoint
CREATE INDEX "dau_sach_search_idx" ON "dau_sach" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tai_lieu_search_idx" ON "tai_lieu" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "tai_lieu_danh_muc_idx" ON "tai_lieu" USING btree ("danh_muc_id","trang_thai");--> statement-breakpoint
CREATE INDEX "tai_lieu_mon_hoc_idx" ON "tai_lieu" USING btree ("mon_hoc_id","trang_thai");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");