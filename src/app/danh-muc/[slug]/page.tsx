import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ResourceGrid } from "@/components/resource-card";
import { DANH_MUC, findDanhMuc, KHOI_LOP } from "@/config/taxonomy";
import { getTaiLieuTheoDanhMuc } from "@/db/queries";

export function generateStaticParams() {
  return DANH_MUC.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/danh-muc/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: findDanhMuc(slug)?.ten ?? "Danh mục" };
}

async function DanhSach({ slug, searchParams }: { slug: string } & Pick<PageProps<"/danh-muc/[slug]">, "searchParams">) {
  const { khoi } = await searchParams;
  const khoiSo = Number(khoi);
  const khoiLoc = (KHOI_LOP as readonly number[]).includes(khoiSo) ? khoiSo : undefined;
  const items = await getTaiLieuTheoDanhMuc(slug, khoiLoc);

  return (
    <>
      <div className="flex flex-wrap gap-2 text-sm">
        {[undefined, ...KHOI_LOP].map((k) => (
          <Link
            key={k ?? "all"}
            href={k ? `/danh-muc/${slug}?khoi=${k}` : `/danh-muc/${slug}`}
            className={`rounded-full border px-3 py-1 ${k === khoiLoc ? "border-primary bg-primary-soft font-semibold text-primary" : "border-border text-muted hover:text-fg"}`}
          >
            {k ? `Lớp ${k}` : "Tất cả"}
          </Link>
        ))}
      </div>
      <div className="mt-6">
        {items.length ? (
          <ResourceGrid items={items} />
        ) : (
          <EmptyState title="Chưa có tài liệu">Thư viện đang cập nhật tài liệu cho mục này. Bạn quay lại sau nhé.</EmptyState>
        )}
      </div>
    </>
  );
}

async function DanhMucContent({ params, searchParams }: PageProps<"/danh-muc/[slug]">) {
  const { slug } = await params;
  const danhMuc = findDanhMuc(slug);
  if (!danhMuc) notFound();

  return (
    <>
      <PageHeader title={danhMuc.ten} description={danhMuc.moTa} crumbs={[{ href: "/danh-muc", label: "Danh mục" }]} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Suspense fallback={<div className="h-48" aria-busy />}>
          <DanhSach slug={slug} searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

export default function DanhMucDetailPage(props: PageProps<"/danh-muc/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-48 max-w-6xl px-4 py-8" aria-busy />}>
      <DanhMucContent {...props} />
    </Suspense>
  );
}
