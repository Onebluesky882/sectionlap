import { Link, NavLink } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Button } from "./ui/button";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "px-4 py-2 rounded-md text-sm bg-accent text-accent-foreground"
    : "px-4 py-2 rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors";

export function NavBar() {
  const currentUser = useAppStore((state) => state.currentUser);
  const switchRole = useAppStore((state) => state.switchRole);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-card border-b border-border">
      <div className="text-xl font-bold">
        <Link to="/">SectionLap</Link>
      </div>

      <div className="flex gap-2">
        <NavLink to="/" className={linkClass} end>
          Browse Sections
        </NavLink>
        {currentUser.role === "student" && (
          <NavLink to="/my-enrollments" className={linkClass}>
            My Enrollments
          </NavLink>
        )}
        {currentUser.role === "teacher" && (
          <NavLink to="/dashboard" className={linkClass}>
            Teacher Dashboard
          </NavLink>
        )}
      </div>

      <Button variant="outline" size="sm" className="text-sm whitespace-nowrap" onClick={switchRole}>
        {currentUser.name} ({currentUser.role}) — Switch Role
      </Button>
    </nav>
  );
}
