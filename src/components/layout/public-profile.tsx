"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { useLanguage } from "@/components/i18n/language-provider";
import { Badge } from "@/components/ui/badge";

const stack = [
  "Next.js App Router",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "Prisma 7",
  "PostgreSQL",
  "StorageProvider",
  "AIProvider",
];

export function PublicProfile() {
  const { t } = useLanguage();
  const features = [
    {
      title: t("profile.featureOsTitle"),
      text: t("profile.featureOsText"),
    },
    {
      title: t("profile.featureTodoTitle"),
      text: t("profile.featureTodoText"),
    },
    {
      title: t("profile.featureFilesTitle"),
      text: t("profile.featureFilesText"),
    },
    {
      title: t("profile.aiTitle"),
      text: t("profile.aiText"),
    },
  ];
  const principles = [
    t("profile.philosophy1"),
    t("profile.philosophy2"),
    t("profile.philosophy3"),
    t("profile.philosophy4"),
    t("profile.philosophy5"),
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">Samsara</p>
              <p className="text-xs text-muted">{t("profile.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle className="h-10 px-3" />
              <Link className="text-sm text-muted hover:text-foreground" href="/profile">
                {t("profile.profile")}
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground"
                href="/login"
              >
                {t("profile.enter")}
              </Link>
            </div>
          </nav>

          <div className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Badge>{t("profile.release")}</Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
                {t("profile.hero")}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
                {t("profile.description")}
              </p>
            </div>

            <div className="rounded-lg border border-line bg-background p-4">
              <div className="rounded-md border border-line bg-panel p-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <p className="font-semibold">{t("profile.today")}</p>
                    <p className="text-xs text-muted">{t("profile.dashboardSnapshot")}</p>
                  </div>
                  <Badge>{t("common.private")}</Badge>
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    t("profile.snapshot1"),
                    t("profile.snapshot2"),
                    t("profile.snapshot3"),
                    t("profile.snapshot4"),
                  ].map((item) => (
                    <div
                      className="rounded-md border border-line bg-background px-3 py-2 text-sm"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted">
            {t("profile.positioning")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold">{t("profile.positioningTitle")}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
            {t("profile.positioningText")}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <article
              className="rounded-lg border border-line bg-panel p-5"
              key={feature.title}
            >
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-panel">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted">
              {t("profile.tech")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">{t("profile.techTitle")}</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {stack.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted">
              {t("profile.development")}
            </p>
            <div className="mt-5 grid gap-3">
              {principles.map((principle) => (
                <div
                  className="rounded-md border border-line bg-background px-4 py-3 text-sm"
                  key={principle}
                >
                  {principle}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
