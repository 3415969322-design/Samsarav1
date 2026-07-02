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
        "inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors duration-150 ease-in-out active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50",
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
