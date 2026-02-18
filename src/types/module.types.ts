export interface Module {
  id: number;
  title: string;
  orderIndex: number;
  courseId: number;
}

export interface ModuleCreateRequest {
  title: string;
  courseId: number;
  orderIdx?: number;
}
