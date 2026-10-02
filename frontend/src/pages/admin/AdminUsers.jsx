import { useEffect, useState, useCallback } from "react";
import { ShieldCheck, Users, Mail, User } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getUsers } from "../../services/authService";

const ROLES = [
  { key: "", label: "All Users" },
  { key: "PATIENT", label: "Patients" },
  { key: "VAIDYA", label: "Vaidyas" },
  { key: "THERAPIST", label: "Therapists" },
  { key: "ADMIN", label: "Administrators" },
];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(roleFilter);
      setUsers(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <DashboardLayout>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div className="page-eyebrow">
            <ShieldCheck size={13} />
            <span>STAFF & PATIENT DIRECTORY</span>
          </div>
          <h1>System Users & Staff</h1>
          <p>Directory of registered Patients, Vaidyas, Therapists, and System Administrators.</p>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="tab-nav">
        {ROLES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRoleFilter(key)}
            className={`tab-btn ${roleFilter === key ? "active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Users Table Card */}
      <div className="card">
        {loading ? (
          <div className="empty-state">
            <Users size={36} className="empty-state-icon" />
            <h4>Loading User Directory...</h4>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <User size={36} className="empty-state-icon" />
            <h4>No Users Found</h4>
            <p>No accounts match the selected role filter.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>System Role</th>
                  <th>Account ID</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const initial = (u.username || "U").charAt(0).toUpperCase();
                  const fullName =
                    u.first_name || u.last_name
                      ? `${u.first_name} ${u.last_name}`
                      : u.username;

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              background: "rgba(212, 175, 55, 0.15)",
                              border: "1px solid rgba(212, 175, 55, 0.3)",
                              color: "var(--gold-light)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontFamily: "var(--font-serif)",
                            }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-heading)" }}>
                              {fullName}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-body)" }}>
                          <Mail size={13} style={{ color: "var(--text-muted)" }} />
                          {u.email}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            u.role === "ADMIN"
                              ? "scheduled"
                              : u.role === "VAIDYA"
                              ? "in_progress"
                              : u.role === "THERAPIST"
                              ? "completed"
                              : "completed"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                        #{u.id}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
