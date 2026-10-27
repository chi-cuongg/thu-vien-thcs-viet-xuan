import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import type { TU_SACH } from "@/config/taxonomy";

export function TuSachCard({ tuSach: t }: { tuSach: (typeof TU_SACH)[number] }) {
  return (
    <Link
      href={`/tu-sach/${t.slug}`}
      className="group flex h-full items-start gap-4 rounded-xl border border-border bg-accent-soft p-5 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-accent">
        <CategoryIcon name={t.icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{t.ten}</span>
        <span className="mt-1 block text-sm text-muted">{t.moTa}</span>
      </span>
      <ArrowRight className="mt-1 size-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}
