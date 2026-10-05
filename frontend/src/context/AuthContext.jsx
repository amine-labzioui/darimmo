/**
 * Contexte Authentification — DarImmo
 */

import { createContext, useCallback, useEffect, useState } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (err) {
          // Panne du serveur (pas de réponse) : on garde la session locale.
          if (err.response?.status === 401) setUser(null);
        }
      }
      setLoading(false);
    }
    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAgence: user?.role === "agence",
    isClient: user?.role === "client",
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
