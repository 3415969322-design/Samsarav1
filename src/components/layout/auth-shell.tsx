import { GothicMedallionAnchor } from "@/components/ui/gothic-medallion-anchor";
import { SamsaraLaceAnchor } from "@/components/ui/samsara-lace-anchor";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <main className="samsara-auth-shell relative flex min-h-screen items-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="samsara-background samsara-background-auth" />
      <GothicMedallionAnchor variant="auth" />
      <div aria-hidden="true" className="gothic-auth-vine gothic-auth-vine-left" />
      <div aria-hidden="true" className="gothic-auth-vine gothic-auth-vine-right" />
      <div className="relative z-10 mx-auto grid w-full max-w-[90rem] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,29rem)] xl:gap-16">
        <div className="samsara-auth-brand-stage relative hidden min-h-[38rem] items-center justify-center overflow-hidden lg:flex">
          <SamsaraLaceAnchor variant="auth" />
        </div>
        <SamsaraLaceAnchor className="mx-auto lg:hidden" variant="mobile-auth" />
        <section
          className={cn(
            "samsara-auth-card samsara-page-enter relative w-full max-w-md justify-self-center rounded-xl border border-line/90 bg-panel/96 p-5 shadow-sm backdrop-blur-xl sm:p-7 lg:justify-self-end lg:rounded-2xl",
            className,
          )}
        >
          {children}
        </section>
      </div>
    </main>
  );
}
