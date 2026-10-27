import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SearchBox } from "@/components/search-box";

export const metadata: Metadata = { title: "Tìm kiếm" };

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

async function KetQua({ searchParams }: Pick<PageProps<"/tim-kiem">, "searchParams">) {
  const params = await searchParams;
  const q = firstValue(params.q);
  const khoi = firstValue(params.khoi);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <SearchBox defaultValue={q} />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* TODO: tìm trong tai_lieu.search_text bằng vn_unaccent(q), lọc thêm theo khối lớp */}
        <EmptyState title={q || khoi ? "Chưa có kết quả" : "Nhập từ khoá để tìm"}>
          {q && <>Không tìm thấy tài liệu nào cho “{q}”{khoi && ` trong lớp ${khoi}`}.</>}
          {!q && khoi && <>Thư viện đang cập nhật tài liệu lớp {khoi}.</>}
        </EmptyState>
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
