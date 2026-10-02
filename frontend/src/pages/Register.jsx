import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Leaf, User, Mail, Lock, ArrowRight } from "lucide-react";
import { registerUser, loginUser } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Auto-login after successful registration
      try {
        const loginData = await loginUser({
          email: formData.email,
          password: formData.password,
        });
        login(loginData.user, loginData.access, loginData.refresh);
        navigate("/patient");
      } catch {
        navigate("/login");
      }
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          const val = data[firstKey];
          setError(Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val));
        } else {
          setError("Registration failed. Please check your information.");
        }
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Leaf size={28} />
          </div>
          <h1>CREATE ACCOUNT</h1>
          <p>Begin your Panchakarma wellness sanctuary journey</p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#fca5a5",
              fontSize: "0.85rem",
              padding: "12px 14px",
              borderRadius: "10px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                name="username"
                placeholder="e.g. ananya_sharma"
                value={formData.username}
                onChange={handleChange}
                className="input-control"
                style={{ paddingLeft: "42px" }}
                required
              />
              <User
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="input-control"
                style={{ paddingLeft: "42px" }}
                required
              />
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  name="password"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-control"
                  style={{ paddingLeft: "42px" }}
                  required
                />
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-control"
                  style={{ paddingLeft: "42px" }}
                  required
                />
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "0.95rem", marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? (
              "Creating Account..."
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontSize: "0.88rem",
              color: "var(--text-muted)",
            }}
          >
            Already registered with us?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--gold-primary)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign In to Portal
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
