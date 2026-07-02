import {
  Bot,
  CalendarDays,
  CheckSquare,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Search,
  Settings,
  Tags,
  Text,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n/dictionary";

type NavItem = {
  href: string;
  icon: typeof LayoutDashboard;
  labelKey: TranslationKey;
};

export const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { href: "/todos", icon: CheckSquare, labelKey: "nav.todo" },
  { href: "/documents", icon: Text, labelKey: "nav.documents" },
  { href: "/tags", icon: Tags, labelKey: "nav.tags" },
  { href: "/search", icon: Search, labelKey: "nav.search" },
  { href: "/files", icon: FolderOpen, labelKey: "nav.files" },
  { href: "/diary", icon: CalendarDays, labelKey: "nav.diary" },
  { href: "/ai", icon: Bot, labelKey: "nav.ai" },
  { href: "/exam-upload", icon: GraduationCap, labelKey: "nav.exam" },
  { href: "/settings", icon: Settings, labelKey: "nav.settings" },
] as const satisfies readonly NavItem[];

export function isActiveNavItem(pathname: string, href: string) {
  if (href === "/exam-upload") {
    return pathname.startsWith("/exam-");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
