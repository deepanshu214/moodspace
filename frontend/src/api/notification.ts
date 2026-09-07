import { apiClient } from './client';
import { NotificationResponse } from './types';

export const notificationApi = {
  async getNotifications(): Promise<NotificationResponse[]> {
    const { data } = await apiClient.get<NotificationResponse[]>('/notification');
    return data;
  },

  async markRead(notificationId: string): Promise<NotificationResponse> {
    const { data } = await apiClient.post<NotificationResponse>(
      `/notification/${notificationId}/read`,
    );
    return data;
  },
};
