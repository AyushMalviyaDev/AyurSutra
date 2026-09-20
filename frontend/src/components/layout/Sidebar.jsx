import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Sidebar = () => {
  const { user } = useAuth();

  const getLinks = () => {
    switch (user?.role) {
      case "PATIENT":
        return [
          ["Dashboard", "/patient"],
          ["My Therapies", "/patient/therapies"],
          ["Schedule", "/patient/schedule"],
          ["Progress", "/patient/progress"],
        ];

      case "VAIDYA":
        return [
          ["Dashboard", "/vaidya"],
          ["Patients", "/vaidya/patients"],
          ["Treatment Plans", "/vaidya/treatments"],
          ["Schedule", "/vaidya/schedule"],
        ];

      case "THERAPIST":
        return [
          ["Dashboard", "/therapist"],
          ["Today's Schedule", "/therapist/schedule"],
          ["Patients", "/therapist/patients"],
          ["Sessions", "/therapist/sessions"],
        ];

      case "ADMIN":
        return [
          ["Dashboard", "/admin"],
          ["Users", "/admin/users"],
          ["Therapies", "/admin/therapies"],
          ["Rooms", "/admin/rooms"],
          ["Schedules", "/admin/schedules"],
        ];

      default:
        return [];
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-icon">A</div>
        <span>AyurSutra</span>
      </div>

      <nav>
        {getLinks().map(([label, path]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;