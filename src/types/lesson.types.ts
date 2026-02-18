export interface Lesson {
  title: string;
  moduleId?: number;
  videoUrl?: string;
  textContent?: string;
  pdfUrl?: string;
  attachmentUrl?: string;
  orderIndex: number;
}

export interface LessonCreateRequest {
  title: string;
  moduleId: number;
  videoUrl?: string;
  textContent?: string;
  pdfUrl?: string;
  attachmentUrl?: string;
  orderIndex?: number;
}
