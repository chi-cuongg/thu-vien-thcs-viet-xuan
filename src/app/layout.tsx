import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/config/site";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.shortName}` },
  description: SITE.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnam.variable} h-full antialiased`}>
      {/* pb trên điện thoại: chừa chỗ cho thanh điều hướng ở đáy */}
      <body className="flex min-h-full flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] font-sans md:pb-0">
        <a
          href="#noi-dung"
          className="sr-only z-50 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
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
