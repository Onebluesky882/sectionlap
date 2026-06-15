import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="max-w-7xl mx-auto px-6 py-8 text-left">
        <Outlet />
      </main>
    </div>
  );
}
