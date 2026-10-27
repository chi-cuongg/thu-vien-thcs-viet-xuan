import Link from "next/link";
import { ArrowRight, BookCopy, Headphones, Library } from "lucide-react";
import { Suspense } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { ResourceGrid } from "@/components/resource-card";
import { SearchBox } from "@/components/search-box";
import { TuSachCard } from "@/components/tu-sach-card";
import { NUT_CHINH } from "@/components/ui";
import { SITE } from "@/config/site";
import { DANH_MUC, KHOI_LOP, NHOM_DANH_MUC, TU_SACH } from "@/config/taxonomy";
import { demSachGiay, getTaiLieuMoi } from "@/db/queries";

const LOI_TAT = [
  { href: "/tu-sach/on-thi-vao-10", label: "Ôn thi vào 10", icon: BookCopy },
  { href: "/danh-muc/sach-noi", label: "Sách nói", icon: Headphones },
  { href: "/tra-cuu", label: "Tra cứu sách giấy", icon: Library },
];

async function TaiLieuMoi() {
  const items = await getTaiLieuMoi(8);
  if (!items.length) return null;
  return (
    <section aria-labelledby="moi-cap-nhat">
      <div className="flex items-end justify-between gap-4">
        <h2 id="moi-cap-nhat" className="text-xl font-bold md:text-2xl">
          Mới cập nhật
        </h2>
        <Link href="/danh-muc" className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary hover:underline">
          Xem danh mục <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="mt-4">
        <ResourceGrid items={items} />
      </div>
    </section>
  );
}

async function SoLieuKho() {
  const tong = await demSachGiay();
  if (!tong.banSach) return <p className="mt-1 text-sm text-muted">Thư viện đang nhập dữ liệu từ sổ đăng ký cá biệt.</p>;
  return (
    <dl className="mt-4 grid grid-cols-2 gap-3">
      {[
        ["đầu sách", tong.dauSach],
        ["bản sách", tong.banSach],
      ].map(([ten, so]) => (
        <div key={ten} className="flex flex-col-reverse rounded-lg bg-primary-soft px-3 py-2">
          <dt className="text-xs text-muted">{ten}</dt>
          <dd className="text-2xl font-bold text-primary tabular-nums">{so.toLocaleString("vi-VN")}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-primary-soft">
        {/* Hoạ tiết nền nhẹ, chỉ để trang trí */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary opacity-[0.07]"
        />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 right-40 size-72 rounded-full bg-accent opacity-[0.08]" />

        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 md:py-14 lg:grid-cols-[1fr_20rem] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Kho học liệu điện tử</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight text-balance md:text-5xl">{SITE.name}</h1>
            <p className="mt-3 max-w-2xl text-muted md:text-lg">
              Đọc sách điện tử, xem bài giảng, đề thi và tra cứu sách có trên giá của thư viện nhà trường.
            </p>
            <div className="mt-6 max-w-2xl">
              <SearchBox size="lg" />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-medium text-muted">Theo lớp:</span>
              {KHOI_LOP.map((k) => (
                <Link
                  key={k}
                  href={`/tim-kiem?khoi=${k}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:border-primary hover:bg-primary hover:text-primary-fg"
                >
                  Lớp {k}
                </Link>
              ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {LOI_TAT.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
              <Library className="size-5" aria-hidden />
            </span>
            <h2 className="mt-3 font-bold">Mượn sách giấy</h2>
            <p className="mt-1 text-sm text-muted">Xem sách còn trên giá trước khi xuống thư viện mượn.</p>
            <Suspense fallback={<div className="mt-4 h-16 animate-pulse rounded-lg bg-surface-muted" />}>
              <SoLieuKho />
            </Suspense>
            <Link href="/tra-cuu" className={`${NUT_CHINH} mt-4 w-full`}>
              Tra cứu sách giấy <ArrowRight className="size-4" aria-hidden />
            </Link>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12">
        <Suspense fallback={null}>
          <TaiLieuMoi />
        </Suspense>

        {NHOM_DANH_MUC.map((nhom) => (
          <section key={nhom.id} aria-labelledby={`nhom-${nhom.id}`}>
            <h2 id={`nhom-${nhom.id}`} className="text-xl font-bold md:text-2xl">
              {nhom.ten}
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {DANH_MUC.filter((d) => d.nhom === nhom.id).map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/danh-muc/${d.slug}`}
                    className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md sm:flex-row sm:items-start"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-fg">
                      <CategoryIcon name={d.icon} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold leading-snug group-hover:text-primary">{d.ten}</span>
                      <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{d.moTa}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="tu-sach">
          <div className="flex items-end justify-between gap-4">
            <h2 id="tu-sach" className="text-xl font-bold md:text-2xl">
              Tủ sách chuyên đề
            </h2>
            <Link href="/tu-sach" className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary hover:underline">
              Xem tất cả <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TU_SACH.map((t) => (
              <li key={t.slug}>
                <TuSachCard tuSach={t} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
