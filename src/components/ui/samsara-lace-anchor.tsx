import Image from "next/image";
import { cn } from "@/lib/utils";

type SamsaraLaceAnchorProps = {
  className?: string;
  variant: "auth" | "mobile-auth" | "mobile-topbar" | "topbar";
};

export function SamsaraLaceAnchor({ className, variant }: SamsaraLaceAnchorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "samsara-lace-anchor",
        variant === "auth"
          ? "samsara-lace-anchor-auth"
          : variant === "mobile-auth"
            ? "samsara-lace-anchor-mobile-auth"
            : variant === "mobile-topbar"
              ? "samsara-lace-anchor-mobile-topbar"
              : "samsara-lace-anchor-topbar",
        className,
      )}
    >
      <Image
        alt=""
        className="samsara-lace-anchor-image"
        height={731}
        priority={variant !== "topbar"}
        sizes={variant === "auth" ? "(min-width: 1024px) 52vw, 0px" : variant === "mobile-auth" ? "208px" : variant === "mobile-topbar" ? "86px" : "270px"}
        src="/brand/samsara-lace-anchor-cutout.webp"
        width={1600}
      />
    </div>
  );
}
