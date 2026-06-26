import Image from "next/image";
import { cn } from "@/lib/utils";

type GothicMedallionAnchorProps = {
  className?: string;
  variant?: "app" | "auth";
};

export function GothicMedallionAnchor({
  className,
  variant = "app",
}: GothicMedallionAnchorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("gothic-medallion-anchor", `gothic-medallion-anchor-${variant}`, className)}
    >
      <Image
        alt=""
        className="gothic-medallion-image object-contain"
        fill
        priority={variant === "auth"}
        sizes={variant === "auth" ? "(max-width: 768px) 92vw, 680px" : "720px"}
        src="/brand/gothic-stone-medallion.webp"
      />
    </div>
  );
}
