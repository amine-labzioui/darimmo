import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Star, Archive, RotateCcw } from "lucide-react";
import api from "../../services/api";
import { annonceService } from "../../services/annonceService";
import { useNotification } from "../../hooks/useNotification";
import { formatPriceWithCurrency } from "../../utils/formatters";
import { classNames } from "../../utils/helpers";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";

const TABS = [
  { value: "pending", label: "En attente" },
  { value: "published", label: "Publiées" },
  { value: "sold", label: "Vendues" },
  { value: "rented", label: "Louées" },
  { value: "archived", label: "Archivées" },
];

export default function AnnonceModeration() {
  const { pushToast } = useNotification();
  const [activeTab, setActiveTab] = useState("pending");
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadAnnonces(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function loadAnnonces(status) {
    setLoading(true);
    setLoadError(false);
    try {
      const { data } = await api.get("/admin-dashboard/annonces/", { params: { status } });
      setAnnonces(data.results || data);
    } catch {
      setAnnonces([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      await api.post(`/admin-dashboard/annonces/${id}/approuver/`);
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
      pushToast({ type: "success", title: "Annonce approuvée et publiée" });
    } catch {
      pushToast({ type: "error", title: "Une erreur est survenue" });
    }
  }

  async function handleReject(id) {
    const reason = prompt("Motif du rejet (optionnel) :") || "";
    try {
      await api.post(`/admin-dashboard/annonces/${id}/rejeter/`, { reason });
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
      pushToast({ type: "success", title: "Annonce rejetée" });
    } catch {
      pushToast({ type: "error", title: "Une erreur est survenue" });
    }
  }

  // Modération : l'annonce archivée quitte la recherche publique.
  async function handleArchive(id) {
    if (!confirm("Archiver cette annonce ? Elle ne sera plus visible dans la recherche.")) return;
    try {
      await annonceService.archiver(id);
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
      pushToast({ type: "success", title: "Annonce archivée" });
    } catch {
      pushToast({ type: "error", title: "Une erreur est survenue" });
    }
  }

  async function handleRepublish(id) {
    try {
      await annonceService.publier(id);
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
      pushToast({ type: "success", title: "Annonce republiée" });
    } catch {
      pushToast({ type: "error", title: "Une erreur est survenue" });
    }
  }

  async function handleToggleFeatured(id) {
    try {
      const { data } = await api.post(`/admin-dashboard/annonces/${id}/mettre_en_avant/`);
      setAnnonces((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_featured: data.is_featured } : a))
      );
    } catch {
      pushToast({ type: "error", title: "Une erreur est survenue" });
    }
  }

  return (
    <div>
      <h1
        className="text-2xl text-[#1C2520] mb-1"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        Modération des annonces
      </h1>
      <p className="text-[#5C6961] text-sm mb-6">Validez ou rejetez les annonces publiées par les agences.</p>

      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-[#E6DFD0] p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={classNames(
              "px-4 py-2 rounded-lg text-[13.5px] font-medium transition-colors",
              activeTab === tab.value ? "bg-[#047857] text-white" : "text-[#5C6961] hover:bg-[#F5F0E8]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Chargement…" />
      ) : loadError ? (
        <EmptyState
          title="Chargement impossible"
          description="Les données n'ont pas pu être chargées. Vérifiez que le serveur est démarré, puis rechargez la page."
        />
      ) : annonces.length === 0 ? (
        <EmptyState title="Aucune annonce" description="Aucune annonce dans cette catégorie pour le moment." />
      ) : (
        <div className="space-y-3">
          {annonces.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-[#E6DFD0] p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[14.5px] font-medium text-[#1C2520] truncate">{a.title}</p>
                <p className="text-[13px] text-[#5C6961] mt-0.5">
                  {a.city} · {formatPriceWithCurrency(a.price, a.transaction_type)} · {a.owner_email}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleFeatured(a.id)}
                  className={classNames(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                    a.is_featured ? "bg-amber-100 text-amber-600" : "text-[#8C9189] hover:bg-[#F5F0E8]"
                  )}
                  title="Mettre en avant"
                >
                  <Star size={16} className={a.is_featured ? "fill-amber-500" : ""} />
                </button>
                {activeTab === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(a.id)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-[#047857] hover:bg-[#ECFDF5] transition-colors"
                      title="Approuver"
                    >
                      <CheckCircle2 size={17} />
                    </button>
                    <button
                      onClick={() => handleReject(a.id)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
                      title="Rejeter"
                    >
                      <XCircle size={17} />
                    </button>
                  </>
                )}
                {activeTab === "published" && (
                  <button
                    onClick={() => handleArchive(a.id)}
                    className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium text-[#5C6961] border border-[#E6DFD0] hover:bg-[#F5F0E8] transition-colors"
                  >
                    <Archive size={15} /> Archiver
                  </button>
                )}
                {activeTab === "archived" && (
                  <button
                    onClick={() => handleRepublish(a.id)}
                    className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium text-[#047857] bg-[#ECFDF5] hover:bg-[#d1fae5] transition-colors"
                  >
                    <RotateCcw size={15} /> Republier
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
