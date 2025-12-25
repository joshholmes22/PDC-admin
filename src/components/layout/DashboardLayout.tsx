import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        <div className="container py-6 px-6 pr-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
