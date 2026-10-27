import { Search } from "lucide-react";

export function SearchBox({
  id = "q",
  action = "/tim-kiem",
  placeholder = "Tìm sách, tài liệu, đề thi…",
  defaultValue,
  size = "md",
  giuLai = {},
}: {
  id?: string;
  action?: string;
  placeholder?: string;
  defaultValue?: string;
  size?: "md" | "lg";
  /** Tham số giữ nguyên khi tìm lại (vd. bộ lọc khối lớp) */
  giuLai?: Record<string, string | number | undefined>;
}) {
  const height = size === "lg" ? "h-14 text-base" : "h-12 text-base";
  return (
    <form action={action} role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Từ khoá tìm kiếm
      </label>
      {Object.entries(giuLai).map(([ten, giaTri]) =>
        giaTri === undefined ? null : <input key={ten} type="hidden" name={ten} value={giaTri} />,
      )}
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
      <input
        id={id}
        name="q"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`${height} w-full rounded-xl border border-border bg-surface pl-12 pr-22 text-fg shadow-sm outline-none transition-shadow placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/20`}
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-[calc(100%-0.75rem)] -translate-y-1/2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg transition-opacity hover:opacity-90 active:opacity-80"
      >
        Tìm
      </button>
    </form>
  );
}
