import { T } from "@/components/i18n/text";
import { Badge } from "@/components/ui/badge";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const foundationItems: TranslationKey[] = [
  "dashboard.foundation.auth",
  "dashboard.foundation.db",
  "dashboard.foundation.storage",
  "dashboard.foundation.ai",
  "dashboard.foundation.theme",
  "dashboard.foundation.command",
  "dashboard.foundation.todo",
  "dashboard.foundation.documents",
  "dashboard.foundation.tags",
  "dashboard.foundation.files",
  "dashboard.foundation.diary",
  "dashboard.foundation.workbench",
];

const workspaceModules = [
  { phase: "v1.0", titleKey: "nav.todo", textKey: "dashboard.module.todo" },
  { phase: "v1.0", titleKey: "nav.documents", textKey: "dashboard.module.documents" },
  { phase: "v1.0", titleKey: "nav.files", textKey: "dashboard.module.files" },
  { phase: "v1.0", titleKey: "nav.diary", textKey: "dashboard.module.diary" },
  { phase: "v1.0", titleKey: "ai.title", textKey: "dashboard.module.ai" },
] as const satisfies readonly {
  phase: string;
  textKey: TranslationKey;
  titleKey: TranslationKey;
}[];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-6 sm:p-8">
        <Badge>v1.0</Badge>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
          <T k="dashboard.hero" />
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          <T k="dashboard.heroText" />
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-line bg-panel p-6">
          <h2 className="text-lg font-semibold">
            <T k="dashboard.foundationStatus" />
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {foundationItems.map((item) => (
              <div
                className="rounded-md border border-line bg-background px-4 py-3 text-sm"
                key={item}
              >
                <T k={item} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-panel p-6">
          <h2 className="text-lg font-semibold">
            <T k="dashboard.globalSearch" />
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            <T k="dashboard.globalSearchText" />
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {workspaceModules.map((module) => (
          <div className="rounded-lg border border-line bg-panel p-5" key={module.titleKey}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {module.phase}
            </p>
            <h3 className="mt-3 font-semibold">
              <T k={module.titleKey} />
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              <T k={module.textKey} />
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
