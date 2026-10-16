
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./Login/login.css";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await api.resetPassword({
                token,
                password,
            });

            setSuccess(true);
            setMessage("Password reset successfully! You can now log in.");
        } catch (error) {
            setMessage(
                error.message || "Unable to reset password. The link may have expired."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-right" style={{ width: "100%" }}>
                <div className="login-card">
                    <h2>Set New Password</h2>
                    <p>Enter a new password for your FixFlow account.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>New Password</label>
                            <div className="input-box">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <div className="input-box">
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm new password"
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            className="login-button"
                            type="submit"
                            disabled={loading || success}
                        >
                            {loading
                                ? "Resetting..."
                                : success
                                ? "Password Reset"
                                : "Reset Password"}
                        </button>
                    </form>

                    {message && (
                        <p className="login-message">{message}</p>
                    )}

                    {success && (
                        <p className="register-text">
                            <Link to="/">Go to Login</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
