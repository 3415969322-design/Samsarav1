"use client";

import { CalendarDays } from "lucide-react";
import { useMemo } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

function getGreetingKey(hour: number): TranslationKey {
  if (hour < 6) {
    return "dashboard.greetingNight";
  }

  if (hour < 12) {
    return "dashboard.greetingMorning";
  }

  if (hour < 18) {
    return "dashboard.greetingAfternoon";
  }

  return "dashboard.greetingEvening";
}

export function DashboardWelcome({ displayName }: { displayName: string }) {
  const { language, t } = useLanguage();
  const now = useMemo(() => new Date(), []);
  const dateLabel = new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
    dateStyle: "full",
  }).format(now);

  return (
    <section className="rounded-lg border border-line bg-panel p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-background px-3 py-1 text-xs text-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            {dateLabel}
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">
            {t(getGreetingKey(now.getHours()))}
            {displayName}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            {t("dashboard.welcomeLine")}
          </p>
        </div>
        <div className="rounded-md border border-line bg-background px-3 py-2 text-sm text-muted">
          {t("dashboard.focusHint")}
        </div>
      </div>
    </section>
  );
}
