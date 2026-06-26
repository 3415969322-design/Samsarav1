import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/server";

export default async function ExamLoginPage() {
  const session = await getSessionFromCookies();

  if (session) {
    redirect("/exam-upload");
  }

  redirect("/login?next=/exam-upload");
}
