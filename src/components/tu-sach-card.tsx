import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { TONE, type Tone } from "@/components/ui";
import { TU_SACH } from "@/config/taxonomy";

const TONE_TU: Tone[] = ["yellow", "orange", "pink", "green", "violet", "blue"];

export function TuSachCard({ tuSach: t }: { tuSach: (typeof TU_SACH)[number] }) {
  const tone = TONE[TONE_TU[TU_SACH.indexOf(t) % TONE_TU.length]];
  return (
    <Link
      href={`/tu-sach/${t.slug}`}
      className={`the group flex h-full items-center gap-4 p-4 transition hover:-translate-y-1 hover:shadow-clay-lg ${tone.vien}`}
    >
      <span className={`grid size-14 shrink-0 -rotate-3 place-items-center rounded-2xl shadow-clay transition-transform group-hover:rotate-3 ${tone.chip}`}>
        <CategoryIcon name={t.icon} className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-bold leading-tight">{t.ten}</span>
        <span className="mt-1 block text-sm text-muted">{t.moTa}</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-fg" aria-hidden />
    </Link>
  );
}
