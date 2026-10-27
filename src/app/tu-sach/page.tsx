import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { TuSachCard } from "@/components/tu-sach-card";
import { TU_SACH } from "@/config/taxonomy";

export const metadata: Metadata = { title: "Tủ sách chuyên đề" };

export default function TuSachPage() {
  return (
    <>
      <PageHeader title="Tủ sách chuyên đề" description="Các bộ sưu tập do thư viện tuyển chọn." />
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {TU_SACH.map((t) => (
          <li key={t.slug}>
            <TuSachCard tuSach={t} />
          </li>
        ))}
      </ul>
    </>
  );
}
