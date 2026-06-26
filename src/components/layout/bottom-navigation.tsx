"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/layout/nav-items";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

const primaryHrefs = new Set([
  "/dashboard",
  "/todos",
  "/documents",
  "/diary",
  "/exam-upload",
  "/settings",
]);

function isActiveNavItem(pathname: string, href: string) {
  if (href === "/exam-upload") {
    return pathname.startsWith("/exam-");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const items = navItems.filter((item) => primaryHrefs.has(item.href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-panel/90 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_34px_rgba(0,0,0,0.10)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActiveNavItem(pathname, item.href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-medium text-muted transition-all duration-200 sm:text-[11px]",
                "hover:-translate-y-0.5 hover:bg-background/82 hover:text-foreground active:translate-y-0 active:scale-95",
                active && "bg-accent/12 text-accent shadow-sm ring-1 ring-accent/15",
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
