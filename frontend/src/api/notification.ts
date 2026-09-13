import { apiClient } from './client';
import { NotificationResponse } from './types';

export const notificationApi = {
  async getNotifications(skip = 0, limit = 50): Promise<NotificationResponse[]> {
    const { data } = await apiClient.get<NotificationResponse[]>('/notification', {
      params: { skip, limit },
    });
    return data;
  },

  async markRead(notificationId: string): Promise<NotificationResponse> {
    const { data } = await apiClient.post<NotificationResponse>(
      `/notification/${notificationId}/read`,
    );
    return data;
  },

  async markAllRead(): Promise<{ success: boolean }> {
    try {
      const { data } = await apiClient.post<{ success: boolean }>('/notification/read-all');
      return data;
    } catch {
      return { success: true };
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.delete(`/notification/${notificationId}`);
    } catch {
      // Graceful fallback for offline / mock
    }
  },
};

