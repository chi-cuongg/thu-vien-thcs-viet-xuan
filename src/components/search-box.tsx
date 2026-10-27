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
  const lon = size === "lg";
  return (
    <form action={action} role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Từ khoá tìm kiếm
      </label>
      {Object.entries(giuLai).map(([ten, giaTri]) =>
        giaTri === undefined ? null : <input key={ten} type="hidden" name={ten} value={giaTri} />,
      )}
      <Search
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-primary ${lon ? "left-5 size-6" : "left-4 size-5"}`}
        aria-hidden
      />
      <input
        id={id}
        name="q"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`${lon ? "h-16 pl-14 pr-28 text-lg" : "h-13 pl-12 pr-24 text-base"} w-full rounded-full border-[1.5px] border-border bg-surface font-semibold text-fg shadow-clay outline-none transition placeholder:font-normal placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/20`}
      />
      <button
        type="submit"
        className={`absolute right-2 top-1/2 h-[calc(100%-1rem)] -translate-y-1/2 rounded-full bg-primary font-bold text-primary-fg shadow-nut transition hover:brightness-110 active:translate-y-[calc(-50%+2px)] active:shadow-none ${lon ? "px-6" : "px-5"}`}
      >
        Tìm
      </button>
    </form>
  );
}
