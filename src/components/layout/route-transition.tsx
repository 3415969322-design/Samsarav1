"use client";

import { usePathname } from "next/navigation";

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="samsara-route-transition" key={pathname}>
      {children}
    </div>
  );
}
