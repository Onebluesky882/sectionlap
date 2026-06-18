<<<<<<< HEAD
import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

export function Layout() {
  return (
    <div id="App">
      <NavBar />
      <main className="content">
=======
import { Outlet, Navigate } from "react-router-dom";
import { NavBar } from "./NavBar";
import { useAppStore } from "../store/useAppStore";

export function Layout() {
  const currentUser = useAppStore((state) => state.currentUser);

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="max-w-7xl mx-auto px-6 py-8 text-left">
>>>>>>> wansing
        <Outlet />
      </main>
    </div>
  );
}
