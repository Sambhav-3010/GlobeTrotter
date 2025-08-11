import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Home() {
  const cookieStore = await cookies();
  if (cookieStore.has("token")) {
    return redirect("/dashboard");
  }
  redirect("/auth");
}