import Link from "next/link";
import { T } from "@/components/i18n/text";
import { TranslatedInput } from "@/components/i18n/translated-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/server";
import { searchWorkspace } from "@/lib/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const q = (params?.q ?? "").trim();
  const results = await searchWorkspace({ query: q, userId: session.userId });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">
          v1.0
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          <T k="search.title" />
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          <T k="search.description" />
        </p>
      </section>

      <section className="rounded-lg border border-line bg-panel p-4">
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <TranslatedInput
            className="h-11 rounded-md border border-line bg-background px-3 text-sm"
            defaultValue={q}
            name="q"
            placeholderKey="search.placeholder"
          />
          <Button type="submit" variant="primary">
            <T k="common.search" />
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        {!q ? (
          <div className="rounded-lg border border-line bg-panel p-6 text-sm text-muted">
            <T k="search.empty" />
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-lg border border-line bg-panel p-6 text-sm text-muted">
            No results for “{q}”.
          </div>
        ) : (
          results.map((result) => (
            <Link
              className="block rounded-lg border border-line bg-panel p-4 transition-colors hover:bg-background"
              href={result.href}
              key={`${result.type}-${result.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{result.title}</h2>
                <Badge>{result.type}</Badge>
              </div>
              {result.excerpt ? (
                <p className="mt-2 text-sm leading-6 text-muted">{result.excerpt}</p>
              ) : null}
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
