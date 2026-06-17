"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/i18n/language-provider";
import { navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

const primaryMobileHrefs = new Set([
  "/dashboard",
  "/todos",
  "/documents",
  "/diary",
  "/settings",
]);

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const mobileItems = navItems.filter((item) => primaryMobileHrefs.has(item.href));

  return (
    <nav
      aria-label={t("nav.primary")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-panel/95 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-5 gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
        {mobileItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                className={cn(
                  "flex h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] text-muted transition-colors active:bg-background",
                  "hover:bg-background hover:text-foreground",
                  active && "bg-accent text-accent-foreground shadow-sm",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{t(item.labelKey)}</span>
              </Link>
            );
        })}
      </div>
    </nav>
  );
}
