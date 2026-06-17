import { T } from "@/components/i18n/text";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  action?: React.ReactNode;
  className?: string;
  textKey: TranslationKey;
};

export function EmptyState({ action, className, textKey }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-line bg-background/60 px-4 py-8 text-center text-sm text-muted",
        className,
      )}
    >
      <p>
        <T k={textKey} />
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
