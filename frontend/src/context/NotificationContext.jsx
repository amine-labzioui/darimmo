/**
 * Contexte Notifications — DarImmo
 * Gère les notifications système (visites, messages, annonces...)
 * + les toasts éphémères affichés en haut de l'écran.
 */

import { createContext, useCallback, useEffect, useState } from "react";
import { messageService } from "../services/messageService";
import { authService } from "../services/authService";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const refresh = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    try {
      const data = await messageService.getNotifications();
      setNotifications(data.results || data);
    } catch {
      /* silencieux */
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000); // poll léger toutes les 60s
    return () => clearInterval(interval);
  }, [refresh]);

  const markAsRead = useCallback(async (id) => {
    await messageService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    await messageService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const pushToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4000);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const value = {
    notifications,
    unreadCount,
    refresh,
    markAsRead,
    markAllAsRead,
    toasts,
    pushToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
