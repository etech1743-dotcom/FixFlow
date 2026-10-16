import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading FixFlow…</div>;
  }
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
