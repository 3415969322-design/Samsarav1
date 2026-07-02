import { cn } from "@/lib/utils";

type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
};

export function SectionCard({
  children,
  className,
  interactive = true,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-line bg-panel/95 p-4 shadow-sm transition-shadow duration-150 sm:p-5",
        interactive && "hover:shadow-md",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  action,
  children,
  className,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mt-4", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-4 border-t border-line pt-4 text-sm text-muted", className)}>
      {children}
    </div>
  );
}
