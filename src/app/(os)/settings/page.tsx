import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  updatePasswordAction,
  updateProfileAction,
} from "@/features/settings/actions";
import { ThemeSettingsForm } from "@/features/settings/theme-settings-form";
import { requireSession } from "@/lib/auth/server";
import { env } from "@/lib/config/env";
import { prisma } from "@/lib/db/prisma";
import { T } from "@/components/i18n/text";
import { TranslatedInput } from "@/components/i18n/translated-controls";
import type { TranslationKey } from "@/lib/i18n/dictionary";

function getThemeMode(value: unknown): "light" | "dark" {
  if (value && typeof value === "object" && "mode" in value) {
    const mode = (value as { mode?: unknown }).mode;

    return mode === "dark" ? "dark" : "light";
  }

  return "light";
}

const statusMessages: Record<string, TranslationKey> = {
  "password-current-invalid": "settings.statusPasswordCurrentInvalid",
  "password-invalid": "settings.statusPasswordInvalid",
  "password-saved": "settings.statusPasswordSaved",
  "profile-email-exists": "settings.statusProfileEmailExists",
  "profile-invalid": "settings.statusProfileInvalid",
  "profile-saved": "settings.statusProfileSaved",
  "theme-saved": "settings.statusThemeSaved",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const [user, settings] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      select: {
        displayName: true,
        email: true,
      },
      where: { id: session.userId },
    }),
    prisma.setting.findMany({
      where: { userId: session.userId },
    }),
  ]);
  const settingsByKey = new Map(settings.map((setting) => [setting.key, setting]));
  const themeMode = getThemeMode(settingsByKey.get("theme.mode")?.valueJson);
  const statusMessageKey = params?.status ? statusMessages[params.status] : undefined;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">
          v1.0
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          <T k="settings.title" />
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          <T k="settings.description" />
        </p>
        {statusMessageKey ? (
          <p className="mt-4 rounded-md border border-line bg-background px-3 py-2 text-sm">
            <T k={statusMessageKey} />
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-lg border border-line bg-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              <T k="settings.profile" />
            </h2>
            <Badge>
              <T k="settings.user" />
            </Badge>
          </div>
          <form action={updateProfileAction} className="mt-4 space-y-4">
            <label className="block text-sm font-medium" htmlFor="displayName">
              <T k="settings.displayName" />
            </label>
            <input
              className="h-10 w-full rounded-md border border-line bg-background px-3 text-sm"
              defaultValue={user.displayName}
              id="displayName"
              name="displayName"
              required
            />
            <label className="block text-sm font-medium" htmlFor="email">
              <T k="settings.email" />
            </label>
            <input
              className="h-10 w-full rounded-md border border-line bg-background px-3 text-sm"
              defaultValue={user.email}
              id="email"
              name="email"
              required
              type="email"
            />
            <Button type="submit" variant="primary">
              <T k="settings.saveProfile" />
            </Button>
          </form>
        </article>

        <article className="rounded-lg border border-line bg-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              <T k="settings.theme" />
            </h2>
            <Badge>
              <T k="settings.localDb" />
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            <T k="settings.themeDescription" />
          </p>
          <div className="mt-4">
            <ThemeSettingsForm initialMode={themeMode} />
          </div>
        </article>

        <article className="rounded-lg border border-line bg-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              <T k="settings.password" />
            </h2>
            <Badge>Auth</Badge>
          </div>
          <form action={updatePasswordAction} className="mt-4 space-y-4">
            <TranslatedInput
              autoComplete="current-password"
              className="h-10 w-full rounded-md border border-line bg-background px-3 text-sm"
              name="currentPassword"
              placeholderKey="settings.currentPassword"
              required
              type="password"
            />
            <TranslatedInput
              autoComplete="new-password"
              className="h-10 w-full rounded-md border border-line bg-background px-3 text-sm"
              minLength={8}
              name="nextPassword"
              placeholderKey="settings.newPassword"
              required
              type="password"
            />
            <TranslatedInput
              autoComplete="new-password"
              className="h-10 w-full rounded-md border border-line bg-background px-3 text-sm"
              minLength={8}
              name="confirmPassword"
              placeholderKey="settings.passwordConfirm"
              required
              type="password"
            />
            <Button type="submit" variant="primary">
              <T k="settings.updatePassword" />
            </Button>
          </form>
        </article>

        <article className="rounded-lg border border-line bg-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              <T k="settings.aiSettings" />
            </h2>
            <Badge>
              <T k="common.reserved" />
            </Badge>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">
                <T k="settings.provider" />
              </dt>
              <dd>{env.AI_PROVIDER}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">
                <T k="settings.model" />
              </dt>
              <dd>{env.AI_MODEL}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">
                <T k="settings.baseUrl" />
              </dt>
              <dd className="truncate">{env.AI_BASE_URL}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-muted">
            <T k="settings.aiDescription" />
          </p>
        </article>

        <article className="rounded-lg border border-line bg-panel p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              <T k="settings.storageSettings" />
            </h2>
            <Badge>
              <T k="common.reserved" />
            </Badge>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md border border-line bg-background p-3">
              <dt className="text-muted">
                <T k="settings.provider" />
              </dt>
              <dd className="mt-1 font-medium">{env.STORAGE_PROVIDER}</dd>
            </div>
            <div className="rounded-md border border-line bg-background p-3">
              <dt className="text-muted">
                <T k="settings.localRoot" />
              </dt>
              <dd className="mt-1 font-medium">{env.LOCAL_STORAGE_ROOT}</dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  );
}
