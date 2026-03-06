import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;

