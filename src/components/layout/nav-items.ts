import {
  Bot,
  CalendarDays,
  CheckSquare,
  FolderOpen,
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
  phase: string;
};

export const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard", phase: "v1.0" },
  { href: "/todos", icon: CheckSquare, labelKey: "nav.todo", phase: "v1.0" },
  { href: "/documents", icon: Text, labelKey: "nav.documents", phase: "v1.0" },
  { href: "/tags", icon: Tags, labelKey: "nav.tags", phase: "v1.0" },
  { href: "/search", icon: Search, labelKey: "nav.search", phase: "v1.0" },
  { href: "/files", icon: FolderOpen, labelKey: "nav.files", phase: "v1.0" },
  { href: "/diary", icon: CalendarDays, labelKey: "nav.diary", phase: "v1.0" },
  { href: "/ai", icon: Bot, labelKey: "nav.ai", phase: "v1.0" },
  { href: "/settings", icon: Settings, labelKey: "nav.settings", phase: "v1.0" },
] as const satisfies readonly NavItem[];
