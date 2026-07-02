"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, MoreHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isActiveNavItem, navItems } from "@/components/layout/nav-items";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { useLanguage } from "@/components/i18n/language-provider";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const primaryHrefs = new Set(["/dashboard", "/todos", "/exam-upload", "/files"]);

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const primaryItems = navItems.filter((item) => primaryHrefs.has(item.href));
  const moreItems = navItems.filter((item) => !primaryHrefs.has(item.href));
  const moreActive = moreItems.some((item) => isActiveNavItem(pathname, item.href));

  useEffect(() => {
    if (!moreOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [moreOpen]);

  return (
    <>
      {moreOpen ? (
        <button
          aria-label={t("common.close")}
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMoreOpen(false)}
          type="button"
        />
      ) : null}

      {moreOpen ? (
        <section
          aria-label={t("nav.more")}
          className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-xl border border-line bg-panel p-3 shadow-lg lg:hidden"
          id="mobile-more-navigation"
          aria-modal="true"
          role="dialog"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-sm font-semibold">{t("nav.more")}</p>
            <button
              aria-label={t("common.close")}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-muted active:scale-95 active:bg-background"
              onClick={() => setMoreOpen(false)}
              ref={closeButtonRef}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveNavItem(pathname, item.href);

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted active:scale-95 active:bg-background",
                    active && "bg-accent/12 text-accent ring-1 ring-accent/20",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setMoreOpen(false)}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                  <span className="max-w-full truncate">{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
            <LanguageToggle className="min-h-11 flex-1 justify-center" />
            <form action={logoutAction} className="flex-1">
              <button
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground active:bg-background"
                type="submit"
              >
                <LogOut className="h-4 w-4" />
                {t("topbar.logout")}
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line/80 bg-panel/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-6px_18px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveNavItem(pathname, item.href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium text-muted transition-colors duration-150 active:scale-95 active:bg-background",
                active && "bg-accent/12 text-accent ring-1 ring-accent/20",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              <span className="max-w-full truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
          <button
            aria-controls="mobile-more-navigation"
            aria-expanded={moreOpen}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium text-muted transition-colors duration-150 active:scale-95 active:bg-background",
              (moreActive || moreOpen) && "bg-accent/12 text-accent ring-1 ring-accent/20",
            )}
            onClick={() => setMoreOpen((open) => !open)}
            type="button"
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={moreActive || moreOpen ? 2.2 : 1.8} />
            <span>{t("nav.more")}</span>
          </button>
      </div>
    </nav>
    </>
  );
}
