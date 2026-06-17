import { Skeleton } from "@/components/ui/skeleton";

export default function OsLoading() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="rounded-xl border border-line bg-panel p-6 shadow-sm lg:p-8">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-5 h-10 w-3/4 max-w-2xl" />
        <Skeleton className="mt-4 h-4 w-full max-w-xl" />
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="rounded-xl border border-line bg-panel p-5 shadow-sm" key={index}>
            <Skeleton className="h-11 w-11 rounded-lg" />
            <Skeleton className="mt-5 h-5 w-2/3" />
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        ))}
      </section>
    </div>
  );
}
