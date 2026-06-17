import { T } from "@/components/i18n/text";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  descriptionKey?: TranslationKey;
  eyebrow?: React.ReactNode;
  titleKey: TranslationKey;
};

export function PageHeader({
  actions,
  badge,
  className,
  descriptionKey,
  eyebrow,
  titleKey,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-line bg-panel p-4 shadow-sm sm:p-6 lg:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {eyebrow}
              </p>
            ) : null}
            {badge}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <T k={titleKey} />
          </h1>
          {descriptionKey ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              <T k={descriptionKey} />
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}
