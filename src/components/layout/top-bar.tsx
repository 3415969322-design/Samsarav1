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
    <header className="flex h-16 items-center justify-between border-b border-line bg-panel px-4 sm:px-6">
      <button
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-background px-3 py-2 text-left text-sm text-muted transition-colors hover:text-foreground sm:max-w-md"
        onClick={() => window.dispatchEvent(new Event("samsara:open-command-palette"))}
        type="button"
      >
        <Search className="h-4 w-4" />
        <span className="truncate">{t("topbar.search")}</span>
        <span className="ml-auto hidden rounded border border-line px-1.5 py-0.5 text-xs sm:inline">
          ⌘K
        </span>
      </button>

      <div className="ml-3 flex items-center gap-2">
        <Button
          aria-label={t("theme.toggle")}
          className="h-10 w-10 px-0"
          onClick={toggleTheme}
          type="button"
          variant="secondary"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <LanguageToggle className="h-10 px-3" />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{session.displayName}</p>
          <p className="text-xs text-muted">{session.email}</p>
        </div>
        <form action={logoutAction}>
          <Button aria-label={t("topbar.logout")} className="h-10 w-10 px-0" type="submit">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
