import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";

import AnnonceCard from "./AnnonceCard";
import FilterPanel from "./FilterPanel";

import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";

import { annonceService } from "../../services/annonceService";
import { analyticsService } from "../../services/analyticsService";
import { clientService } from "../../services/clientService";

import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";

import { CITY_OPTIONS, normalizeCity } from "../../utils/constants";

export default function SearchAnnonces() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { isAuthenticated, isClient } = useAuth();
  const { pushToast } = useNotification();

  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    city: normalizeCity(searchParams.get("city")) || "",
    property_type: searchParams.get("property_type") || "",
    transaction_type: searchParams.get("transaction_type") || "",
    price_min: searchParams.get("price_min") || "",
    price_max: searchParams.get("price_max") || "",
    bedrooms_min: searchParams.get("bedrooms_min") || "",
    has_pool: searchParams.get("has_pool") || "",
    has_parking: searchParams.get("has_parking") || "",
    is_furnished: searchParams.get("is_furnished") || "",
  });

  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    setSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value)
      ),
      { replace: true }
    );

    let cancelled = false;

    setLoading(true);

    annonceService
      .list(filters)
      .then((data) => {
        if (cancelled) return;

        setResults(data.results || []);
        setCount(data.count || 0);

        analyticsService.logSearch(filters, data.count || 0);
      })
      .catch(() => {
        if (cancelled) return;

        setResults([]);
        setCount(0);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters, setSearchParams]);

  useEffect(() => {
    if (!isAuthenticated || !isClient) return;

    clientService
      .getFavorites()
      .then((data) => {
        const ids = new Set(
          (data.results || data).map(
            (favorite) => favorite.annonce
          )
        );

        setFavoriteIds(ids);
      })
      .catch(() => {});
  }, [isAuthenticated, isClient]);

  async function handleToggleFavorite(annonce) {
    if (!isAuthenticated) {
      pushToast({
        type: "info",
        title: "Connectez-vous pour ajouter aux favoris",
      });

      return;
    }

    try {
      if (favoriteIds.has(annonce.id)) {
        pushToast({
          type: "info",
          message:
            "Gérez vos favoris depuis votre tableau de bord.",
        });

        return;
      }

      await clientService.addFavorite(annonce.id);

      setFavoriteIds((prev) => new Set(prev).add(annonce.id));

      pushToast({
        type: "success",
        title: "Ajouté aux favoris",
      });
    } catch {
      pushToast({
        type: "error",
        title: "Une erreur est survenue",
      });
    }
  }

  function resetFilters() {
    setFilters({
      city: "",
      property_type: "",
      transaction_type: "",
      price_min: "",
      price_max: "",
      bedrooms_min: "",
      has_pool: "",
      has_parking: "",
      is_furnished: "",
    });
  }
  return (
  <div className="min-h-screen bg-[#FFFBF5]">

    {/* ================= HERO ================= */}

    <section className="relative overflow-hidden bg-gradient-to-r from-[#0D3B2A] via-[#13553B] to-[#0D3B2A]">

      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#F59E0B] blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-20">

        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur px-3 py-1 text-white text-xs">
          <Search size={14} />
          Recherche immobilière
        </span>

        <h1
          className="mt-4 text-white text-3xl lg:text-4xl leading-tight"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          Trouvez le bien parfait
          <br />
          partout au Maroc.
        </h1>

        <p className="mt-3 max-w-2xl text-base text-white/80">
          Trouvez le bien qui vous correspond parmi les annonces publiées sur
          DarImmo.
        </p>

      </div>

    </section>

    {/* ================= SEARCH BAR ================= */}

    <div className="max-w-7xl mx-auto px-5 sm:px-8">

      <div className="-mt-12 relative z-20">

        <div className="bg-white rounded-xl shadow-md border border-[#E9E2D6] p-4">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

            <div>

              <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
                Ville
              </label>

              <select
                value={filters.city}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-[#E6DFD0] px-3 py-2 text-sm"
              >
                <option value="">Toutes les villes</option>
                {CITY_OPTIONS.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>

            </div>

            <div>

              <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
                Type
              </label>

              <select
                value={filters.property_type}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    property_type: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-[#E6DFD0] px-3 py-2 text-sm"
              >
                <option value="">Tous</option>
                <option value="appartement">Appartement</option>
                <option value="villa">Villa</option>
                <option value="terrain">Terrain</option>
                <option value="bureau">Bureau</option>
              </select>

            </div>

            <div>

              <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
                Budget max
              </label>

              <input
                type="number"
                placeholder="Ex : 2 000 000"
                value={filters.price_max}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    price_max: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-[#E6DFD0] px-3 py-2 text-sm"
              />

            </div>

            <div>

              <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
                Chambres
              </label>

              <select
                value={filters.bedrooms_min}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    bedrooms_min: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-[#E6DFD0] px-3 py-2 text-sm"
              >
                <option value="">Toutes</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>

            </div>

          </div>

        </div>

      </div>

    </div>
    
        {/* ================= CONTENU ================= */}

    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>

          <span className="text-[#C2622D] text-[11px] font-semibold uppercase tracking-wide">
            Résultats
          </span>

          <h2
            className="mt-1 text-2xl text-[#1C2520]"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
            }}
          >
            {loading
              ? "Recherche..."
              : `${count} bien${count > 1 ? "s" : ""} trouvé${count > 1 ? "s" : ""}`}
          </h2>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-[#E6DFD0] bg-white px-4 py-2 text-sm shadow-sm hover:border-[#047857] transition"
          >
            <SlidersHorizontal size={16} />

            {showFilters
              ? "Masquer les filtres"
              : "Tous les filtres"}
          </button>

        </div>

      </div>

      {showFilters && (

        <div className="mb-6">

          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            resultsCount={count}
          />

        </div>

      )}
      {loading ? (
  <LoadingSpinner label="Recherche des biens..." />
) : results.length === 0 ? (
  <EmptyState
    icon={SearchX}
    title="Aucun bien trouvé"
    description="Essayez de modifier vos critères de recherche."
  />
) : (
  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

    {results.map((annonce) => (
      <AnnonceCard
        key={annonce.id}
        annonce={annonce}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={favoriteIds.has(annonce.id)}
      />
    ))}

  </div>
)}

    </section>

  </div>
);
}