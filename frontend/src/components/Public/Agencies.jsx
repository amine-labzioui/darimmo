import { useEffect, useState } from "react";
import { Building2, MapPin, Home } from "lucide-react";
import api from "../../services/api";
import { initials } from "../../utils/formatters";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";

export default function Agencies() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Utilise l'endpoint annonces pour dériver la liste des agences actives
    // (pas d'endpoint public dédié "agences" exposé par le backend actuel).
    api
      .get("/annonces/", { params: { ordering: "-created_at" } })
      .then(({ data }) => {
        const seen = new Map();
        (data.results || []).forEach((a) => {
          if (!seen.has(a.owner_name)) {
            seen.set(a.owner_name, { name: a.owner_name, count: 1, city: a.city });
          } else {
            seen.get(a.owner_name).count += 1;
          }
        });
        setAgencies(Array.from(seen.values()));
      })
      .catch(() => setAgencies([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage label="Chargement des agences…" />;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <div className="mb-8">
        <span className="text-[#C2622D] text-[13px] font-medium tracking-wide uppercase">
          Nos partenaires
        </span>
        <h1
          className="text-2xl sm:text-3xl text-[#1C2520] mt-2"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Agences immobilières
        </h1>
        <p className="text-[#5C6961] text-sm mt-2 max-w-xl">
          Découvrez les agences partenaires de DarImmo et leurs biens publiés sur la plateforme.
        </p>
      </div>

      {agencies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucune agence pour le moment"
          description="Les agences partenaires apparaîtront ici une fois leurs annonces publiées."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agencies.map((agency) => (
            <div key={agency.name} className="bg-white rounded-2xl border border-[#E6DFD0] p-5">
              <div className="w-12 h-12 rounded-full bg-[#047857] text-white font-medium flex items-center justify-center mb-4">
                {(() => {
                  const parts = (agency.name || "Agence DarImmo").split(" ");
                  return initials(parts[0], parts[1] || "");
                })()}
              </div>
              <p className="text-[15px] font-medium text-[#1C2520]">{agency.name || "Agence DarImmo"}</p>
              <div className="flex items-center gap-1.5 text-[13px] text-[#5C6961] mt-1.5">
                <MapPin size={13} /> {agency.city}
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-[#5C6961] mt-1">
                <Home size={13} /> {agency.count} annonce(s)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
