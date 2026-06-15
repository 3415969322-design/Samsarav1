"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { language, t, toggleLanguage } = useLanguage();
  const nextLabel =
    language === "zh" ? t("language.switchToEnglish") : t("language.switchToChinese");

  return (
    <Button
      aria-label={nextLabel}
      className={cn("gap-2", className)}
      onClick={toggleLanguage}
      type="button"
      variant="secondary"
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs font-semibold">{language === "zh" ? "中" : "EN"}</span>
    </Button>
  );
}
