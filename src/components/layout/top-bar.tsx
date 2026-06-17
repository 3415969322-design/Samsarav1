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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-panel/95 px-3 backdrop-blur sm:h-16 sm:px-6">
      <button
        className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-background px-3 text-left text-sm text-muted transition-colors hover:border-accent/40 hover:text-foreground sm:max-w-md"
        onClick={() => window.dispatchEvent(new Event("samsara:open-command-palette"))}
        type="button"
      >
        <Search className="h-4 w-4" />
        <span className="truncate">{t("topbar.search")}</span>
        <span className="ml-auto hidden rounded border border-line px-1.5 py-0.5 text-xs sm:inline">
          ⌘K
        </span>
      </button>

      <div className="ml-2 flex items-center gap-1.5 sm:ml-3 sm:gap-2">
        <Button
          aria-label={t("theme.toggle")}
          className="h-11 w-11 px-0"
          onClick={toggleTheme}
          type="button"
          variant="secondary"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <LanguageToggle className="hidden h-11 px-3 sm:inline-flex" />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{session.displayName}</p>
          <p className="text-xs text-muted">{session.email}</p>
        </div>
        <form action={logoutAction}>
          <Button aria-label={t("topbar.logout")} className="h-11 w-11 px-0" type="submit">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
