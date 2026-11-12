import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowedRole, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const target = location.pathname + location.search;
    return (
      <Navigate
        to={`/register?redirect=${encodeURIComponent(target)}`}
        replace
      />
    );
  }

  if (user.role !== allowedRole) {
    if (user.role === "lawyer") {
      return <Navigate to="/lawyer-dashboard?restricted=booking" replace />;
    }
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
