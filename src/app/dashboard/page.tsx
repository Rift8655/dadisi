import { redirect } from "next/navigation"

export const metadata = {
  title: "Dashboard",
  description: "User dashboard",
}

export default function DashboardPage() {
  // Redirect to the overview page for a cleaner URL structure
  redirect("/dashboard/overview")
}
