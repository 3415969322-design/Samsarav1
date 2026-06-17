import type { SessionPayload } from "@/lib/auth/session";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { CommandPalette } from "@/components/command/command-palette";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: SessionPayload;
}) {
  return (
    <div className="samsara-app-shell flex min-h-screen overflow-x-hidden bg-background/90">
      <div aria-hidden="true" className="samsara-background" />
      <Sidebar />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <TopBar session={session} />
        <main className="samsara-page-enter mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-4 sm:p-6 sm:pb-28 lg:p-8">
          {children}
        </main>
      </div>
      <BottomNavigation />
      <CommandPalette />
    </div>
  );
}
