import { DashboardShell } from "../components/dashboard-shell";
import { getMockDashboardViewModel } from "../lib/mock-data";

export default function HomePage() {
  const dashboard = getMockDashboardViewModel();

  return <DashboardShell dashboard={dashboard} />;
}
