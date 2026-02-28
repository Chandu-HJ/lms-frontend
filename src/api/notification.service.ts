import api from './axiosInstance';
import { type ApiResponse, type NotificationItem } from '../interfaces/notification.types';

export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await api.get<ApiResponse<number>>('/notifications/unread-count');
  return response.data.data ?? 0;
};

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const response = await api.get<ApiResponse<NotificationItem[]>>('/notifications');
  return response.data.data ?? [];
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  await api.patch(`/notifications/${notificationId}/read`);
};
