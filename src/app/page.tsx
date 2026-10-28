import Link from "next/link";
import { ArrowRight, BookCopy, Headphones, Library } from "lucide-react";
import { Suspense } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { ResourceGrid } from "@/components/resource-card";
import { SearchBox } from "@/components/search-box";
import { TuSachCard } from "@/components/tu-sach-card";
import { NUT_CHINH, TONE, TONE_NHOM } from "@/components/ui";
import { DANH_MUC, KHOI_LOP, NHOM_DANH_MUC, TU_SACH } from "@/config/taxonomy";
import { demSachGiay, getTaiLieuMoi } from "@/db/queries";

const LOI_TAT = [
  { href: "/tu-sach/on-thi-vao-10", label: "Ôn thi vào 10", icon: BookCopy },
  { href: "/danh-muc/sach-noi", label: "Sách nói", icon: Headphones },
  { href: "/tra-cuu", label: "Tra cứu sách giấy", icon: Library },
];

// Gáy sách trang trí trên thẻ "Mượn sách giấy": [màu, chiều cao]
const GAY_SACH = [
  ["bg-primary", "h-20"],
  ["bg-tone-orange", "h-16"],
  ["bg-tone-yellow", "h-24"],
  ["bg-tone-green", "h-[4.5rem]"],
  ["bg-tone-violet", "h-20"],
  ["bg-tone-pink", "h-14"],
];

function TieuDeMuc({ id, children, link }: { id: string; children: React.ReactNode; link?: { href: string; nhan: string } }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="text-2xl font-bold md:text-3xl">
        {children}
      </h2>
      {link && (
        <Link
          href={link.href}
          className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-bold text-primary transition hover:bg-primary-soft"
        >
          {link.nhan} <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

async function TaiLieuMoi() {
  const items = await getTaiLieuMoi(8);
  if (!items.length) return null;
  return (
    <section aria-labelledby="moi-cap-nhat">
      <TieuDeMuc id="moi-cap-nhat" link={{ href: "/danh-muc", nhan: "Xem danh mục" }}>
        Mới cập nhật
      </TieuDeMuc>
      <div className="mt-5">
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
        ["đầu sách", tong.dauSach, "bg-primary-soft text-primary"],
        ["bản sách", tong.banSach, "bg-tone-orange-soft text-tone-orange"],
      ].map(([ten, so, mau]) => (
        <div key={ten} className={`flex flex-col-reverse rounded-2xl px-4 py-3 ${mau}`}>
          <dt className="text-xs font-bold opacity-80">{ten}</dt>
          <dd className="font-display text-3xl font-bold tabular-nums">{so.toLocaleString("vi-VN")}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-soft via-bg to-tone-yellow-soft">
        {/* Hoạ tiết nền, chỉ để trang trí */}
        <div aria-hidden className="pointer-events-none absolute -left-20 top-10 size-56 rounded-full bg-tone-violet-soft opacity-70" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-tone-blue-soft" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 right-1/3 size-72 rounded-full bg-tone-pink-soft opacity-70" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--border)_1.2px,transparent_1.2px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 md:py-16 lg:grid-cols-[1fr_21rem] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-sm font-bold text-accent shadow-clay">
              <span className="size-2 rounded-full bg-tone-orange" aria-hidden />
              Kho học liệu điện tử
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-extrabold text-balance md:text-6xl">
              Thư viện{" "}
              <span className="bg-gradient-to-r from-primary to-tone-violet bg-clip-text whitespace-nowrap text-transparent">THCS Vĩnh Thành</span>
              <span className="mt-2 block text-2xl font-bold text-muted md:text-4xl">Phân hiệu Việt Xuân</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted">
              Đọc sách điện tử, xem bài giảng, đề thi và tra cứu sách có trên giá của thư viện nhà trường.
            </p>
            <div className="mt-7 max-w-2xl">
              <SearchBox size="lg" />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-bold text-muted">Theo lớp:</span>
              {KHOI_LOP.map((k) => (
                <Link
                  key={k}
                  href={`/tim-kiem?khoi=${k}`}
                  className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-border bg-surface px-5 font-display text-base font-bold shadow-clay transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-fg"
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
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-surface/70 px-4 text-sm font-bold text-muted transition hover:bg-surface hover:text-primary"
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <aside className="the relative p-6 shadow-clay-lg lg:rotate-1">
            <div aria-hidden className="flex h-24 items-end gap-1.5 border-b-4 border-tone-yellow-soft px-2">
              {GAY_SACH.map(([mau, cao], i) => (
                <span key={i} className={`w-7 rounded-t-lg shadow-nut ${mau} ${cao} ${i === 3 ? "-rotate-6" : ""}`} />
              ))}
            </div>
            <h2 className="mt-4 text-xl font-bold">Mượn sách giấy</h2>
            <p className="mt-1 text-sm text-muted">Xem sách còn trên giá trước khi xuống thư viện mượn.</p>
            <Suspense fallback={<div className="mt-4 h-20 animate-pulse rounded-2xl bg-surface-muted" />}>
              <SoLieuKho />
            </Suspense>
            <Link href="/tra-cuu" className={`${NUT_CHINH} mt-5 w-full`}>
              Tra cứu sách giấy <ArrowRight className="size-4" aria-hidden />
            </Link>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-14">
        <Suspense fallback={null}>
          <TaiLieuMoi />
        </Suspense>

        {NHOM_DANH_MUC.map((nhom) => {
          const tone = TONE[TONE_NHOM[nhom.id]];
          return (
            <section key={nhom.id} aria-labelledby={`nhom-${nhom.id}`}>
              <TieuDeMuc id={`nhom-${nhom.id}`}>
                <span className={`mr-3 inline-block h-6 w-2 rounded-full align-[-0.1em] ${tone.vach}`} aria-hidden />
                {nhom.ten}
              </TieuDeMuc>
              <ul className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {DANH_MUC.filter((d) => d.nhom === nhom.id).map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/danh-muc/${d.slug}`}
                      className={`the group flex h-full flex-col gap-3 p-4 transition hover:-translate-y-1 hover:shadow-clay-lg sm:p-5 ${tone.vien}`}
                    >
                      <span
                        className={`grid size-12 shrink-0 -rotate-3 place-items-center rounded-2xl shadow-clay transition-transform group-hover:rotate-3 ${tone.chip}`}
                      >
                        <CategoryIcon name={d.icon} className="size-6" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-lg font-bold leading-tight">{d.ten}</span>
                        <span className="mt-1 line-clamp-2 block text-sm text-muted">{d.moTa}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section aria-labelledby="tu-sach">
          <TieuDeMuc id="tu-sach" link={{ href: "/tu-sach", nhan: "Xem tất cả" }}>
            Tủ sách chuyên đề
          </TieuDeMuc>
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
