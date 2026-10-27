"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BookmarkPlus, CircleCheck } from "lucide-react";
import { datMuon, huyDatMuon } from "@/app/muon-sach-actions";
import { NUT_CHINH, NUT_PHU } from "@/components/ui";

/** Nút đặt mượn ở kết quả tra cứu. Chưa đăng nhập thì chuyển sang trang đăng nhập rồi quay lại đúng chỗ. */
export function DatMuonNut({ dauSachId, tiep }: { dauSachId: number; tiep: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [daDat, setDaDat] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  if (daDat) {
    return (
      <p role="status" className="flex flex-wrap items-center gap-x-2 text-sm font-bold text-success">
        <CircleCheck className="size-5" aria-hidden /> Đã đặt —
        <Link href="/tai-khoan" className="text-primary underline underline-offset-2">
          xem phiếu của em
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setLoi(null);
            const kq = await datMuon(dauSachId);
            if (kq.ok) return setDaDat(true);
            if ("canDangNhap" in kq) return router.push(`/dang-nhap?tiep=${encodeURIComponent(tiep)}`);
            setLoi(kq.error);
          })
        }
        className={`${NUT_CHINH} min-h-10 px-4 text-sm`}
      >
        <BookmarkPlus className="size-4" aria-hidden />
        {pending ? "Đang đặt…" : "Đặt mượn"}
      </button>
      {loi && (
        <p role="alert" className="max-w-xs text-sm text-danger md:text-right">
          {loi}
        </p>
      )}
    </div>
  );
}

export function HuyDatNut({ phieuId }: { phieuId: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Huỷ phiếu đặt mượn này?")) return;
        startTransition(async () => {
          const kq = await huyDatMuon(phieuId);
          if (!kq.ok) window.alert(kq.error);
          router.refresh();
        });
      }}
      className={`${NUT_PHU} min-h-10 px-4 text-sm hover:!border-danger hover:!text-danger`}
    >
      {pending ? "Đang huỷ…" : "Huỷ đặt"}
    </button>
  );
}
