import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { clientService } from "../../services/clientService";
import { annonceService } from "../../services/annonceService";
import { useNotification } from "../../hooks/useNotification";
import AnnonceCard from "../Public/AnnonceCard";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";

export default function Favorites() {
  const { pushToast } = useNotification();
  const [favorites, setFavorites] = useState([]);
  const [annonces, setAnnonces] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);
    try {
      const data = await clientService.getFavorites();
      const list = data.results || data;
      setFavorites(list);

      const detailsMap = {};
      await Promise.all(
        list.map(async (fav) => {
          try {
            detailsMap[fav.annonce] = await annonceService.getById(fav.annonce);
          } catch {
            /* annonce supprimée, ignorée */
          }
        })
      );
      setAnnonces(detailsMap);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(annonce) {
    const favorite = favorites.find((f) => f.annonce === annonce.id);
    if (!favorite) return;
    try {
      await clientService.removeFavorite(favorite.id);
      setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
      pushToast({ type: "success", title: "Retiré des favoris" });
    } catch {
      pushToast({ type: "error", title: "Une erreur est survenue" });
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Chargement de vos favoris…" />;

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Aucun favori pour le moment"
        description="Ajoutez des biens à vos favoris en parcourant les annonces."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
      <h1
        className="text-2xl text-[#1C2520] mb-7"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        Mes favoris
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites
          .filter((fav) => annonces[fav.annonce])
          .map((fav) => (
            <AnnonceCard
              key={fav.id}
              annonce={annonces[fav.annonce]}
              isFavorite
              onToggleFavorite={handleRemove}
            />
          ))}
      </div>
    </div>
  );
}
