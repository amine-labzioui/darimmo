/**
 * Service Analytics — DarImmo
 */

import api from "./api";

export const analyticsService = {
  async getMyAnnoncesStats() {
    const { data } = await api.get("/analytics/mes-annonces/");
    return data;
  },

  async getMarketTrends() {
    const { data } = await api.get("/analytics/tendances/");
    return data;
  },

  async logSearch(searchParams, resultsCount) {
    try {
      await api.post("/analytics/log-recherche/", {
        ...searchParams,
        results_count: resultsCount,
      });
    } catch {
      // Silencieux : le tracking ne doit jamais bloquer l'UX
    }
  },

  // ===== Admin =====
  async getAdminStats() {
    const { data } = await api.get("/admin-dashboard/stats/");
    return data;
  },

  async getActivityLog() {
    const { data } = await api.get("/admin-dashboard/activity-log/");
    return data;
  },
};

export const aiService = {
  async sendMessage(message, sessionId) {
    const { data } = await api.post("/ai/chat/", { message, session_id: sessionId });
    return data;
  },

  // Conversations IA de l'utilisateur connecté, avec leurs messages et leurs recommandations.
  async getMyConversations() {
    const { data } = await api.get("/ai/mes-conversations/");
    return data.results || data;
  },

  async getConversationHistory(sessionId) {
    const { data } = await api.get(`/ai/conversations/${sessionId}/`);
    return data;
  },

  async getMarketAdvice(city, propertyType = "") {
    const { data } = await api.get("/ai/conseils-marche/", {
      params: { city, property_type: propertyType },
    });
    return data;
  },

  async trackRecommendationClick(recommendationId) {
    try {
      await api.post(`/ai/recommandations/${recommendationId}/clic/`);
    } catch {
      // Silencieux
    }
  },
};
