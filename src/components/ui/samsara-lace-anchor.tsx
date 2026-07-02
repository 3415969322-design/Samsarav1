import Image from "next/image";
import { cn } from "@/lib/utils";

type SamsaraLaceAnchorProps = {
  className?: string;
  variant: "auth" | "topbar";
};

export function SamsaraLaceAnchor({ className, variant }: SamsaraLaceAnchorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "samsara-lace-anchor",
        variant === "auth" ? "samsara-lace-anchor-auth" : "samsara-lace-anchor-topbar",
        className,
      )}
    >
      <Image
        alt=""
        className="samsara-lace-anchor-image"
        height={731}
        priority={variant === "auth"}
        sizes={variant === "auth" ? "(min-width: 1024px) 52vw, 0px" : "270px"}
        src="/brand/samsara-lace-anchor-cutout.webp"
        unoptimized
        width={1600}
      />
    </div>
  );
}
