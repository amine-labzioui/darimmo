/**
 * Service Tableau de bord Client — DarImmo
 */

import api from "./api";

export const clientService = {
  
  async getSummary() {
    const { data } = await api.get("/client-dashboard/summary/");
    return data;
  },

  async getProfile() {
    const { data } = await api.get("/client-dashboard/profile/");
    return data;
  },

  async updateProfile(payload) {
    const { data } = await api.put("/client-dashboard/profile/", payload);
    return data;
  },

  // ===== Favoris =====
  async getFavorites() {
    const { data } = await api.get("/users/favorites/");
    return data;
  },

  async addFavorite(annonceId) {
    const { data } = await api.post("/users/favorites/", { annonce: annonceId });
    return data;
  },

  async removeFavorite(favoriteId) {
    await api.delete(`/users/favorites/${favoriteId}/`);
  },

  // ===== Demandes de visite =====
  async getVisitRequests() {
  const { data } = await api.get(
    "/client-dashboard/visit-requests/?role=client"
  );
  return data;
},

  async createVisitRequest(payload) {
    const { data } = await api.post("/client-dashboard/visit-requests/", payload);
    return data;
  },

  async getVisitRequests() {
    const { data } = await api.get(
    "/client-dashboard/visit-requests/?role=client"
    );

  console.log(data);

  return data;
  },


  // ===== Recherches sauvegardées =====
  async getSavedSearches() {
    const { data } = await api.get("/client-dashboard/saved-searches/");
    return data;
  },

  async createSavedSearch(payload) {
    const { data } = await api.post("/client-dashboard/saved-searches/", payload);
    return data;
  },

  async deleteSavedSearch(id) {
    await api.delete(`/client-dashboard/saved-searches/${id}/`);
  },
};

 