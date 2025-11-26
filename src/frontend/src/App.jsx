import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  login,
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  deleteAccount,
} from "./apiClient";
import logoIcon from "./assets/logo_icon_transparent.png";
import SignupPage from "./SignupPage";
import VerifyEmailPage from "./VerifyEmailPage";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(username, password);
      onLogin(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="logo-animation-container">
            <img src={logoIcon} alt="JobTrackAI Icon" className="login-logo" />
          </div>
          <h1 className="login-brand">JobTrack AI</h1>
          <p className="login-tagline">Your AI-powered career companion.</p>
        </div>
        <div className="login-right">
          <div className="login-card">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">
              Please enter your details to sign in.
            </p>
            <form onSubmit={handleSubmit} className="form-grid">
              {error && (
                <div className="status-chip status-rejected" style={{ width: "100%", marginBottom: "10px" }}>
                  {error}
                </div>
              )}
              <div className="field">
                <label className="field-label">Username</label>
                <input
                  className="field-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="field">
                <label className="field-label">Password</label>
                <input
                  className="field-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: "10px", width: "100%" }}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
            <div className="text-center" style={{ marginTop: "20px" }}>
              <p className="text-subtle">
                Don't have an account?{" "}
                <Link to="/signup" style={{ color: "#60a5fa", textDecoration: "none" }}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ token, user, onLogout }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // Form state
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [jobPostingId, setJobPostingId] = useState("");
  const [status, setStatus] = useState("Applied");

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    company: "",
    jobTitle: "",
    jobPostingId: "",
    location: "",
    status: "",
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await getApplications(token);
      setApplications(data);
    } catch (err) {
      console.error("Failed to load apps", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!company || !position) return;
    try {
      const newApp = await createApplication(token, {
        company,
        jobTitle: position,
        jobPostingId,
        location,
        status,
      });
      setApplications([...applications, newApp]);
      setCompany("");
      setPosition("");
      setLocation("");
      setJobPostingId("");
      setStatus("Applied");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteApplication(token, id);
      setApplications(applications.filter((app) => app.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (app) => {
    setEditingId(app.id);
    setEditFormData({
      company: app.company,
      jobTitle: app.job_title,
      jobPostingId: app.job_posting_id || "",
      location: app.location || "",
      status: app.status,
    });
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleSaveClick = async (id) => {
    try {
      const updatedApp = await updateApplication(token, id, editFormData);
      setApplications(
        applications.map((app) => (app.id === id ? updatedApp : app))
      );
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    try {
      await deleteAccount(token);
      onLogout();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-title">
          <img src={logoIcon} alt="Logo" style={{ height: "32px", marginRight: "12px" }} />
          <span className="app-brand-text">JobTrack AI</span>
          <span className="app-header-badge">Job search workspace</span>
        </div>
        <div className="app-header-user" style={{ position: "relative" }}>
          <span>{user?.username}</span>
          <button
            className="btn btn-ghost"
            style={{ padding: "4px 8px", marginLeft: "8px" }}
            onClick={() => setShowMenu(!showMenu)}
          >
            ▼
          </button>

          {showMenu && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "8px",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "4px",
              minWidth: "150px",
              zIndex: 100,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
            }}>
              <button
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "flex-start", borderRadius: "4px" }}
                onClick={onLogout}
              >
                Logout
              </button>
              <button
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "flex-start", borderRadius: "4px", color: "#f87171" }}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="dashboard-grid">
          {/* Left Column: Add Form */}
          <div className="form-card">
            <div className="card-header">
              <div className="card-title">Add Application</div>
            </div>
            <form onSubmit={handleAdd} className="form-grid">
              <div className="field">
                <label className="field-label">Company</label>
                <input
                  className="field-input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                />
              </div>
              <div className="field">
                <label className="field-label">Position</label>
                <input
                  className="field-input"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                />
              </div>
              <div className="field">
                <label className="field-label">Job ID</label>
                <input
                  className="field-input"
                  value={jobPostingId}
                  onChange={(e) => setJobPostingId(e.target.value)}
                  placeholder="e.g. 12345"
                />
              </div>
              <div className="field">
                <label className="field-label">Location</label>
                <input
                  className="field-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote / NYC"
                />
              </div>
              <div className="field">
                <label className="field-label">Status</label>
                <select
                  className="field-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>Applied</option>
                  <option>Online Assessment</option>
                  <option>Interviewing</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                  <option>Accepted</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
                Add Job
              </button>
            </form>
          </div>

          {/* Right Column: List */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">My Applications</div>
              <div className="card-subtitle">{applications.length} total</div>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>ID</th>
                    <th>Job ID</th>
                    <th>Company</th>
                    <th>Position</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ width: "140px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td style={{ color: "#64748b", fontSize: "12px" }}>#{app.id}</td>

                      {editingId === app.id ? (
                        <>
                          <td>
                            <input
                              className="field-input"
                              style={{ padding: "4px 8px", fontSize: "13px", width: "80px" }}
                              name="jobPostingId"
                              value={editFormData.jobPostingId}
                              onChange={handleEditFormChange}
                            />
                          </td>
                          <td>
                            <input
                              className="field-input"
                              style={{ padding: "4px 8px", fontSize: "13px" }}
                              name="company"
                              value={editFormData.company}
                              onChange={handleEditFormChange}
                            />
                          </td>
                          <td>
                            <input
                              className="field-input"
                              style={{ padding: "4px 8px", fontSize: "13px" }}
                              name="jobTitle"
                              value={editFormData.jobTitle}
                              onChange={handleEditFormChange}
                            />
                          </td>
                          <td>
                            <input
                              className="field-input"
                              style={{ padding: "4px 8px", fontSize: "13px" }}
                              name="location"
                              value={editFormData.location}
                              onChange={handleEditFormChange}
                            />
                          </td>
                          <td>
                            <select
                              className="field-select"
                              style={{ padding: "4px 8px", fontSize: "13px", width: "100%" }}
                              name="status"
                              value={editFormData.status}
                              onChange={handleEditFormChange}
                            >
                              <option>Applied</option>
                              <option>Online Assessment</option>
                              <option>Interviewing</option>
                              <option>Offer</option>
                              <option>Rejected</option>
                              <option>Accepted</option>
                            </select>
                          </td>
                          <td style={{ color: "#9ca3af", fontSize: "12px" }}>
                            {new Date(app.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="btn btn-primary"
                                style={{ padding: "4px 8px", fontSize: "11px", background: "#22c55e", borderColor: "#22c55e" }}
                                onClick={() => handleSaveClick(app.id)}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-muted"
                                style={{ padding: "4px 8px", fontSize: "11px" }}
                                onClick={handleCancelClick}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ color: "#94a3b8", fontSize: "13px" }}>{app.job_posting_id || "-"}</td>
                          <td style={{ fontWeight: 500, color: "#e5e7eb" }}>
                            {app.company}
                          </td>
                          <td>{app.job_title}</td>
                          <td style={{ color: "#94a3b8" }}>{app.location || "-"}</td>
                          <td>
                            <span
                              className={`status-chip status-${app.status.toLowerCase().replace(" ", "-")}`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td style={{ color: "#9ca3af", fontSize: "12px" }}>
                            {new Date(app.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="btn btn-primary"
                                style={{ padding: "4px 8px", fontSize: "11px" }}
                                onClick={() => handleEditClick(app)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ padding: "4px 8px", fontSize: "11px" }}
                                onClick={() => handleDelete(app.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {applications.length === 0 && !loading && (
                    <tr>
                      <td colSpan="8" className="text-center" style={{ padding: "30px", color: "#64748b" }}>
                        No applications yet. Start tracking!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
  );

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !token ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/signup"
          element={
            !token ? <SignupPage /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/verify-email"
          element={<VerifyEmailPage />}
        />
        <Route
          path="/dashboard"
          element={
            token ? (
              <DashboardPage token={token} user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
