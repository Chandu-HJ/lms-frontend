import api from './axiosInstance';
import { type Course, type CourseCategoriesResponse } from '../interfaces/course.types';

export interface StudentProfilePayload {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  email?: string;
  bio?: string;
  interests?: string[];
  interestNames?: string[];
}

export interface StudentProfileResponse {
  success: boolean;
  message?: string;
}

export interface StudentProfile {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  bio: string;
  email: string;
  interestCategoryIds: number[] | null;
  interestNames: string[];
}

export interface StudentProfileInterest {
  id: number;
  categoryName: string;
}

export interface StudentProfileInterestsResponse {
  success: boolean;
  message?: string;
  data: StudentProfileInterest[];
}

export interface EnrolledCourse {
  courseId: number;
  title: string;
  coverImageUrl: string;
  instructorName: string;
  level: string;
  language: string;
  progressPercentage: number;
  enrolledAt: string;
  completed: boolean;
}

export interface StudentCoursesResponse {
  success: boolean;
  data: Course[];
}

interface StudentCourseApiResponse extends Course {
  instructor?: {
    firstName?: string | null;
    lastName?: string | null;
  };
}

export interface StudentEnrollResponse {
  success: boolean;
  message?: string;
}

export interface StudentCourseLesson {
  id: number;
  title: string;
  videoUrl: string | null;
  textContent: string | null;
  pdfUrl: string | null;
  locked: boolean;
  completed: boolean;
}

export interface StudentCourseModule {
  id: number;
  title: string;
  summary: string | null;
  lessons: StudentCourseLesson[];
}

export interface StudentCourseContentData {
  courseId: number;
  title: string;
  progressPercentage: number;
  modules: StudentCourseModule[];
}

export interface StudentCourseContentResponse {
  success: boolean;
  data: StudentCourseContentData;
}

export interface StudentQuizQuestion {
  id: number;
  questionText: string;
  options: string[];
}

export interface StudentCourseQuizData {
  id: number;
  title: string;
  duration: number | null;
  questions: StudentQuizQuestion[];
  attemptsLimited: boolean;
  attemptsLeft: number | null;
}

export interface StudentCourseQuizResponse {
  success: boolean;
  data: StudentCourseQuizData;
}

export interface SubmitStudentQuizPayload {
  quizId: number;
  answers: Record<number, number>;
}

export interface SubmitStudentQuizResponse {
  success: boolean;
  data: {
    score: number;
    percentage: number;
  };
}

const normalizeStudentCourse = (course: StudentCourseApiResponse): Course => {
  const instructorFirstName = course.instructor?.firstName?.trim();
  const instructorLastName = course.instructor?.lastName?.trim();
  const instructorFromObject = [instructorFirstName, instructorLastName].filter(Boolean).join(' ').trim();
  const instructorName = course.instructorName?.trim() || instructorFromObject || undefined;

  return {
    ...course,
    instructorName,
  };
};

const normalizeStudentCoursesResponse = (response: StudentCoursesResponse): StudentCoursesResponse => ({
  ...response,
  data: response.data.map((course) => normalizeStudentCourse(course as StudentCourseApiResponse)),
});

export const getStudentProfileCategories = async (): Promise<CourseCategoriesResponse> => {
  const response = await api.get('/student/profile/categories');
  return response.data;
};

export const getStudentProfile = async (): Promise<StudentProfile> => {
  const response = await api.get('/student/profile');
  return response.data;
};

export const getStudentProfileInterests = async (): Promise<StudentProfileInterestsResponse> => {
  const response = await api.get('/student/profile/interests');
  return response.data;
};

export const putStudentProfile = async (payload: StudentProfilePayload): Promise<StudentProfile> => {
  const response = await api.put('/student/profile', payload);
  return response.data;
};

export const addStudentProfile = async (payload: StudentProfilePayload): Promise<StudentProfileResponse> => {
  const response = await api.post('/student/profile/add', payload);
  return response.data;
};

export const updateStudentProfile = async (payload: StudentProfilePayload): Promise<StudentProfileResponse> => {
  const response = await api.patch('/student/profile/update', payload);
  return response.data;
};

export const getEnrolledCourses = async (): Promise<EnrolledCourse[]> => {
  const response = await api.get('/student/course/enrolled-courses');
  return response.data;
};

export const getInterestedCategoryCourses = async (): Promise<StudentCoursesResponse> => {
  const response = await api.get('/student/course/interested-category');
  return normalizeStudentCoursesResponse(response.data);
};

export const getCoursesByType = async (courseType: 'FREE' | 'PAID'): Promise<StudentCoursesResponse> => {
  const response = await api.get('/student/course/course-type', {
    params: { 'course-type': courseType },
  });
  return normalizeStudentCoursesResponse(response.data);
};

export const getCoursesByCategory = async (categoryName: string): Promise<StudentCoursesResponse> => {
  const response = await api.get('/student/course/category', {
    params: { 'category-name': categoryName },
  });
  return normalizeStudentCoursesResponse(response.data);
};

export const enrollInCourse = async (courseId: number): Promise<StudentEnrollResponse> => {
  const response = await api.post('/student/course/enroll', { courseId });
  return response.data;
};

export const buyStudentCourse = async (courseId: number): Promise<StudentEnrollResponse> => {
  const response = await api.post(`/student/course/${courseId}/buy`);
  return response.data;
};

export const getStudentCourseContent = async (courseId: number): Promise<StudentCourseContentResponse> => {
  const response = await api.get('/student/course/content', {
    params: { 'course-id': courseId },
  });
  return response.data;
};

export const markStudentLessonComplete = async (lessonId: number): Promise<{ success: boolean; message?: string }> => {
  const response = await api.patch('/student/course/lesson/make-complete', null, {
    params: { 'lesson-id': lessonId },
  });
  return response.data;
};

export const getStudentCourseQuiz = async (courseId: number): Promise<StudentCourseQuizResponse> => {
  const response = await api.get(`/student/course/quiz/${courseId}`);
  return response.data;
};

export const submitStudentCourseQuiz = async (payload: SubmitStudentQuizPayload): Promise<SubmitStudentQuizResponse> => {
  const response = await api.post('/student/course/quiz/submit', payload);
  return response.data;
};

export const downloadStudentCertificate = async (courseId: number): Promise<{ data: Blob; contentDisposition?: string }> => {
  const response = await api.get(`/student/certificates/download/${courseId}`, {
    responseType: 'blob',
  });

  return {
    data: response.data as Blob,
    contentDisposition: response.headers['content-disposition'],
  };
};
