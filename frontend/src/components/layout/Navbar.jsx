import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div>
        <h2>Welcome back, {user?.name}</h2>
        <span className="role-text">{user?.role}</span>
      </div>

      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </header>
  );
};

export default Navbar;