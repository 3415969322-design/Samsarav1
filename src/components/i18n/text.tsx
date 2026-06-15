"use client";

import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

export function T({ k }: { k: TranslationKey }) {
  const { t } = useLanguage();

  return <>{t(k)}</>;
}
