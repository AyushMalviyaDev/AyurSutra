import { Calendar, Sparkles } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const displayName = user?.first_name || user?.name || user?.username || "Guest";

  return (
    <header className="navbar">
      <div className="navbar-greeting">
        <h2>
          {getGreeting()}, <span style={{ color: "var(--gold-light)" }}>{displayName}</span>
        </h2>
        <div className="navbar-date">
          <Calendar size={13} style={{ color: "var(--gold-primary)" }} />
          <span>{todayFormatted}</span>
          <span style={{ margin: "0 4px", opacity: 0.4 }}>•</span>
          <span style={{ color: "var(--mint-accent)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Sparkles size={12} /> Panchakarma System Active
          </span>
        </div>
      </div>

      <div className="navbar-actions">
        <span className="role-pill">
          {user?.role || "PORTAL"}
        </span>
      </div>
    </header>
  );
};

export default Navbar;