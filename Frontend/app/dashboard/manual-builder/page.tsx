import { redirect } from "next/navigation"

export default function ManualBuilderPage() {
  // This route is handled by the main dashboard component
  redirect("/dashboard")
}
