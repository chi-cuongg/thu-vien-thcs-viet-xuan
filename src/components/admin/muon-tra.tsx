"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { giaHan, giaoSach, huyPhieu, nhanTraSach } from "@/app/quan-tri/muon-tra-actions";
import { hienNgay } from "@/config/muon-sach";

const NUT_NHO =
  "inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold transition disabled:pointer-events-none disabled:opacity-60";

/** Chọn bản sách (số ĐKCB) còn trên giá rồi giao cho học sinh. */
export function GiaoSachForm({ phieuId, dsDkcb }: { phieuId: number; dsDkcb: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const soDkcb = String(new FormData(e.currentTarget).get("so-dkcb") ?? "");
        startTransition(async () => {
          const kq = await giaoSach(phieuId, soDkcb);
          if (!kq.ok) window.alert(kq.error);
          router.refresh();
        });
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <label className="sr-only" htmlFor={`dkcb-${phieuId}`}>
        Bản giao cho học sinh
      </label>
      <select
        id={`dkcb-${phieuId}`}
        name="so-dkcb"
        required
        disabled={pending || dsDkcb.length === 0}
        className="min-h-10 rounded-full border-[1.5px] border-border bg-surface px-3 font-mono text-sm disabled:opacity-60"
      >
        {dsDkcb.length === 0 && <option value="">Hết bản trên giá</option>}
        {dsDkcb.map((so) => (
          <option key={so} value={so}>
            {so}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending || dsDkcb.length === 0}
        className={`${NUT_NHO} bg-primary text-primary-fg shadow-nut hover:brightness-110`}
      >
        {pending ? "Đang lưu…" : "Giao sách"}
      </button>
      <NutPhu
        nhan="Huỷ"
        hoi="Huỷ phiếu đặt này? (học sinh không đến nhận)"
        chay={() => huyPhieu(phieuId)}
        className="text-muted hover:bg-danger-soft hover:text-danger"
      />
    </form>
  );
}

export function NutTraSach({ phieuId, ten }: { phieuId: number; ten: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <NutPhu
        nhan="Gia hạn"
        chay={async () => {
          const kq = await giaHan(phieuId);
          if (kq.ok) window.alert(`Đã gia hạn tới ${hienNgay(kq.hanTra)}.`);
          return kq;
        }}
        className="border-[1.5px] border-border bg-surface hover:border-primary hover:text-primary"
      />
      <NutPhu
        nhan="Đã trả"
        hoi={`Xác nhận đã nhận lại “${ten}”?`}
        chay={() => nhanTraSach(phieuId)}
        className="bg-success-soft text-success hover:brightness-95"
      />
    </div>
  );
}

function NutPhu({
  nhan,
  hoi,
  chay,
  className,
}: {
  nhan: string;
  hoi?: string;
  chay: () => Promise<{ ok: true } | { ok: false; error: string }>;
  className: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (hoi && !window.confirm(hoi)) return;
        startTransition(async () => {
          const kq = await chay();
          if (!kq.ok) window.alert(kq.error);
          router.refresh();
        });
      }}
      className={`${NUT_NHO} ${className}`}
    >
      {pending ? "…" : nhan}
    </button>
  );
}
