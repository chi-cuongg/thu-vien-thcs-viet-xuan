import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ResourceGrid } from "@/components/resource-card";
import { SearchBox } from "@/components/search-box";
import { KHOI_LOP } from "@/config/taxonomy";
import { timTaiLieu } from "@/db/queries";

export const metadata: Metadata = { title: "Tìm kiếm" };

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

async function KetQua({ searchParams }: Pick<PageProps<"/tim-kiem">, "searchParams">) {
  const params = await searchParams;
  const q = firstValue(params.q).slice(0, 100);
  const khoiSo = Number(firstValue(params.khoi));
  const khoi = (KHOI_LOP as readonly number[]).includes(khoiSo) ? khoiSo : undefined;
  const items = q || khoi ? await timTaiLieu(q, khoi) : [];

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <SearchBox defaultValue={q} />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {items.length ? (
          <>
            <p className="mb-4 text-sm text-muted">
              {items.length} kết quả{q && ` cho “${q}”`}
              {khoi && ` · lớp ${khoi}`}
            </p>
            <ResourceGrid items={items} />
          </>
        ) : (
          <EmptyState title={q || khoi ? "Chưa có kết quả" : "Nhập từ khoá để tìm"}>
            {q && <>Không tìm thấy tài liệu nào cho “{q}”{khoi && ` trong lớp ${khoi}`}.</>}
            {!q && khoi && <>Thư viện đang cập nhật tài liệu lớp {khoi}.</>}
          </EmptyState>
        )}
      </div>
    </>
  );
}

export default function TimKiemPage({ searchParams }: PageProps<"/tim-kiem">) {
  return (
    <>
      <PageHeader title="Tìm kiếm tài liệu" description="Tìm theo tên sách, tác giả, chủ đề — gõ có dấu hay không dấu đều được." />
      <Suspense fallback={<div className="mx-auto h-40 max-w-6xl px-4 py-8" aria-busy />}>
        <KetQua searchParams={searchParams} />
      </Suspense>
    </>
  );
}
