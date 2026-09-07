/**
 * Service Authentification — DarImmo
 */

import api, { clearAuthStorage } from "./api";

export const authService = {
  async register(payload) {
    const { data } = await api.post("/users/register/", payload);
    persistSession(data);
    return data;
  },

async login(email, password) {
  console.log("LOGIN START");

  try {
    const response = await api.post("/users/login/", {
      email,
      password,
    });

    console.log("LOGIN SUCCESS", response);

    persistSession(response.data);

    return response.data;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    console.error("RESPONSE:", err.response);
    throw err;
  }
},

  async logout() {
    const refresh = localStorage.getItem("darimmo_refresh_token");
    try {
      if (refresh) await api.post("/users/logout/", { refresh });
    } finally {
      clearAuthStorage();
    }
  },

  async getProfile() {
    const { data } = await api.get("/users/me/");
    localStorage.setItem("darimmo_user", JSON.stringify(data));
    return data;
  },

  async updateProfile(payload) {
    const { data } = await api.patch("/users/me/", payload);
    localStorage.setItem("darimmo_user", JSON.stringify(data));
    return data;
  },

  async changePassword(oldPassword, newPassword) {
    const { data } = await api.post("/users/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return data;
  },

  getCurrentUser() {
    const raw = localStorage.getItem("darimmo_user");
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem("darimmo_access_token"));
  },
};

function persistSession(data) {
  localStorage.setItem("darimmo_access_token", data.access);
  localStorage.setItem("darimmo_refresh_token", data.refresh);
  localStorage.setItem("darimmo_user", JSON.stringify(data.user));
}
