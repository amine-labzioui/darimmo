/**
 * Hook useNotification — DarImmo
 */

import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext.jsx";

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification doit être utilisé à l'intérieur d'un <NotificationProvider>"
    );
  }
  return context;
}
