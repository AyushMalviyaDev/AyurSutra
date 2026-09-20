import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const demoUsers = {
  patient: {
    id: 1,
    name: "Rahul Sharma",
    email: "patient@ayursutra.com",
    role: "PATIENT",
  },

  vaidya: {
    id: 2,
    name: "Dr. Anjali Sharma",
    email: "vaidya@ayursutra.com",
    role: "VAIDYA",
  },

  therapist: {
    id: 3,
    name: "Rajesh Kumar",
    email: "therapist@ayursutra.com",
    role: "THERAPIST",
  },

  admin: {
    id: 4,
    name: "AyurSutra Admin",
    email: "admin@ayursutra.com",
    role: "ADMIN",
  },
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const user = Object.values(demoUsers).find(
      (user) => user.email === email
    );

    if (!user || password !== "123456") {
      alert("Demo login failed. Use one of the demo emails and password: 123456");
      return;
    }

    login(user);

    switch (user.role) {
      case "PATIENT":
        navigate("/patient");
        break;

      case "VAIDYA":
        navigate("/vaidya");
        break;

      case "THERAPIST":
        navigate("/therapist");
        break;

      case "ADMIN":
        navigate("/admin");
        break;

      default:
        navigate("/");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">A</div>
          <h1>AyurSutra</h1>
        </div>

        <p className="login-subtitle">
          Panchakarma Patient Management System
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <div className="demo-login">
          <p>Demo password: <strong>123456</strong></p>

          <div className="demo-users">
            <small>Patient: patient@ayursutra.com</small>
            <small>Vaidya: vaidya@ayursutra.com</small>
            <small>Therapist: therapist@ayursutra.com</small>
            <small>Admin: admin@ayursutra.com</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;