import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/config/site";
import { SCRIPT_GIAO_DIEN } from "@/lib/giao-dien";
import "./globals.css";

// Nunito cho nội dung (tròn, dễ đọc), Baloo 2 cho tiêu đề (thân thiện) — cả hai có bộ chữ tiếng Việt
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  // Địa chỉ gốc cho link ảnh xem trước khi chia sẻ (Zalo, Facebook cần URL tuyệt đối)
  metadataBase: new URL(process.env.BETTER_AUTH_URL || "http://localhost:3000"),
  title: { default: SITE.name, template: `%s · ${SITE.shortName}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: script bên dưới gắn data-theme lên <html> trước khi React hydrate
    <html lang="vi" className={`${nunito.variable} ${baloo.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_GIAO_DIEN }} />
      </head>
      {/* pb trên điện thoại: chừa chỗ cho thanh điều hướng ở đáy */}
      <body className="flex min-h-full flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] font-sans md:pb-0">
        <a
          href="#noi-dung"
          className="sr-only z-50 rounded-full bg-primary px-5 py-2.5 font-bold text-primary-fg shadow-nut focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Bỏ qua, tới nội dung chính
        </a>
        <SiteHeader />
        <main id="noi-dung" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
