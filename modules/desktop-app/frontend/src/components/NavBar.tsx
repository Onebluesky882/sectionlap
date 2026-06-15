import { NavLink } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

export function NavBar() {
  const currentUser = useAppStore((state) => state.currentUser);
  const switchRole = useAppStore((state) => state.switchRole);

  return (
    <nav className="navbar">
      <div className="navbar-brand">SectionLap</div>
      <div className="navbar-links">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          end
        >
          Browse Sections
        </NavLink>
        {currentUser.role === "student" && (
          <NavLink
            to="/my-enrollments"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            My Enrollments
          </NavLink>
        )}
        {currentUser.role === "teacher" && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Teacher Dashboard
          </NavLink>
        )}
      </div>
      <button className="btn navbar-role" onClick={switchRole}>
        {currentUser.name} ({currentUser.role}) — Switch Role
      </button>
    </nav>
  );
}
