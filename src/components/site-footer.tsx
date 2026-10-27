import { ExternalLink } from "lucide-react";
import { SITE } from "@/config/site";
import { LIEN_KET } from "@/config/taxonomy";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <p className="font-semibold">{SITE.name}</p>
          <p className="mt-1 text-sm text-muted">{SITE.school}</p>
          <p className="text-sm text-muted">{SITE.address}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Liên kết học liệu số</p>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {LIEN_KET.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted hover:text-primary"
                >
                  {link.ten}
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
