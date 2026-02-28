export interface NotificationItem {
  id: number;
  message: string;
  eventType: string;
  referenceId: number | null;
  createdAt: string;
  read: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface NotificationSocketPayload {
  id: number;
  message: string;
  eventType: string;
  referenceId: number | null;
}
