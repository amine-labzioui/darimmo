/**
 * Service Annonces — DarImmo
 */

import api from "./api";
import { buildQueryString } from "../utils/helpers";

export const annonceService = {
  async list(filters = {}) {
    const qs = buildQueryString(filters);
    const { data } = await api.get(`/annonces/${qs ? `?${qs}` : ""}`);
    return data; // { count, next, previous, results }
  },

  async getById(id) {
    const { data } = await api.get(`/annonces/${id}/`);
    return data;
  },

  async create(formData) {
    const { data } = await api.post("/annonces/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async update(id, formData) {
    const { data } = await api.patch(`/annonces/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async remove(id) {
    await api.delete(`/annonces/${id}/`);
  },

  async mesAnnonces(params = {}) {
    const qs = buildQueryString(params);
    const { data } = await api.get(`/annonces/mes_annonces/${qs ? `?${qs}` : ""}`);
    return data;
  },

  async publier(id) {
    const { data } = await api.post(`/annonces/${id}/publier/`);
    return data;
  },

  async marquerVendue(id) {
    const { data } = await api.post(`/annonces/${id}/marquer_vendue/`);
    return data;
  },

  async ajouterPhotos(id, files) {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const { data } = await api.post(`/annonces/${id}/ajouter_photos/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
