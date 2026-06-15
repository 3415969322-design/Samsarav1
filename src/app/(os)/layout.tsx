import { AppShell } from "@/components/layout/app-shell";
import { requireSession } from "@/lib/auth/server";

export default async function OsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();

  return <AppShell session={session}>{children}</AppShell>;
}
