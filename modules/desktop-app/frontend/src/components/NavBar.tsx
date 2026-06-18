<<<<<<< HEAD
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
=======
import { Link, NavLink, useNavigate } from "react-router-dom";
import sectionlapLogo from "../assets/sectionlap_logo.png";
import { useAppStore } from "../store/useAppStore";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon, GraduationCap, MessageSquare } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "px-4 py-2 rounded-md text-sm bg-accent text-accent-foreground font-semibold"
    : "px-4 py-2 rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors";

export function NavBar() {
  const currentUser = useAppStore((state) => state.currentUser);
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = await ConfirmModal.call({
      title: "Sign Out",
      message: "Are you sure you want to sign out from SectionLap?",
      confirmText: "Sign Out",
      cancelText: "Stay Logged In",
      type: "warning"
    });
    if (confirmed) {
      await logout();
      navigate("/auth");
    }
  };

  if (!currentUser) return null;

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-card border-b border-border shadow-xs">
      <Link to="/">
        <img src={sectionlapLogo} alt="SectionLap" className="h-10 w-auto" />
      </Link>

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
        <NavLink to="/feedback" className={linkClass}>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="size-3.5" />
            Feedback
          </span>
        </NavLink>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile Badge */}
        <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background/50 px-4 py-1.5 text-sm">
          <div className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${
            currentUser.role === "teacher" ? "bg-purple-500" : "bg-indigo-500"
          }`}>
            {currentUser.role === "teacher" ? (
              <GraduationCap className="size-3" />
            ) : (
              <UserIcon className="size-3" />
            )}
          </div>
          <span className="font-semibold text-foreground text-xs">{currentUser.name}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            ({currentUser.role})
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-sm border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 gap-1.5 font-medium transition-all"
          onClick={handleLogout}
        >
          <LogOut className="size-3.5" />
          Sign Out
        </Button>
      </div>
>>>>>>> wansing
    </nav>
  );
}
