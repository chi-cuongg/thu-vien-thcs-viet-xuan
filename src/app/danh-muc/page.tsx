import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { PageHeader } from "@/components/page-header";
import { TONE, TONE_NHOM } from "@/components/ui";
import { DANH_MUC, NHOM_DANH_MUC } from "@/config/taxonomy";

export const metadata: Metadata = { title: "Danh mục" };

export default function DanhMucPage() {
  return (
    <>
      <PageHeader title="Danh mục tài nguyên" description="Toàn bộ sách điện tử, học liệu và văn bản của thư viện." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
        {NHOM_DANH_MUC.map((nhom) => (
          <section key={nhom.id}>
            <h2 className="flex items-center gap-3 text-2xl font-bold">
              <span className={`h-6 w-2 rounded-full ${TONE[TONE_NHOM[nhom.id]].vach}`} aria-hidden />
              {nhom.ten}
            </h2>
            <ul className="the mt-4 divide-y divide-border overflow-hidden">
              {DANH_MUC.filter((d) => d.nhom === nhom.id).map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/danh-muc/${d.slug}`}
                    className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-muted"
                  >
                    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${TONE[TONE_NHOM[nhom.id]].chip}`}>
                      <CategoryIcon name={d.icon} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold group-hover:text-primary">{d.ten}</span>
                      <span className="block text-sm text-muted">{d.moTa}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
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
