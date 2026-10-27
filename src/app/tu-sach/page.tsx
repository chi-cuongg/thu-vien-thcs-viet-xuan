import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TU_SACH } from "@/config/taxonomy";

export const metadata: Metadata = { title: "Tủ sách chuyên đề" };

export default function TuSachPage() {
  return (
    <>
      <PageHeader title="Tủ sách chuyên đề" description="Các bộ sưu tập do thư viện tuyển chọn." />
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {TU_SACH.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/tu-sach/${t.slug}`}
              className="block h-full rounded-xl border border-border bg-accent-soft p-5 transition hover:border-accent"
            >
              <span className="block font-semibold">{t.ten}</span>
              <span className="mt-1 block text-sm text-muted">{t.moTa}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
