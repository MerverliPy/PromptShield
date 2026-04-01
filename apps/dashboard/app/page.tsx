import { DashboardShell } from "../components/dashboard-shell";
import { getDashboardViewModel } from "../lib/get-dashboard-view-model";

export default function HomePage() {
  const dashboard = getDashboardViewModel();

  return <DashboardShell dashboard={dashboard} />;
}
