import Link from "next/link";
import { redirect } from "next/navigation";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { T } from "@/components/i18n/text";
import { TranslatedInput } from "@/components/i18n/translated-controls";
import { Button } from "@/components/ui/button";
import { registerAction } from "@/features/auth/actions";
import { getSessionFromCookies } from "@/lib/auth/server";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const errorMessages: Record<string, TranslationKey> = {
  "email-exists": "register.emailExists",
  "invite-invalid": "register.inviteInvalid",
  "invite-unconfigured": "register.inviteUnconfigured",
  "missing-fields": "register.missingFields",
  "password-mismatch": "register.passwordMismatch",
  "password-short": "register.passwordShort",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await getSessionFromCookies();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorKey = params?.error ? errorMessages[params.error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-sm sm:p-7">
        <div className="mb-4 flex justify-end">
          <LanguageToggle className="min-h-11 px-3" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Samsara
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          <T k="register.title" />
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          <T k="register.description" />
        </p>

        <form action={registerAction} className="mt-6 space-y-4">
          <label className="block text-sm font-medium" htmlFor="email">
            <T k="register.email" />
          </label>
          <TranslatedInput
            autoComplete="email"
            className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base outline-none ring-accent/20 transition focus:ring-4 sm:text-sm"
            id="email"
            name="email"
            placeholderKey="register.email"
            required
            type="email"
          />

          <label className="block text-sm font-medium" htmlFor="displayName">
            <T k="register.displayName" />
          </label>
          <TranslatedInput
            autoComplete="name"
            className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base outline-none ring-accent/20 transition focus:ring-4 sm:text-sm"
            id="displayName"
            name="displayName"
            placeholderKey="register.displayName"
            required
          />

          <label className="block text-sm font-medium" htmlFor="password">
            <T k="register.password" />
          </label>
          <TranslatedInput
            autoComplete="new-password"
            className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base outline-none ring-accent/20 transition focus:ring-4 sm:text-sm"
            id="password"
            minLength={8}
            name="password"
            placeholderKey="register.password"
            required
            type="password"
          />

          <label className="block text-sm font-medium" htmlFor="confirmPassword">
            <T k="register.confirmPassword" />
          </label>
          <TranslatedInput
            autoComplete="new-password"
            className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base outline-none ring-accent/20 transition focus:ring-4 sm:text-sm"
            id="confirmPassword"
            minLength={8}
            name="confirmPassword"
            placeholderKey="register.confirmPassword"
            required
            type="password"
          />

          <label className="block text-sm font-medium" htmlFor="inviteCode">
            <T k="register.inviteCode" />
          </label>
          <TranslatedInput
            autoComplete="off"
            className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base outline-none ring-accent/20 transition focus:ring-4 sm:text-sm"
            id="inviteCode"
            name="inviteCode"
            placeholderKey="register.inviteCode"
            required
            type="password"
          />

          {errorKey ? (
            <p className="text-sm text-danger">
              <T k={errorKey} />
            </p>
          ) : null}

          <Button className="w-full" type="submit" variant="primary">
            <T k="register.submit" />
          </Button>
        </form>

        <Link
          className="mt-4 block text-center text-sm text-muted underline hover:text-foreground"
          href="/login"
        >
          <T k="register.loginLink" />
        </Link>
      </section>
    </main>
  );
}
