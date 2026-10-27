import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SearchBox } from "@/components/search-box";

export const metadata: Metadata = { title: "Tra cứu sách giấy" };

async function KetQua({ searchParams }: Pick<PageProps<"/tra-cuu">, "searchParams">) {
  const { q } = await searchParams;
  const tuKhoa = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <SearchBox
          id="q-tra-cuu"
          action="/tra-cuu"
          defaultValue={tuKhoa}
          placeholder="Tên sách, tác giả, số ĐKCB…"
        />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* TODO: tìm trong dau_sach.search_text, hiện số bản và số bản còn trên giá (bảng ban_sach) */}
        <EmptyState title={tuKhoa ? `Chưa có kết quả cho “${tuKhoa}”` : "Mục lục sách giấy đang được nhập"}>
          Thư viện đang nhập dữ liệu từ sổ đăng ký cá biệt. Khi xong, bạn sẽ biết sách có trên giá hay đang được mượn.
        </EmptyState>
      </div>
    </>
  );
}

export default function TraCuuPage({ searchParams }: PageProps<"/tra-cuu">) {
  return (
    <>
      <PageHeader
        title="Tra cứu sách giấy"
        description="Tìm sách có trong kho của thư viện, xem còn bao nhiêu bản trên giá để đến mượn."
      />
      <Suspense fallback={<div className="mx-auto h-40 max-w-6xl px-4 py-8" aria-busy />}>
        <KetQua searchParams={searchParams} />
      </Suspense>
    </>
  );
}
