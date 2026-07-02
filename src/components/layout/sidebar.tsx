"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveNavItem, navItems } from "@/components/layout/nav-items";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="relative z-10 hidden w-72 shrink-0 border-r border-line/85 bg-panel/92 backdrop-blur-xl lg:block">
      <div className="flex h-16 items-center border-b border-line/80 px-6">
        <div>
          <p className="text-lg font-semibold">Samsara</p>
          <p className="text-xs text-muted">{t("nav.personalOs")}</p>
        </div>
      </div>
      <nav className="space-y-1.5 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveNavItem(pathname, item.href);

          return (
            <Link
              className={cn(
                "flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-muted transition-colors duration-150 hover:bg-background/82 hover:text-foreground",
                active && "bg-background/90 text-foreground shadow-sm ring-1 ring-line/70",
              )}
              href={item.href}
              key={item.href}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
