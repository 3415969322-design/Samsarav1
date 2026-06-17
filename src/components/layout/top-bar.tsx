"use client";

import { LogOut, Moon, Search, Sun } from "lucide-react";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { logoutAction } from "@/features/auth/actions";
import type { SessionPayload } from "@/lib/auth/session";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/i18n/language-provider";

export function TopBar({ session }: { session: SessionPayload }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-line bg-panel/95 px-4 py-3 backdrop-blur sm:flex-nowrap sm:px-6 sm:py-0">
      <button
        className="order-2 flex h-11 min-w-0 flex-[1_0_100%] items-center gap-2 rounded-md border border-line bg-background px-3 text-left text-sm text-muted transition-colors hover:text-foreground sm:order-none sm:h-10 sm:max-w-md sm:flex-1"
        onClick={() => window.dispatchEvent(new Event("samsara:open-command-palette"))}
        type="button"
      >
        <Search className="h-4 w-4" />
        <span className="truncate">{t("topbar.search")}</span>
        <span className="ml-auto hidden rounded border border-line px-1.5 py-0.5 text-xs sm:inline">
          ⌘K
        </span>
      </button>

      <div className="order-1 ml-auto flex items-center gap-2 sm:order-none sm:ml-3">
        <Button
          aria-label={t("theme.toggle")}
          className="h-11 w-11 px-0 sm:h-10 sm:w-10"
          onClick={toggleTheme}
          type="button"
          variant="secondary"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <LanguageToggle className="h-11 px-3 sm:h-10" />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{session.displayName}</p>
          <p className="text-xs text-muted">{session.email}</p>
        </div>
        <form action={logoutAction}>
          <Button
            aria-label={t("topbar.logout")}
            className="h-11 w-11 px-0 sm:h-10 sm:w-10"
            type="submit"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
