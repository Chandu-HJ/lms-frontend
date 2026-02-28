import { createBrowserRouter, Navigate } from 'react-router-dom';
// import Login from '../pages/Login';
import Register from "../pages/Register"
// import StudentDashboard from '../pages/student/Dashboard';
// import InstructorDashboard from '../pages/instructor/Dashboard';
// import AdminPanel from '../pages/admin/AdminPanel';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
//   {
//     path: '/login',
//     element: <Login />,
//   },
  {
    path: '/register',
    element: <Register />,
  },
  // Student Routes
//   {
//     path: '/student',
//     element: <ProtectedRoute allowedRoles={['STUDENT']} />,
//     children: [
//       { path: 'dashboard', element: <StudentDashboard /> },
//     ],
//   },
  // Instructor Routes
//   {
//     path: '/instructor',
//     element: <ProtectedRoute allowedRoles={['INSTRUCTOR']} />,
//     children: [
//       { path: 'dashboard', element: <InstructorDashboard /> },
//     ],
//   },
  // Admin Routes
//   {
//     path: '/admin',
//     element: <ProtectedRoute allowedRoles={['ADMIN']} />,
//     children: [
//       { path: 'panel', element: <AdminPanel /> },
//     ],
//   }
]);
