import { redirect } from "next/navigation"

export default function ProfilePage() {
  // This route is handled by the main dashboard component
  redirect("/dashboard")
}
