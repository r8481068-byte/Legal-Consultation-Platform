import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ClientFindLawyers from "./ClientFindLawyers";

/**
 * Available Advocates page.
 * Protected: Requires authentication (Client or Admin).
 * Unauthenticated visitors are redirected to /register preserving destination.
 * Advocates are prevented from client booking and redirected to Advocate Dashboard.
 */
export default function Lawyers() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const targetUrl = location.pathname + location.search;
    return <Navigate to={`/register?redirect=${encodeURIComponent(targetUrl)}`} replace />;
  }

  if (user.role === "lawyer") {
    return <Navigate to="/lawyer-dashboard?restricted=booking" replace />;
  }

  return <ClientFindLawyers isPublicLayout={true} />;
}
