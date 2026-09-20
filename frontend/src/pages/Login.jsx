import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    setLoading(true);

    try {
      const data = await loginUser(formData);

      login(
        data.user,
        data.access,
        data.refresh
      );

      switch (data.user.role) {
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

    } catch (error) {
      if (error.response?.data) {
        const responseData = error.response.data;

        if (responseData.non_field_errors) {
          setError(responseData.non_field_errors[0]);
        } else if (responseData.detail) {
          setError(responseData.detail);
        } else {
          setError("Invalid email or password.");
        }
      } else {
        setError("Unable to connect to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <form onSubmit={handleSubmit}>

        <h1>AyurSutra</h1>

        <p>Sign in to your account</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

      </form>

    </div>
  );
};

export default Login;