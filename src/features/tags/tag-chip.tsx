import { cn } from "@/lib/utils";

export function TagChip({
  color,
  name,
  selected = false,
}: {
  color: string;
  name: string;
  selected?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        selected ? "border-transparent text-white" : "border-line text-muted",
      )}
      style={selected ? { backgroundColor: color } : { borderColor: color }}
    >
      {name}
    </span>
  );
}
