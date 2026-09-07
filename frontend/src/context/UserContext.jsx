/**
 * Contexte Utilisateur — DarImmo
 * Stocke les préférences UI légères propres à la session
 * (ex : filtres de recherche persistés entre les pages).
 */

import { createContext, useCallback, useState } from "react";

export const UserContext = createContext(null);

const DEFAULT_FILTERS = {
  city: "",
  property_type: "",
  transaction_type: "",
  price_min: "",
  price_max: "",
};

export function UserProvider({ children }) {
  const [searchFilters, setSearchFilters] = useState(DEFAULT_FILTERS);

  const updateFilters = useCallback((patch) => {
    setSearchFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchFilters(DEFAULT_FILTERS);
  }, []);

  const value = { searchFilters, updateFilters, resetFilters };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
