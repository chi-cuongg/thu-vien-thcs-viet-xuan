import { BookOpen, type LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  icon: Icon = BookOpen,
  actions,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  /** Nút/link gợi ý bước tiếp theo */
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-7" aria-hidden />
      </span>
      <p className="mt-4 text-lg font-semibold">{title}</p>
      {children && <div className="mx-auto mt-1 max-w-md text-sm text-muted">{children}</div>}
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}
