import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Sparkles,
  CalendarPlus,
  CalendarCheck,
  CalendarClock,
  Clock,
  Users,
  Stethoscope,
  Activity,
  DoorOpen,
  ClipboardList,
  ShieldCheck,
  LogOut,
  Leaf,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getLinks = () => {
    switch (user?.role) {
      case "PATIENT":
        return [
          { label: "Dashboard", path: "/patient", icon: LayoutDashboard },
          { label: "My Profile", path: "/patient/profile", icon: User },
          { label: "My Therapies", path: "/patient/therapies", icon: Sparkles },
          { label: "Schedule Session", path: "/patient/schedule", icon: CalendarPlus },
          { label: "My Sessions", path: "/patient/sessions", icon: Clock },
        ];

      case "VAIDYA":
        return [
          { label: "Dashboard", path: "/vaidya", icon: LayoutDashboard },
          { label: "Patients", path: "/vaidya/patients", icon: Users },
          { label: "Treatment Plans", path: "/vaidya/treatments", icon: Sparkles },
          { label: "Consultations", path: "/vaidya/consultations", icon: Stethoscope },
        ];

      case "THERAPIST":
        return [
          { label: "Dashboard", path: "/therapist", icon: LayoutDashboard },
          { label: "Today's Schedule", path: "/therapist/schedule", icon: CalendarCheck },
          { label: "Suite Console", path: "/therapist/suite", icon: DoorOpen },
          { label: "Sessions", path: "/therapist/sessions", icon: Clock },
          { label: "Progress Logs", path: "/therapist/progress", icon: Activity },
        ];

      case "ADMIN":
        return [
          { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
          { label: "Rooms", path: "/admin/rooms", icon: DoorOpen },
          { label: "Availability", path: "/admin/availability", icon: CalendarClock },
          { label: "Schedules", path: "/admin/schedules", icon: ClipboardList },
          { label: "Users & Staff", path: "/admin/users", icon: ShieldCheck },
        ];

      default:
        return [];
    }
  };

  const displayName = user?.name || user?.username || "Practitioner";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-badge">
          <Leaf size={22} />
        </div>
        <div className="brand-info">
          <span className="brand-title">AYURSUTRA</span>
          <span className="brand-subtitle">Panchakarma Sanctuary</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {getLinks().map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/patient" || path === "/vaidya" || path === "/therapist" || path === "/admin"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} className="link-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-snippet">
          <div className="user-avatar-sm">{userInitial}</div>
          <div className="user-meta">
            <span className="user-name-text">{displayName}</span>
            <span className="role-badge-sm">{user?.role}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn-sidebar-logout"
          title="Sign out of AyurSutra"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;