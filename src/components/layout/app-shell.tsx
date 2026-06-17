import { BottomNavigation } from "@/components/layout/bottom-navigation";
import type { SessionPayload } from "@/lib/auth/session";
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar session={session} />
        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-6">
          {children}
        </main>
      </div>
      <BottomNavigation />
      <CommandPalette />
    </div>
  );
}
