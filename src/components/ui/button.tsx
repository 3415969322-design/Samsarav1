import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10",
        variant === "primary" &&
          "bg-accent text-accent-foreground hover:opacity-90",
        variant === "secondary" &&
          "border border-line bg-panel text-foreground hover:bg-background",
        variant === "ghost" && "text-muted hover:bg-background hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
