import { redirect } from "next/navigation";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { T } from "@/components/i18n/text";
import { loginAction } from "@/features/auth/actions";
import { getSessionFromCookies } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await getSessionFromCookies();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const hasError = params?.error === "invalid";
  const hasDatabaseError = params?.error === "database";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-lg border border-line bg-panel p-6 shadow-sm">
        <div className="mb-4 flex justify-end">
          <LanguageToggle className="h-10 px-3" />
        </div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Samsara
        </p>
        <h1 className="mt-4 text-3xl font-semibold">
          <T k="login.title" />
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          <T k="login.description" />
        </p>
        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block text-sm font-medium" htmlFor="password">
            <T k="login.password" />
          </label>
          <input
            autoComplete="current-password"
            className="h-11 w-full rounded-md border border-line bg-background px-3 text-sm outline-none ring-accent/20 transition focus:ring-4"
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
      </section>
    </main>
  );
}
