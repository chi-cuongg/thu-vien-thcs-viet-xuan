import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TU_SACH } from "@/config/taxonomy";

export function generateStaticParams() {
  return TU_SACH.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tu-sach/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: TU_SACH.find((t) => t.slug === slug)?.ten ?? "Tủ sách" };
}

async function TuSachContent({ params }: Pick<PageProps<"/tu-sach/[slug]">, "params">) {
  const { slug } = await params;
  const tuSach = TU_SACH.find((t) => t.slug === slug);
  if (!tuSach) notFound();

  return (
    <>
      <PageHeader title={tuSach.ten} description={tuSach.moTa} crumbs={[{ href: "/tu-sach", label: "Tủ sách" }]} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* TODO: đọc các tài liệu của bộ sưu tập từ Supabase (bảng bo_suu_tap_muc) */}
        <EmptyState title="Tủ sách đang được sắp xếp">Thư viện sẽ sớm đưa sách vào tủ này.</EmptyState>
      </div>
    </>
  );
}

export default function TuSachDetailPage({ params }: PageProps<"/tu-sach/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-48 max-w-6xl px-4 py-8" aria-busy />}>
      <TuSachContent params={params} />
    </Suspense>
  );
}
