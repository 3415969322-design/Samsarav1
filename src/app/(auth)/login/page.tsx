import Link from "next/link";
import { redirect } from "next/navigation";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { T } from "@/components/i18n/text";
import { TranslatedInput } from "@/components/i18n/translated-controls";
import { loginAction } from "@/features/auth/actions";
import { getSessionFromCookies } from "@/lib/auth/server";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; next?: string }>;
}) {
  const session = await getSessionFromCookies();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const hasError = params?.error === "invalid";
  const hasDatabaseError = params?.error === "database";

  return (
    <AuthShell>
      <div className="mb-4 flex justify-end">
        <LanguageToggle className="min-h-11 px-3" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
        Samsara
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        <T k="login.title" />
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        <T k="login.description" />
      </p>
      <form action={loginAction} className="samsara-motion-stagger mt-6 space-y-4">
        <input name="next" type="hidden" value={params?.next ?? "/dashboard"} />
        <label className="block text-sm font-medium" htmlFor="email">
          <T k="login.email" />
        </label>
        <TranslatedInput
          autoComplete="email"
          className="min-h-11 w-full rounded-lg border border-line/90 bg-background/78 px-3 text-base outline-none ring-accent/20 transition-all duration-200 focus:border-accent/60 focus:ring-4 sm:text-sm"
          id="email"
          name="email"
          placeholderKey="login.email"
          required
          type="email"
        />
        <label className="block text-sm font-medium" htmlFor="password">
          <T k="login.password" />
        </label>
        <input
          autoComplete="current-password"
          className="min-h-11 w-full rounded-lg border border-line/90 bg-background/78 px-3 text-base outline-none ring-accent/20 transition-all duration-200 focus:border-accent/60 focus:ring-4 sm:text-sm"
          id="password"
          name="password"
          required
          type="password"
        />
        {hasError ? (
          <p className="text-sm text-danger">
            <T k="login.invalid" />
          </p>
        ) : null}
        {hasDatabaseError ? (
          <p className="text-sm text-danger">
            <T k="login.databaseError" />
          </p>
        ) : null}
        <Button className="w-full" type="submit" variant="primary">
          <T k="login.submit" />
        </Button>
      </form>
      <Link
        className="mt-4 block text-center text-sm text-muted underline transition-colors duration-200 hover:text-foreground"
        href="/register"
      >
        <T k="login.registerLink" />
      </Link>
    </AuthShell>
  );
}
