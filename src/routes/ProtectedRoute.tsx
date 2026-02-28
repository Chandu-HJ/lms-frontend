import { Navigate, Outlet } from 'react-router-dom';
import {type UserRole } from "../interfaces/auth.types"

interface Props {
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  // Logic to get user from your Global State (Zustand/Redux/Context)
  const user = { role: 'INSTRUCTOR', isAuthenticated: true }; // Dummy for now

  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />; // Renders the child route
};

export default ProtectedRoute;