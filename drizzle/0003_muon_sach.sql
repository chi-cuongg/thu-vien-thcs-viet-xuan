CREATE TABLE "phieu_muon" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "phieu_muon_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"dau_sach_id" bigint NOT NULL,
	"ban_sach_id" bigint,
	"trang_thai" text DEFAULT 'cho_nhan' NOT NULL,
	"ngay_muon" timestamp with time zone,
	"han_tra" date,
	"ngay_tra" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "phieu_muon_trang_thai_check" CHECK ("phieu_muon"."trang_thai" in ('cho_nhan', 'dang_muon', 'da_tra', 'da_huy'))
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lop" text;--> statement-breakpoint
ALTER TABLE "phieu_muon" ADD CONSTRAINT "phieu_muon_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phieu_muon" ADD CONSTRAINT "phieu_muon_dau_sach_id_dau_sach_id_fk" FOREIGN KEY ("dau_sach_id") REFERENCES "public"."dau_sach"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phieu_muon" ADD CONSTRAINT "phieu_muon_ban_sach_id_ban_sach_id_fk" FOREIGN KEY ("ban_sach_id") REFERENCES "public"."ban_sach"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "phieu_muon_user_idx" ON "phieu_muon" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "phieu_muon_trang_thai_idx" ON "phieu_muon" USING btree ("trang_thai");--> statement-breakpoint
CREATE UNIQUE INDEX "phieu_muon_dang_hieu_luc_idx" ON "phieu_muon" USING btree ("user_id","dau_sach_id") WHERE "phieu_muon"."trang_thai" in ('cho_nhan', 'dang_muon');--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");