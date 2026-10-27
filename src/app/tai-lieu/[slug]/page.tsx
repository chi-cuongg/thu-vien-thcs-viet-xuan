import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Download, Lock } from "lucide-react";
import { DriveViewer } from "@/components/drive-viewer";
import { PageHeader } from "@/components/page-header";
import { BO_SACH, tenLoai } from "@/config/taxonomy";
import { getTaiLieuChiTiet } from "@/db/queries";
import { driveDownloadUrl } from "@/lib/drive-urls";
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
          <Lock className="mx-auto size-8 text-muted" aria-hidden />
          <p className="mt-2 font-medium">Tài liệu này cần đăng nhập để đọc.</p>
          <Link href="/dang-nhap" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 font-semibold text-primary-fg">
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
  if (t.quyenTruyCap === "cong_khai") return <DriveViewer fileId={t.driveFileId} title={t.tieuDe} />;
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
        <aside className="space-y-4">
          <dl className="space-y-2 rounded-xl border border-border bg-surface p-4 text-sm">
            {thongTin
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
          </dl>
          {t.moTa && <p className="whitespace-pre-line text-sm">{t.moTa}</p>}
          {t.choPhepTai && t.driveFileId && t.quyenTruyCap === "cong_khai" && (
            <a
              href={driveDownloadUrl(t.driveFileId)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-fg"
            >
              <Download className="size-4" aria-hidden /> Tải về
            </a>
          )}
        </aside>
      </div>
    </>
  );
}

export default function TaiLieuPage({ params }: PageProps<"/tai-lieu/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-6xl px-4 py-8" aria-busy />}>
      <ChiTietTaiLieu params={params} />
    </Suspense>
  );
}
