import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-mono text-sm text-slate">Chargement…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const fallback =
      user.role === "admin" ? "/admin" : user.role === "formateur" ? "/admin/modules" : "/tableau-de-bord";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
