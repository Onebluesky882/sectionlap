import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

export function Layout() {
  return (
    <div id="App">
      <NavBar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
