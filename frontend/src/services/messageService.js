/**
 * Service Messagerie & Notifications — DarImmo
 */

import api from "./api";

export const messageService = {
  // ===== Conversations =====
  async getConversations() {
    const { data } = await api.get("/messaging/conversations/");
    return data;
  },

  async contacterVendeur(annonceId, message) {
    const { data } = await api.post("/messaging/conversations/contacter/", {
      annonce: annonceId,
      message,
    });
    return data;
  },

  async getMessages(conversationId) {
    const { data } = await api.get(`/messaging/conversations/${conversationId}/messages/`);
    return data;
  },

  async sendMessage(conversationId, content) {
    const { data } = await api.post(`/messaging/conversations/${conversationId}/envoyer/`, {
      content,
    });
    return data;
  },

  // ===== Notifications =====
  async getNotifications() {
    const { data } = await api.get("/messaging/notifications/");
    return data;
  },

  async markAsRead(notificationId) {
    const { data } = await api.post(`/messaging/notifications/${notificationId}/marquer-lu/`);
    return data;
  },

  async markAllAsRead() {
    const { data } = await api.post("/messaging/notifications/tout-marquer-lu/");
    return data;
  },
};
