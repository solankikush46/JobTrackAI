import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { verifyEmail } from "./apiClient";
import logoIcon from "./assets/logo_icon_transparent.png";

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link.");
            return;
        }

        verifyEmail(token)
            .then(() => {
                setStatus("success");
            })
            .catch((err) => {
                setStatus("error");
                setMessage(err.message);
            });
    }, [token]);

    return (
        <div className="login-page">
            <div className="login-container" style={{ maxWidth: "500px" }}>
                <div className="login-right" style={{ background: "rgba(15, 23, 42, 0.9)" }}>
                    <div className="login-card" style={{ textAlign: "center" }}>
                        <div className="logo-animation-container" style={{ margin: "0 auto 24px" }}>
                            <img src={logoIcon} alt="JobTrackAI Icon" className="login-logo" />
                        </div>

                        {status === "verifying" && (
                            <>
                                <h2 className="login-title">Verifying...</h2>
                                <p className="login-subtitle">Please wait while we verify your email.</p>
                            </>
                        )}

                        {status === "success" && (
                            <>
                                <h2 className="login-title" style={{ color: "#4ade80" }}>Verified!</h2>
                                <p className="login-subtitle">
                                    Your email has been verified successfully. You can now log in.
                                </p>
                                <Link to="/login" className="btn btn-primary" style={{ marginTop: "20px" }}>
                                    Go to Login
                                </Link>
                            </>
                        )}

                        {status === "error" && (
                            <>
                                <h2 className="login-title" style={{ color: "#f87171" }}>Verification Failed</h2>
                                <p className="login-subtitle">{message}</p>
                                <Link to="/signup" className="btn btn-ghost" style={{ marginTop: "20px" }}>
                                    Back to Signup
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmailPage;
