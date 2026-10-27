import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { DANH_MUC, findDanhMuc } from "@/config/taxonomy";

export function generateStaticParams() {
  return DANH_MUC.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/danh-muc/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: findDanhMuc(slug)?.ten ?? "Danh mục" };
}

async function DanhMucContent({ params }: Pick<PageProps<"/danh-muc/[slug]">, "params">) {
  const { slug } = await params;
  const danhMuc = findDanhMuc(slug);
  if (!danhMuc) notFound();

  return (
    <>
      <PageHeader title={danhMuc.ten} description={danhMuc.moTa} crumbs={[{ href: "/danh-muc", label: "Danh mục" }]} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* TODO: đọc tài liệu đã duyệt của danh mục từ Supabase (bảng tai_lieu) */}
        <EmptyState title="Chưa có tài liệu">
          Thư viện đang cập nhật tài liệu cho mục này. Bạn quay lại sau nhé.
        </EmptyState>
      </div>
    </>
  );
}

export default function DanhMucDetailPage({ params }: PageProps<"/danh-muc/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-48 max-w-6xl px-4 py-8" aria-busy />}>
      <DanhMucContent params={params} />
    </Suspense>
  );
}
