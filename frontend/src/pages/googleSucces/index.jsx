import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { dashboardPath, useAuth } from "../../context/AuthContext";

function GoogleSuccess() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      navigate("/");
      return;
    }
    localStorage.setItem("token", token);
    api
      .me()
      .then((data) => {
        login(token, data.user);
        navigate(dashboardPath(data.user.role));
      })
      .catch(() => {
        setMessage("Google sign-in failed. Redirecting...");
        setTimeout(() => navigate("/"), 1200);
      });
  }, [login, navigate]);

  return (
    <div className="page-loading">
      <h2>{message}</h2>
    </div>
  );
}

export default GoogleSuccess;
