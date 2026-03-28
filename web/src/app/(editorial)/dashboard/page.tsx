import { requireClerkUser } from "@/lib/clerk-guards";
import { DashboardClient } from "@/components/articles/dashboard-client";

export default async function DashboardPage() {
  await requireClerkUser();
  return <DashboardClient />;
}
