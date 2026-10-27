import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Download, ExternalLink, Lock } from "lucide-react";
import { DriveViewer } from "@/components/drive-viewer";
import { PageHeader } from "@/components/page-header";
import { NUT_CHINH, NUT_PHU } from "@/components/ui";
import { BO_SACH, tenLoai } from "@/config/taxonomy";
import { getTaiLieuChiTiet } from "@/db/queries";
import { driveDownloadUrl, drivePreviewUrl } from "@/lib/drive-urls";
import { getSession } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/tai-lieu/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTaiLieuChiTiet(slug);
  return { title: t?.tieuDe ?? "Tài liệu", description: t?.moTa ?? undefined };
}

type ChiTiet = NonNullable<Awaited<ReturnType<typeof getTaiLieuChiTiet>>>;

/** Tài liệu "cần đăng nhập": file không công khai trên Drive, đọc qua server sau khi kiểm tra phiên. */
async function XemCanDangNhap({ t }: { t: ChiTiet }) {
  const session = await getSession();
  if (!session) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-xl border border-border bg-surface-muted p-6 text-center">
        <div>
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-surface text-muted">
            <Lock className="size-7" aria-hidden />
          </span>
          <p className="mt-3 font-semibold">Tài liệu này cần đăng nhập để đọc</p>
          <p className="mt-1 text-sm text-muted">Dành cho giáo viên, thủ thư của trường.</p>
          <Link href="/dang-nhap" className={`${NUT_CHINH} mt-4`}>
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl border border-border md:aspect-[4/3]">
      <iframe src={`/api/tai-lieu/${t.id}/file`} title={t.tieuDe} className="size-full" />
    </div>
  );
}

function NoiDungXem({ t }: { t: ChiTiet }) {
  if (t.youtubeId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${t.youtubeId}`}
          title={t.tieuDe}
          className="size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (!t.driveFileId) return null;
  if (t.quyenTruyCap === "cong_khai") {
    return (
      <div>
        <DriveViewer fileId={t.driveFileId} title={t.tieuDe} />
        {/* Trên điện thoại khung nhúng nhỏ, cho mở toàn màn hình */}
        <a
          href={drivePreviewUrl(t.driveFileId)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ExternalLink className="size-4" aria-hidden /> Mở toàn màn hình
          <span className="sr-only">(tab mới)</span>
        </a>
      </div>
    );
  }
  return (
    <Suspense fallback={<div className="aspect-[4/3] rounded-xl bg-surface-muted" aria-busy />}>
      <XemCanDangNhap t={t} />
    </Suspense>
  );
}

async function ChiTietTaiLieu({ params }: Pick<PageProps<"/tai-lieu/[slug]">, "params">) {
  const { slug } = await params;
  const t = await getTaiLieuChiTiet(slug);
  if (!t) notFound();

  const thongTin: [string, string | null | undefined][] = [
    ["Tác giả", t.tacGia],
    ["Loại", tenLoai(t.loai)],
    ["Môn học", t.monHoc],
    ["Khối lớp", t.khoiLop.length ? t.khoiLop.map((k) => `Lớp ${k}`).join(", ") : null],
    ["Bộ sách", BO_SACH.find((b) => b.id === t.boSach)?.ten],
    [
      "Dung lượng",
      t.kichThuoc
        ? t.kichThuoc < 1024 * 1024
          ? `${Math.max(1, Math.round(t.kichThuoc / 1024))} KB`
          : `${(t.kichThuoc / 1024 / 1024).toFixed(1)} MB`
        : null,
    ],
    ["Nguồn", t.nguon],
  ];

  return (
    <>
      <PageHeader
        title={t.tieuDe}
        crumbs={t.danhMucSlug ? [{ href: `/danh-muc/${t.danhMucSlug}`, label: t.danhMucTen ?? "Danh mục" }] : []}
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_18rem]">
        <NoiDungXem t={t} />
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {t.choPhepTai && t.driveFileId && t.quyenTruyCap === "cong_khai" && (
            <a href={driveDownloadUrl(t.driveFileId)} className={`${NUT_CHINH} w-full`}>
              <Download className="size-4" aria-hidden /> Tải về
            </a>
          )}
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold">Thông tin tài liệu</h2>
            <dl className="mt-3 divide-y divide-border text-sm">
              {thongTin
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0">
                    <dt className="shrink-0 text-muted">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
          {t.moTa && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold">Giới thiệu</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{t.moTa}</p>
            </div>
          )}
          {t.danhMucSlug && (
            <Link href={`/danh-muc/${t.danhMucSlug}`} className={`${NUT_PHU} w-full text-sm`}>
              Xem thêm trong “{t.danhMucTen ?? "danh mục"}”
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}

export default function TaiLieuPage({ params }: PageProps<"/tai-lieu/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8" aria-busy><div className="aspect-[4/3] max-w-3xl animate-pulse rounded-xl bg-surface-muted" /></div>}>
      <ChiTietTaiLieu params={params} />
    </Suspense>
  );
}
