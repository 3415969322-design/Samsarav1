import { GothicMedallionAnchor } from "@/components/ui/gothic-medallion-anchor";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <main className="samsara-auth-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="samsara-background samsara-background-auth" />
      <GothicMedallionAnchor variant="auth" />
      <div aria-hidden="true" className="gothic-auth-vine gothic-auth-vine-left" />
      <div aria-hidden="true" className="gothic-auth-vine gothic-auth-vine-right" />
      <section
        className={cn(
          "samsara-auth-card samsara-page-enter relative z-10 w-full max-w-md rounded-2xl border border-line/90 bg-panel/96 p-5 shadow-sm backdrop-blur-xl sm:p-7",
          className,
        )}
      >
        {children}
      </section>
    </main>
  );
}
