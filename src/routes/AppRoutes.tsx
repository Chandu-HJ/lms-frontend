import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { CoverPage } from '../pages/auth/CoverPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { InstructorRoutes } from './InstructorRoutes';
import { StudentRoutes } from './StudentRoutes';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<CoverPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Student protected routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route path="/student/*" element={<StudentRoutes />} />
      </Route>

      {/* Instructor protected routes */}
      <Route element={<ProtectedRoute allowedRoles={['INSTRUCTOR']} />}>
        {/* Render InstructorRoutes as element with wildcard for nested routes */}
        <Route path="/instructor/*" element={<InstructorRoutes />} />
      </Route>

      {/* Admin protected routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
