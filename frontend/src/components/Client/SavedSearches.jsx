import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Trash2, Bell } from "lucide-react";
import { clientService } from "../../services/clientService";
import { useNotification } from "../../hooks/useNotification";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";

export default function SavedSearches() {
  const { pushToast } = useNotification();
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientService
      .getSavedSearches()
      .then((data) => setSearches(data.results || data))
      .catch(() => setSearches([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    try {
      await clientService.deleteSavedSearch(id);
      setSearches((prev) => prev.filter((s) => s.id !== id));
      pushToast({ type: "success", title: "Recherche supprimée" });
    } catch {
      pushToast({ type: "error", title: "Une erreur est survenue" });
    }
  }

  function buildSearchUrl(s) {
    const params = new URLSearchParams();
    if (s.city) params.set("city", s.city);
    if (s.property_type) params.set("property_type", s.property_type);
    if (s.transaction_type) params.set("transaction_type", s.transaction_type);
    if (s.price_min) params.set("price_min", s.price_min);
    if (s.price_max) params.set("price_max", s.price_max);
    return `/recherche?${params.toString()}`;
  }

  if (loading) return <LoadingSpinner fullPage label="Chargement de vos recherches…" />;

  if (searches.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="Aucune recherche sauvegardée"
        description="Sauvegardez vos critères de recherche pour être alerté des nouveaux biens correspondants."
      />
    );
  }

  return (
    <div>
      <h1
        className="text-2xl text-[#1C2520] mb-7"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        Mes recherches sauvegardées
      </h1>

      <div className="space-y-3">
        {searches.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-[#E6DFD0] p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Link to={buildSearchUrl(s)} className="text-[14.5px] font-medium text-[#1C2520] hover:text-[#047857]">
                {s.name}
              </Link>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {s.city && <Tag>{s.city}</Tag>}
                {s.property_type && <Tag>{s.property_type}</Tag>}
                {(s.price_min || s.price_max) && (
                  <Tag>{s.price_min || 0} – {s.price_max || "∞"} MAD</Tag>
                )}
                {s.notify_by_email && (
                  <span className="flex items-center gap-1 text-[12px] text-[#047857]">
                    <Bell size={12} /> Alertes activées
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[#8C9189] hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-[#F0EAD8] text-[#3F4A43] text-[12px]">
      {children}
    </span>
  );
}
