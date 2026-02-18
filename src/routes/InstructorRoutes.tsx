import { Routes, Route, Navigate } from 'react-router-dom';
import { InstructorLayout } from '../layouts/InstructorLayout';
import { CourseDetailPage } from '../pages/instructor/CourseDetailPage';
import { CreateCoursePage } from '../pages/instructor/CreateCoursePage';
import { InstructorCoursesPage } from '../pages/instructor/InstructorCoursesPage';
import { InstructorDashboardPage } from '../pages/instructor/InstructorDashboardPage';

export const InstructorRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<InstructorLayout />}>
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Nested instructor pages */}
        <Route path="dashboard" element={<InstructorDashboardPage />} />
        <Route path="courses" element={<InstructorCoursesPage />} />
        <Route path="course/create" element={<CreateCoursePage />} />
        <Route path="course/:courseId" element={<CourseDetailPage />} />
      </Route>
    </Routes>
  );
};
