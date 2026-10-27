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
    <div className="the px-6 py-12 text-center">
      <span className="mx-auto grid size-16 -rotate-6 place-items-center rounded-3xl bg-primary-soft text-primary shadow-clay">
        <Icon className="size-8" aria-hidden />
      </span>
      <h2 className="mt-5 text-xl font-bold">{title}</h2>
      {children && <div className="mx-auto mt-1 max-w-md text-muted">{children}</div>}
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}
