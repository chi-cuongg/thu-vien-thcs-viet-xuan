import {
  Baby,
  BookCopy,
  BookMarked,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  Headphones,
  Images,
  type LucideProps,
  MapPin,
  Newspaper,
  NotebookPen,
  Presentation,
  Scale,
  ScrollText,
  Star,
} from "lucide-react";

const ICONS = {
  Baby,
  BookCopy,
  BookMarked,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  Headphones,
  Images,
  MapPin,
  Newspaper,
  NotebookPen,
  Presentation,
  Scale,
  ScrollText,
  Star,
};

export function CategoryIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? FileText;
  return <Icon aria-hidden {...props} />;
}
