export interface Course {
  id: number;
  title: string;
  description: string;
  categoryName?: string;
  instructorName?: string;
  instructorEmail?: string | null;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  type: 'FREE' | 'PAID';
  language: string;
  coverImageUrl: string;
  previewVideoUrl: string;
  price: number;
  createdAt: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
}

export interface ActiveCoursesResponse {
  success: boolean;
  data: Course[];
}

export interface CourseCategory {
  categoryName: string;
}

export interface CourseCategoriesResponse {
  success: boolean;
  data: CourseCategory[];
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  type: 'FREE' | 'PAID';
  language: string;
  coverImageUrl: string;
  previewVideoUrl: string;
  price: number;
  categoryName: string;
  status: 'ACTIVE' | 'DRAFT';
}

export interface CreateCourseResponse {
  success: boolean;
  message: string;
}

export interface UpdateCourseRequest {
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  type: 'FREE' | 'PAID';
  language: string;
  coverImageUrl: string;
  previewVideoUrl: string;
  price: number;
  categoryName: string;
}

export interface CourseModule {
  id: number;
  title: string;
  orderIndex: number;
  summary?: string;
  courseId: number;
}

export interface CourseModulesResponse {
  success: boolean;
  data: CourseModule[];
}

export interface AddCourseModuleRequest {
  title: string;
  courseId: number;
  summary?: string;
}

export interface UpdateCourseModuleRequest {
  title: string;
  courseId: number;
  summary?: string;
}

export interface Lesson {
  id: number;
  title: string;
  moduleId: number | null;
  videoUrl: string;
  textContent: string;
  pdfUrl: string;
  attachmentUrl: string;
  orderIndex: number;
}

export interface LessonsResponse {
  success: boolean;
  data: Lesson[];
}

export interface AddLessonRequest {
  title: string;
  moduleId: number;
  videoUrl: string;
  textContent: string;
  pdfUrl: string;
  attachmentUrl: string;
}

export interface UpdateLessonRequest {
  title: string;
  moduleId: number;
  videoUrl: string;
  textContent: string;
  pdfUrl: string;
  attachmentUrl: string;
}

export interface QuizQuestion {
  questionId?: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface QuizData {
  quizId?: number;
  quizTitle: string;
  courseId: number;
  duration: number | null;
  questions: QuizQuestion[];
  maxAttempts?: number;
  attemptsLimited?: boolean;
}

export interface QuizResponse {
  success: boolean;
  data: QuizData;
}

export interface QuizMutationPayload {
  quizTitle: string;
  courseId: number;
  duration: number | null;
  questions: QuizQuestion[];
  maxAttempts?: number;
  attemptsLimited?: boolean;
}

export interface CourseProgressReportItem {
  studentId: number;
  firstName: string;
  lastName: string;
  email: string;
  totalItems: number;
  itemsCompleted: number;
  completionPercentage: number;
  bestScore: number;
}

export interface CourseProgressReportResponse {
  success: boolean;
  data: CourseProgressReportItem[];
}

export interface InstructorCourseRevenueStat {
  courseId: number;
  title: string;
  price: number;
  enrollmentCount: number;
  totalRevenue: number;
}

export interface InstructorCourseRevenueStatsResponse {
  success: boolean;
  data: {
    courses: InstructorCourseRevenueStat[];
    overallTotalRevenue: number;
  };
}
