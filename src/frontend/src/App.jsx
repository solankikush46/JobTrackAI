import React, { useState, useEffect } from "react";
import axios from "axios";
import ApplicationFormModal from "./ApplicationFormModal";
import { createApplication, updateApplication } from "./apiClient";
import "./index.css";

// --- API Helper ---
const API_URL = "http://localhost:4000/api";

const getAuthHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- Components ---

function LoginPage({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegistering) {
        await axios.post(`${API_URL}/auth/register`, { name, email, password });
        // Auto login after register
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        onLogin(res.data.token, res.data.user);
      } else {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        onLogin(res.data.token, res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Brand & Animation */}
        <div className="login-left">
          <div className="logo-animation-container">
            <div className="login-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "100%", height: "100%", color: "#60a5fa" }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          <h1 className="login-brand">JobTrackAI</h1>
          <p className="login-tagline">
            {isRegistering
              ? "Join thousands of job seekers tracking their applications with AI."
              : "Your AI Powered Career Companion."}
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="login-right">
          <div className="login-card">
            <h2 className="login-title">{isRegistering ? "Create Account" : "Welcome Back"}</h2>
            <p className="login-subtitle">
              {isRegistering ? "Enter your details to get started" : "Enter your credentials to access your account"}
            </p>

            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="error-text" style={{ marginBottom: "15px", textAlign: "center" }}>{error}</div>}

              {isRegistering && (
                <div className="field" style={{ marginBottom: "12px" }}>
                  <label className="field-label">Full Name</label>
                  <input
                    className="field-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}

              <div className="field" style={{ marginBottom: "12px" }}>
                <label className="field-label">Email Address</label>
                <input
                  className="field-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="field" style={{ marginBottom: "20px" }}>
                <label className="field-label">Password</label>
                <input
                  className="field-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                {isRegistering ? "Sign Up" : "Sign In"}
              </button>
            </form>

            <div className="text-center">
              <button
                className="btn-link"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerifyEmailPage({ onVerified }) {
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setStatus("error");
        setMessage("No verification token found.");
        return;
      }

      try {
        await axios.post(`${API_URL}/auth/verify-email`, { token });
        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed.");
      }
    };

    verify();
  }, []);

  return (
    <div className="login-page">
      <div className="login-container" style={{ maxWidth: "500px", margin: "0 auto", display: "flex", justifyContent: "center" }}>
        <div className="login-card" style={{ width: "100%", textAlign: "center", padding: "40px" }}>
          <div className="login-logo" style={{ margin: "0 auto 20px", width: "60px", height: "60px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "100%", height: "100%", color: "#60a5fa" }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2 className="login-title" style={{ marginBottom: "10px" }}>
            {status === "verifying" ? "Verifying..." : status === "success" ? "Verified!" : "Verification Failed"}
          </h2>
          <p className="login-subtitle" style={{ marginBottom: "30px" }}>{message}</p>

          {status !== "verifying" && (
            <button
              className="btn btn-primary btn-full"
              onClick={() => {
                window.history.pushState({}, "", "/");
                onVerified();
              }}
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ token, user, onLogout }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // View Details State
  const [selectedApp, setSelectedApp] = useState(null);

  // Derived State: Filtered Applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchApplications();
  }, [token]);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_URL}/applications`, getAuthHeaders(token));
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (appData) => {
    if (editingApp) {
      // Update existing
      const updated = await updateApplication(token, editingApp.id, appData);
      setApplications(applications.map((app) => (app.id === editingApp.id ? updated : app)));
      setEditingApp(null);
    } else {
      // Create new
      const created = await createApplication(token, appData);
      setApplications([created, ...applications]);
    }
    setShowAddModal(false);
  };

  const handleAddClick = () => {
    setEditingApp(null);
    setShowAddModal(true);
  };

  const handleEditClick = (app, e) => {
    e.stopPropagation();
    setEditingApp(app);
    setShowAddModal(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/applications/${id}`, getAuthHeaders(token));
      setApplications(applications.filter((app) => app.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${API_URL}/auth/delete-account`, getAuthHeaders(token));
      onLogout();
    } catch (err) {
      alert("Failed to delete account: " + (err.response?.data?.message || err.message));
    }
  };

  const handleViewDetails = (app) => {
    setSelectedApp(app);
  };

  const closeDetails = () => {
    setSelectedApp(null);
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-title">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "24px", height: "24px", color: "#60a5fa" }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1 className="app-brand-text" style={{ fontSize: "20px", margin: 0 }}>JobTrackAI</h1>
        </div>
        <div className="app-header-user" style={{ position: "relative" }}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span style={{ color: "#94a3b8" }}>{user?.email || "Welcome back"}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {showUserMenu && (
            <div className="user-menu-dropdown">
              <button onClick={onLogout} className="menu-item">
                Sign Out
              </button>
              <button onClick={() => { setShowUserMenu(false); setShowDeleteConfirm(true); }} className="menu-item text-danger">
                Delete Account
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="dashboard-grid">

          {/* Applications Table */}
          <div className="card full-width-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="card-title" style={{ margin: 0 }}>
                Your Applications
              </h2>

              {/* Search and Filter Controls */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleAddClick}
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
                  + Add Application
                </button>
                <input
                  className="field-input"
                  placeholder="Search company or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "200px", fontSize: "13px", padding: "8px 12px" }}
                />
                <select
                  className="field-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ width: "140px", fontSize: "13px", padding: "8px 12px" }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Saved">Saved</option>
                  <option value="Applied">Applied</option>
                  <option value="Online Assessment">Online Assessment</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                  <option value="On hold">On hold</option>
                  <option value="Accepted">Accepted</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                Loading applications...
              </div>
            ) : filteredApplications.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                {applications.length === 0
                  ? "No applications yet. Add one to get started!"
                  : "No applications match your search."}
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>ID</th>
                      <th>Company</th>
                      <th>Position</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ width: "100px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => (
                      <tr key={app.id} onClick={() => handleViewDetails(app)} style={{ cursor: "pointer" }}>
                        <td style={{ color: "#64748b", fontSize: "12px" }}>#{app.id}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {app.logo_url ? (
                              <img
                                src={app.logo_url}
                                alt={`${app.company} logo`}
                                style={{ width: "24px", height: "24px", borderRadius: "4px", objectFit: "cover" }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff" }}>
                                {app.company.substring(0, 1).toUpperCase()}
                              </div>
                            )}
                            <span style={{ fontWeight: "500", color: "#e2e8f0" }}>{app.company}</span>
                          </div>
                        </td>
                        <td>
                          {app.job_title}
                        </td>
                        <td style={{ maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={app.location}>
                          {app.location || "-"}
                        </td>
                        <td>
                          <span className={`status-chip status-${app.status.toLowerCase().replace(' ', '-')}`}>
                            {app.status}
                          </span>
                        </td>
                        <td style={{ color: "#94a3b8", fontSize: "13px" }}>
                          {new Date(app.applied_date).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="action-buttons" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={(e) => handleEditClick(app, e)}
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={(e) => handleDelete(app.id, e)}
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <ApplicationFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        token={token}
        onSubmit={handleModalSubmit}
        initialData={editingApp}
        title={editingApp ? "Edit Application" : "Add New Application"}
      />

      {/* Details Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {selectedApp.logo_url && (
                  <img
                    src={selectedApp.logo_url}
                    alt={`${selectedApp.company} logo`}
                    style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }}
                  />
                )}
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px" }}>{selectedApp.job_title}</h2>
                  <p style={{ margin: 0, color: "#94a3b8" }}>{selectedApp.company} • {selectedApp.location}</p>
                </div>
              </div>
              <button className="close-btn" onClick={closeDetails}>&times;</button>
            </div>
            <div className="modal-body">
              {selectedApp.company_description && (
                <div className="detail-section">
                  <h3>Company Description</h3>
                  <p>{selectedApp.company_description}</p>
                </div>
              )}

              {selectedApp.responsibilities && (
                <div className="detail-section">
                  <h3>Responsibilities</h3>
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{selectedApp.responsibilities}</div>
                </div>
              )}

              {selectedApp.required_qualifications && (
                <div className="detail-section">
                  <h3>Required Qualifications</h3>
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{selectedApp.required_qualifications}</div>
                </div>
              )}

              {selectedApp.preferred_qualifications && (
                <div className="detail-section">
                  <h3>Preferred Qualifications</h3>
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{selectedApp.preferred_qualifications}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDetails}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ color: "#ef4444" }}>Delete Account</h2>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ color: "#e2e8f0", marginBottom: "20px" }}>
                Are you sure you want to delete your account? This action cannot be undone and all your tracked applications will be lost.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)} style={{ marginRight: "10px" }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteAccount}>Delete Account</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #334155;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #f8fafc;
        }
        .modal-body {
          padding: 24px;
        }
        .detail-section {
          margin-bottom: 24px;
        }
        .detail-section h3 {
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 8px;
        }
        .detail-section p,
        .detail-section div {
          color: #e2e8f0;
          line-height: 1.6;
          margin: 0;
        }
        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #334155;
          display: flex;
          justify-content: flex-end;
        }
        .user-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 4px;
          min-width: 160px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 50;
        }
        .menu-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          background: none;
          border: none;
          color: #e2e8f0;
          font-size: 14px;
          cursor: pointer;
          border-radius: 4px;
        }
        .menu-item:hover {
          background: #334155;
        }
        .menu-item.text-danger {
          color: #ef4444;
        }
        .menu-item.text-danger:hover {
          background: rgba(239, 68, 68, 0.1);
        }
        .full-width-card {
          grid-column: 1 / -1;
        }
      `}</style>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return token ? (
    <DashboardPage token={token} user={user} onLogout={handleLogout} />
  ) : window.location.pathname === "/verify-email" ? (
    <VerifyEmailPage onVerified={() => setToken(null)} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

export default App;
