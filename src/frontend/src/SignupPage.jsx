import { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "./apiClient";
import logoIcon from "./assets/logo_icon_transparent.png";

function SignupPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register(username, email, password);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-page">
                <div className="login-container" style={{ maxWidth: "500px" }}>
                    <div className="login-right" style={{ background: "rgba(15, 23, 42, 0.9)" }}>
                        <div className="login-card" style={{ textAlign: "center" }}>
                            <div className="logo-animation-container" style={{ margin: "0 auto 24px" }}>
                                <img src={logoIcon} alt="JobTrackAI Icon" className="login-logo" />
                            </div>
                            <h2 className="login-title">Check Your Email</h2>
                            <p className="login-subtitle">
                                We've sent a verification link to <strong>{email}</strong>. Please check your inbox (and spam folder) to verify your account.
                            </p>
                            <div className="text-center" style={{ marginTop: "20px" }}>
                                <Link to="/login" className="btn btn-primary">
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <div className="logo-animation-container">
                        <img src={logoIcon} alt="JobTrackAI Icon" className="login-logo" />
                    </div>
                    <h1 className="login-brand">JobTrack AI</h1>
                    <p className="login-tagline">Join your AI-powered career companion.</p>
                </div>
                <div className="login-right">
                    <div className="login-card">
                        <h2 className="login-title">Create Account</h2>
                        <p className="login-subtitle">
                            Enter your details to get started.
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
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>
                            <div className="field">
                                <label className="field-label">Email</label>
                                <input
                                    className="field-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
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
                                    placeholder="Create a password"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ marginTop: "10px", width: "100%" }}
                                disabled={loading}
                            >
                                {loading ? "Creating Account..." : "Sign Up"}
                            </button>
                        </form>
                        <div className="text-center" style={{ marginTop: "20px" }}>
                            <p className="text-subtle">
                                Already have an account?{" "}
                                <Link to="/login" style={{ color: "#60a5fa", textDecoration: "none" }}>
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
