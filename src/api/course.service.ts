import api from './axiosInstance';
import {
  type AddCourseModuleRequest,
  type AddLessonRequest,
  type ActiveCoursesResponse,
  type QuizMutationPayload,
  type QuizResponse,
  type CourseModulesResponse,
  type CourseCategoriesResponse,
  type CreateCourseRequest,
  type CreateCourseResponse,
  type LessonsResponse,
  type CourseProgressReportResponse,
  type UpdateCourseRequest,
  type UpdateCourseModuleRequest,
  type UpdateLessonRequest,
  type InstructorCourseRevenueStatsResponse,
} from '../interfaces/course.types';

export const getInstructorCourses = async (status: 'active' | 'draft'): Promise<ActiveCoursesResponse> => {
  const response = await api.get(`/instructor/course/${status}`);
  return response.data;
};

export const getInstructorCourseCategories = async (): Promise<CourseCategoriesResponse> => {
  const response = await api.get('/instructor/course/categories');
  return response.data;
};

export const searchInstructorCourses = async (searchWord: string): Promise<ActiveCoursesResponse> => {
  const response = await api.get('/instructor/course/search-courses', {
    params: { 'search-word': searchWord },
  });
  return response.data;
};

export const getInstructorCoursesByCategory = async (category: string): Promise<ActiveCoursesResponse> => {
  const response = await api.get('/instructor/course/by-categories', {
    params: { category },
  });
  return response.data;
};

export const createInstructorCourse = async (payload: CreateCourseRequest): Promise<CreateCourseResponse> => {
  const response = await api.post('/instructor/course/add', payload);
  return response.data;
};

export const updateInstructorCourse = async (
  courseId: number,
  payload: UpdateCourseRequest,
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.put(`/instructor/course/${courseId}/update`, payload);
  return response.data;
};

export const publishInstructorCourse = async (courseId: number): Promise<{ success: boolean; message?: string }> => {
  const response = await api.patch(`/instructor/course/${courseId}/publish`);
  return response.data;
};

export const getCourseModules = async (courseId: number): Promise<CourseModulesResponse> => {
  const response = await api.get('/instructor/course/module/all', {
    params: { 'course-id': courseId },
  });
  return response.data;
};

export const addCourseModule = async (payload: AddCourseModuleRequest): Promise<{ success: boolean; message?: string }> => {
  const response = await api.post('/instructor/course/module/add', payload);
  return response.data;
};

export const updateCourseModule = async (
  moduleId: number,
  payload: UpdateCourseModuleRequest,
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.put(`/instructor/course/module/${moduleId}/update`, payload);
  return response.data;
};

export const deleteCourseModule = async (moduleId: number): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete('/instructor/course/module/delete', {
    params: { 'module-id': moduleId },
  });
  return response.data;
};

export const addLessonToModule = async (payload: AddLessonRequest): Promise<{ success: boolean; message?: string }> => {
  const response = await api.post('/instructor/module/lesson/add', payload);
  return response.data;
};

export const updateLessonInModule = async (
  lessonId: number,
  payload: UpdateLessonRequest,
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.put(`/instructor/module/lesson/${lessonId}/update`, payload);
  return response.data;
};

export const deleteLessonFromModule = async (lessonId: number): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete('/instructor/module/lesson/delete', {
    params: { 'lesson-id': lessonId },
  });
  return response.data;
};

export const getModuleLessons = async (moduleId: number): Promise<LessonsResponse> => {
  const response = await api.get('/instructor/module/lesson/all', {
    params: { 'module-id': moduleId },
  });
  return response.data;
};

export const getQuizByAi = async (courseId: number, size: number): Promise<QuizResponse> => {
  const response = await api.get(`/instructor/course/quiz/ai-questions/${courseId}`, {
    params: { size },
  });
  return response.data;
};

export const getExistingQuiz = async (courseId: number): Promise<QuizResponse> => {
  const response = await api.get('/instructor/course/quiz', {
    params: { 'course-id': courseId },
  });
  return response.data;
};

export const saveCourseQuiz = async (payload: QuizMutationPayload): Promise<{ success: boolean; message?: string }> => {
  const response = await api.post('/instructor/course/quiz/save-quiz', payload);
  return response.data;
};

export const updateCourseQuiz = async (
  quizId: number,
  payload: QuizMutationPayload,
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.patch('/instructor/course/quiz/update', payload, {
    params: { 'quiz-id': quizId },
  });
  return response.data;
};

export const getCourseProgressReport = async (courseId: number): Promise<CourseProgressReportResponse> => {
  const response = await api.get(`/instructor/course/${courseId}/progress-report`);
  return response.data;
};

export const getInstructorCourseRevenueStats = async (): Promise<InstructorCourseRevenueStatsResponse> => {
  const response = await api.get('/instructor/course/stats/revenue');
  return response.data;
};
