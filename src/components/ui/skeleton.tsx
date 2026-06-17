import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "samsara-skeleton rounded-md shadow-sm",
        className,
      )}
    />
  );
}
