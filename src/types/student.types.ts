import type { Course, CourseType } from './course.types';

export interface EnrolledCourseSummary {
  courseId: number;
  title: string;
  coverImageUrl?: string;
  instructorName: string;
  level: Course['level'];
  language: string;
  progressPercentage: number;
  enrolledAt: string;
  completed: boolean;
}

export interface CourseTypeFilterOption {
  label: string;
  value: 'all' | CourseType;
}
