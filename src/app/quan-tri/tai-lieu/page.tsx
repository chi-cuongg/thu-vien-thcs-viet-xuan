import { and, desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NutTaiLieu } from "@/components/admin/tai-lieu-actions";
import { EmptyState } from "@/components/empty-state";
import { tenLoai } from "@/config/taxonomy";
import { getDb } from "@/db";
import { danhMuc, taiLieu, user } from "@/db/schema";
import { hasRole, requireRole, STAFF_ROLES, UPLOAD_ROLES } from "@/lib/session";

export const metadata: Metadata = { title: "Duyệt & quản lý tài liệu" };

const TAB = [
  { id: "cho_duyet", ten: "Chờ duyệt" },
  { id: "da_duyet", ten: "Đã duyệt" },
  { id: "tu_choi", ten: "Từ chối" },
];

const TEN_QUYEN: Record<string, string> = { cong_khai: "Công khai", dang_nhap: "Cần đăng nhập", noi_bo: "Nội bộ" };

async function DanhSach({ searchParams }: Pick<PageProps<"/quan-tri/tai-lieu">, "searchParams">) {
  const session = await requireRole(UPLOAD_ROLES);
  const laThuThu = hasRole(session, STAFF_ROLES);
  const { tab } = await searchParams;
  const trangThai = TAB.some((t) => t.id === tab) ? String(tab) : "cho_duyet";

  const db = getDb();
  // Giáo viên chỉ thấy tài liệu mình đăng
  const cuaToi = laThuThu ? undefined : eq(taiLieu.nguoiDang, session.user.id);
  const [rows, dem] = await Promise.all([
    db
      .select({
        id: taiLieu.id,
        slug: taiLieu.slug,
        tieuDe: taiLieu.tieuDe,
        tacGia: taiLieu.tacGia,
        loai: taiLieu.loai,
        quyenTruyCap: taiLieu.quyenTruyCap,
        trangThai: taiLieu.trangThai,
        driveFileId: taiLieu.driveFileId,
        youtubeId: taiLieu.youtubeId,
        createdAt: taiLieu.createdAt,
        danhMuc: danhMuc.ten,
        nguoiDang: user.name,
      })
      .from(taiLieu)
      .leftJoin(danhMuc, eq(danhMuc.id, taiLieu.danhMucId))
      .leftJoin(user, eq(user.id, taiLieu.nguoiDang))
      .where(and(eq(taiLieu.trangThai, trangThai), cuaToi))
      .orderBy(desc(taiLieu.createdAt))
      .limit(200),
    db
      .select({ trangThai: taiLieu.trangThai, so: sql<number>`count(*)::int` })
      .from(taiLieu)
      .where(cuaToi)
      .groupBy(taiLieu.trangThai),
  ]);
  const soLuong = (id: string) => dem.find((d) => d.trangThai === id)?.so ?? 0;

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {TAB.map((t) => (
          <Link
            key={t.id}
            href={`/quan-tri/tai-lieu?tab=${t.id}`}
            className={`rounded-full border px-3 py-1 ${t.id === trangThai ? "border-primary bg-primary-soft font-semibold text-primary" : "border-border text-muted hover:text-fg"}`}
          >
            {t.ten} ({soLuong(t.id)})
          </Link>
        ))}
      </div>

      <div className="mt-4">
        {rows.length === 0 ? (
          <EmptyState title="Không có tài liệu nào" />
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">{r.tieuDe}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {tenLoai(r.loai)} · {r.danhMuc ?? "—"} · {TEN_QUYEN[r.quyenTruyCap]}
                    {r.tacGia && ` · ${r.tacGia}`}
                  </p>
                  <p className="text-xs text-muted">
                    Đăng bởi {r.nguoiDang ?? "—"} lúc {r.createdAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                  </p>
                  <div className="mt-1 flex gap-3 text-sm">
                    {r.driveFileId && (
                      <a href={`/api/tai-lieu/${r.id}/file`} target="_blank" rel="noopener" className="text-primary underline">
                        Xem file
                      </a>
                    )}
                    {r.youtubeId && (
                      <a href={`https://www.youtube.com/watch?v=${r.youtubeId}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        Xem video
                      </a>
                    )}
                    {r.trangThai === "da_duyet" && (
                      <Link href={`/tai-lieu/${r.slug}`} className="text-primary underline">
                        Trang công khai
                      </Link>
                    )}
                  </div>
                </div>
                <NutTaiLieu id={r.id} trangThai={r.trangThai} laThuThu={laThuThu} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default function QuanLyTaiLieuPage({ searchParams }: PageProps<"/quan-tri/tai-lieu">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Duyệt & quản lý tài liệu</h1>
          <p className="mt-1 text-sm text-muted">Thủ thư duyệt tài liệu giáo viên gửi; giáo viên xem trạng thái tài liệu của mình.</p>
        </div>
        <Link href="/quan-tri/dang-tai-lieu" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg">
          + Đăng tài liệu
        </Link>
      </div>
      <Suspense fallback={<div className="mt-6 h-64 rounded-xl border border-border bg-surface" aria-busy />}>
        <DanhSach searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
