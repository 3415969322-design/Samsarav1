"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/i18n/language-provider";
import { useTheme } from "@/components/theme/theme-provider";
import { updateThemeSettingAction } from "@/features/settings/actions";

export function ThemeSettingsForm({ initialMode }: { initialMode: "light" | "dark" }) {
  const { t } = useLanguage();
  const { setTheme, theme } = useTheme();

  return (
    <form action={updateThemeSettingAction} className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {(["light", "dark"] as const).map((mode) => (
          <label
            className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-line bg-background px-3 py-2 text-sm transition-colors hover:border-accent/40"
            key={mode}
          >
            <span>{mode === "dark" ? t("theme.dark") : t("theme.light")}</span>
            <input
              defaultChecked={(theme || initialMode) === mode}
              name="themeMode"
              onChange={() => setTheme(mode)}
              type="radio"
              value={mode}
            />
          </label>
        ))}
      </div>
      <Button type="submit">{t("settings.saveTheme")}</Button>
    </form>
  );
}
