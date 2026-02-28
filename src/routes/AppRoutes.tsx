import { Routes, Route, Navigate } from 'react-router-dom';
import Register from '../pages/Register';
import Login from '../pages/Login';
import CoverPage from '../pages/CoverPage';
import StudentDashboard from '../pages/student/Dashboard';
import StudentCourses from '../pages/student/Courses';
import StudentEnrolledCourses from '../pages/student/EnrolledCourses';
import StudentCourseOverview from '../pages/student/CourseOverview';
import StudentCourseLearning from '../pages/student/CourseLearning';
import StudentCourseQuiz from '../pages/student/CourseQuiz';
import StudentCourseDiscussion from '../pages/student/CourseDiscussion';
import StudentProfileSetup from '../pages/student/ProfileSetup';
import StudentProfileEdit from '../pages/student/ProfileEdit';
import InstructorDashboard from '../pages/instructor/Dashboard';
import MyCourses from '../pages/instructor/MyCourses';
import CreateCourse from '../pages/instructor/CreateCourse';
import CourseModules from '../pages/instructor/CourseModules';
import CourseQuiz from '../pages/instructor/CourseQuiz';
import CourseProgressReport from '../pages/instructor/CourseProgressReport';
import InstructorCourseDiscussion from '../pages/instructor/CourseDiscussion';
import BusinessStats from '../pages/instructor/BusinessStats';
import NotificationsPage from '../pages/shared/NotificationsPage';
import AccountPending from '../pages/shared/AccountPending';
import AdminLayout from '../components/layout/admin/AdminLayout';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminPendingUsers from '../pages/admin/AdminPendingUsers';
import AdminCourses from '../pages/admin/AdminCourses';
import AdminCategories from '../pages/admin/AdminCategories';
import InstructorLayout from '../components/layout/instructor/InstructorLayout';
import StudentLayout from '../components/layout/student/StudentLayout';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CoverPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account/pending" element={<AccountPending />} />
      
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="courses/:courseId/overview" element={<StudentCourseOverview />} />
        <Route path="courses/:courseId/learn" element={<StudentCourseLearning />} />
        <Route path="courses/:courseId/quiz" element={<StudentCourseQuiz />} />
        <Route path="courses/:courseId/discussion" element={<StudentCourseDiscussion />} />
        <Route path="enrolled-courses" element={<StudentEnrolledCourses />} />
        <Route path="profile/setup" element={<StudentProfileSetup />} />
        <Route path="profile/edit" element={<StudentProfileEdit />} />
        <Route path="notifications" element={<NotificationsPage role="STUDENT" />} />
      </Route>
      <Route path="/instructor" element={<InstructorLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<InstructorDashboard />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="courses/:courseId/modules" element={<CourseModules />} />
        <Route path="courses/:courseId/progress-report" element={<CourseProgressReport />} />
        <Route path="courses/:courseId/quiz" element={<CourseQuiz />} />
        <Route path="courses/:courseId/discussion" element={<InstructorCourseDiscussion />} />
        <Route path="create" element={<CreateCourse />} />
        <Route path="business-stats" element={<BusinessStats />} />
        <Route path="notifications" element={<NotificationsPage role="INSTRUCTOR" />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="users" replace />} />
        <Route path="dashboard" element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="pending-users" element={<AdminPendingUsers />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="notifications" element={<NotificationsPage role="ADMIN" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
