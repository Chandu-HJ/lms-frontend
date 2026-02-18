import { Navigate, Route, Routes } from 'react-router-dom';
import { StudentLayout } from '../layouts/StudentLayout';
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { StudentCoursesPage } from '../pages/student/StudentCoursesPage';
import { StudentEnrolledCoursesPage } from '../pages/student/StudentEnrolledCoursesPage';
import { StudentCertificatesPage } from '../pages/student/StudentCertificatesPage';
import { StudentProfileSetupPage } from '../pages/student/StudentProfileSetupPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';

export const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="courses" element={<StudentCoursesPage />} />
        <Route path="enrolled-courses" element={<StudentEnrolledCoursesPage />} />
        <Route path="certificates" element={<StudentCertificatesPage />} />
        <Route path="profile/setup" element={<StudentProfileSetupPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>
    </Routes>
  );
};
