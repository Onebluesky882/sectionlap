import { NavLink } from "react-router-dom";

export function NavBar() {
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
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Teacher Dashboard
        </NavLink>
      </div>
    </nav>
  );
}
