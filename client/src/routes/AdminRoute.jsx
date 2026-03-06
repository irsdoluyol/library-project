import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;

