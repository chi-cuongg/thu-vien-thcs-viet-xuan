import type { Metadata } from "next";
import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { PageHeader } from "@/components/page-header";
import { DANH_MUC, NHOM_DANH_MUC } from "@/config/taxonomy";

export const metadata: Metadata = { title: "Danh mục" };

export default function DanhMucPage() {
  return (
    <>
      <PageHeader title="Danh mục tài nguyên" description="Toàn bộ sách điện tử, học liệu và văn bản của thư viện." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
        {NHOM_DANH_MUC.map((nhom) => (
          <section key={nhom.id}>
            <h2 className="text-lg font-bold">{nhom.ten}</h2>
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">
              {DANH_MUC.filter((d) => d.nhom === nhom.id).map((d) => (
                <li key={d.slug}>
                  <Link href={`/danh-muc/${d.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted">
                    <CategoryIcon name={d.icon} className="size-5 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block font-medium">{d.ten}</span>
                      <span className="block text-sm text-muted">{d.moTa}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
