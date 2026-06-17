"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/layout/nav-items";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

const primaryHrefs = new Set(["/dashboard", "/todos", "/documents", "/diary", "/settings"]);

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const items = navItems.filter((item) => primaryHrefs.has(item.href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium text-muted transition-colors",
                "hover:bg-background hover:text-foreground",
                active && "bg-accent/10 text-accent",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
