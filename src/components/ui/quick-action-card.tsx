import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { T } from "@/components/i18n/text";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

type QuickActionCardProps = {
  className?: string;
  href: string;
  icon: LucideIcon;
  textKey: TranslationKey;
  titleKey: TranslationKey;
};

export function QuickActionCard({
  className,
  href,
  icon: Icon,
  textKey,
  titleKey,
}: QuickActionCardProps) {
  return (
    <Link
      className={cn(
        "group flex min-h-24 items-start gap-3 rounded-xl border border-line bg-panel/95 p-4 shadow-sm transition-colors duration-150 hover:border-accent/50 hover:bg-background",
        className,
      )}
      href={href}
    >
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors duration-150 group-hover:bg-accent group-hover:text-accent-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold">
          <T k={titleKey} />
        </span>
        <span className="mt-1 block text-sm leading-5 text-muted">
          <T k={textKey} />
        </span>
      </span>
    </Link>
  );
}
