"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/components/layout/nav-items";
import { useLanguage } from "@/components/i18n/language-provider";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const openPalette = () => setOpen(true);
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("samsara:open-command-palette", openPalette);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("samsara:open-command-palette", openPalette);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4">
      <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-lg border border-line bg-panel shadow-xl">
        <form
          className="flex items-center gap-3 border-b border-line px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();

            if (!query.trim()) {
              return;
            }

            setOpen(false);
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          }}
        >
          <Search className="h-4 w-4 text-muted" />
          <input
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search.placeholder")}
            type="search"
            value={query}
          />
          <button
            aria-label={t("common.cancel")}
            className="rounded-md p-1 text-muted hover:bg-background hover:text-foreground"
            onClick={() => setOpen(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
        <div className="p-2">
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted">
            {t("dashboard.command")}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted hover:bg-background hover:text-foreground"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </span>
                <span className="text-xs">{item.phase}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
