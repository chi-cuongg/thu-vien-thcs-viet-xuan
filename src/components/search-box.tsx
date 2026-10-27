import { Search } from "lucide-react";

export function SearchBox({
  id = "q",
  action = "/tim-kiem",
  placeholder = "Tìm sách, tài liệu, đề thi…",
  defaultValue,
  size = "md",
}: {
  id?: string;
  action?: string;
  placeholder?: string;
  defaultValue?: string;
  size?: "md" | "lg";
}) {
  const height = size === "lg" ? "h-14 text-base" : "h-11 text-sm";
  return (
    <form action={action} role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Từ khoá tìm kiếm
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`${height} w-full rounded-xl border border-border bg-surface pl-12 pr-28 text-fg shadow-sm outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/30`}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:opacity-90"
      >
        Tìm
      </button>
    </form>
  );
}
