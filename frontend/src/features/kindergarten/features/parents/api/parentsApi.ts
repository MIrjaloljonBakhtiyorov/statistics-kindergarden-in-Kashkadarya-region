import { apiClient } from '@/shared/api';
import { ParentPortalUser, ChatMessage, ChatContact } from '../types/parentPortal.types';

export const parentsApi = {
  getAll: async (): Promise<ParentPortalUser[]> => {
    const res = await apiClient.get('/parents');
    return res.data;
  },
  update: async (id: string, data: any): Promise<void> => {
    await apiClient.put(`/parents/${id}`, data);
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/parents/${id}`);
  },
  
  // Messaging API
  getMessages: async (
    userId: string,
    contactId: string,
    options: { userRole?: string; contactRole?: string } = {}
  ): Promise<ChatMessage[]> => {
    const params = new URLSearchParams({
      userId,
      contactId,
    });
    if (options.userRole) params.set('userRole', options.userRole);
    if (options.contactRole) params.set('contactRole', options.contactRole);
    const res = await apiClient.get(`/messages?${params.toString()}`);
    return res.data;
  },
  
  sendMessage: async (data: {
    senderId: string;
    receiverId: string;
    text: string;
    senderRole: string;
    messageType?: 'text' | 'image' | 'video' | 'audio' | 'file';
    fileUrl?: string | null;
    fileName?: string | null;
    mimeType?: string | null;
  }): Promise<ChatMessage> => {
    const res = await apiClient.post('/messages', data);
    return res.data;
  },

  editMessage: async (
    id: string | number,
    data: { userId: string; userRole: string; text: string }
  ): Promise<ChatMessage> => {
    const res = await apiClient.put(`/messages/${id}`, data);
    return res.data;
  },

  deleteMessage: async (
    id: string | number,
    data: { userId: string; userRole: string }
  ): Promise<ChatMessage> => {
    const res = await apiClient.delete(`/messages/${id}`, { data });
    return res.data;
  },
  
  getContacts: async (parentId: string, childId?: string): Promise<ChatContact[]> => {
    const params = new URLSearchParams({ parentId });
    if (childId) params.set('childId', childId);
    const res = await apiClient.get(`/messages/contacts?${params.toString()}`);
    return res.data;
  },
  
  markAsRead: async (
    userId: string,
    contactId: string,
    options: { userRole?: string; contactRole?: string } = {}
  ): Promise<void> => {
    await apiClient.put('/messages/read', { userId, contactId, ...options });
  },
  
  sendBroadcast: async (data: { senderId: string, receiverIds: string[], text: string, senderRole: string }): Promise<void> => {
    await apiClient.post('/messages/broadcast', data);
  }
};

