"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/layout/nav-items";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="relative z-10 hidden w-72 shrink-0 border-r border-line bg-panel lg:block">
      <div className="flex h-16 items-center border-b border-line px-6">
        <div>
          <p className="text-lg font-semibold">Samsara</p>
          <p className="text-xs text-muted">{t("nav.personalOs")}</p>
        </div>
      </div>
      <nav className="space-y-1.5 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              className={cn(
                "flex min-h-11 items-center justify-between rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground",
                active && "bg-background text-foreground shadow-sm",
              )}
              href={item.href}
              key={item.href}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {t(item.labelKey)}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-muted">
                {item.phase}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
