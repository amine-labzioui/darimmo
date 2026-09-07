/**
 * Hook useFetch — DarImmo
 * Gère le cycle data/loading/error pour un appel asynchrone,
 * avec re-fetch automatique quand les dépendances changent.
 */

import { useCallback, useEffect, useState } from "react";

export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}
