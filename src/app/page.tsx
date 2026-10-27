import Link from "next/link";
import { ArrowRight, BookCopy, GraduationCap, Headphones, Library } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { SearchBox } from "@/components/search-box";
import { SITE } from "@/config/site";
import { DANH_MUC, KHOI_LOP, NHOM_DANH_MUC, TU_SACH } from "@/config/taxonomy";

const LOI_TAT = [
  ...KHOI_LOP.map((k) => ({ href: `/tim-kiem?khoi=${k}`, label: `Lớp ${k}`, icon: GraduationCap })),
  { href: "/tu-sach/on-thi-vao-10", label: "Ôn thi vào 10", icon: BookCopy },
  { href: "/danh-muc/sach-noi", label: "Sách nói", icon: Headphones },
  { href: "/tra-cuu", label: "Tra cứu sách giấy", icon: Library },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border bg-primary-soft">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Kho học liệu điện tử</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight md:text-4xl">{SITE.name}</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Đọc sách điện tử, xem bài giảng, đề thi và tra cứu sách có trên giá của thư viện nhà trường.
          </p>
          <div className="mt-6 max-w-2xl">
            <SearchBox size="lg" />
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {LOI_TAT.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12">
        {NHOM_DANH_MUC.map((nhom) => (
          <section key={nhom.id} aria-labelledby={`nhom-${nhom.id}`}>
            <h2 id={`nhom-${nhom.id}`} className="text-xl font-bold">
              {nhom.ten}
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {DANH_MUC.filter((d) => d.nhom === nhom.id).map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/danh-muc/${d.slug}`}
                    className="group flex h-full items-start gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-primary hover:shadow-sm"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                      <CategoryIcon name={d.icon} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold group-hover:text-primary">{d.ten}</span>
                      <span className="mt-0.5 block text-sm text-muted">{d.moTa}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="tu-sach">
          <div className="flex items-end justify-between gap-4">
            <h2 id="tu-sach" className="text-xl font-bold">
              Tủ sách chuyên đề
            </h2>
            <Link href="/tu-sach" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Xem tất cả <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>
      </div>
    </>
  );
}
