import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { login as apiLogin } from "./apiClient";
import ApplicationsTable from "./ApplicationsTable";
import AddApplicationForm from "./AddApplicationForm";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">JobTrack AI</h2>
        <p className="login-subtitle">
          Track applications, follow ups and outcomes in one place.
        </p>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <span className="field-label">Username</span>
            <input
              className="field-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="field">
            <span className="field-label">Password</span>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardPage({ user, token, onLogout }) {
  const [reloadFlag, setReloadFlag] = useState(0);

  const handleAdded = () => {
    setReloadFlag((f) => f + 1);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-title">
          <span style={{ fontWeight: 600 }}>JobTrack AI</span>
          <span className="app-header-badge">Job search workspace</span>
        </div>
        <div className="app-header-user">
          <span className="text-subtle">Signed in as</span>
          <span>{user.username}</span>
          <button className="btn btn-ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="dashboard-grid">
          <section>
            <AddApplicationForm token={token} onCreated={handleAdded} />
          </section>
          <section>
            <ApplicationsTable token={token} reloadFlag={reloadFlag} />
          </section>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("jobtrack_auth_v1");
    if (!stored) {
      return { user: null, token: null };
    }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object") {
        return { user: null, token: null };
      }
      return {
        user: parsed.user || null,
        token: parsed.token || null,
      };
    } catch {
      return { user: null, token: null };
    }
  });

  const handleLogin = async (username, password) => {
    const data = await apiLogin(username, password);
    const newAuth = {
      user: data.user,
      token: data.token,
    };
    setAuth(newAuth);
    localStorage.setItem("jobtrack_auth_v1", JSON.stringify(newAuth));
  };

  const handleLogout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("jobtrack_auth_v1");
  };

  const isLoggedIn = !!auth.token && !!auth.user;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <DashboardPage
                user={auth.user}
                token={auth.token}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
