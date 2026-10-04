import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, Home, MoreVertical } from "lucide-react";
import { annonceService } from "../../services/annonceService";
import { formatPriceWithCurrency } from "../../utils/formatters";
import { ANNONCE_STATUS } from "../../utils/constants";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";
import { getMainImageUrl, isBoostActive } from "../../utils/helpers";
import { Rocket } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function MyAnnonces() {
  const navigate = useNavigate();
  const { isAgence } = useAuth();
  const dashboardBase = isAgence ? "/agence" : "/client";

  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    annonceService
      .mesAnnonces()
      .then((data) => setAnnonces(data.results || data))
      .catch(() => setAnnonces([]))
      .finally(() => setLoading(false));
  }, []);
  function getRemainingDays(date) {
  if (!date) return 0;

  const now = new Date();
  const end = new Date(date);

  const diff = end - now;

  if (diff <= 0) return 0;

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return days;
}

  if (loading) return <LoadingSpinner fullPage label="Chargement de vos annonces…" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <h1
          className="text-2xl text-[#1C2520]"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Mes annonces
        </h1>
        <Link
          to={`${dashboardBase}/annonces/nouvelle`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#047857] text-white text-[14px] font-medium hover:bg-[#035f46] transition-colors"
        >
          <Plus size={17} /> Nouvelle annonce
        </Link>
      </div>

      {annonces.length === 0 ? (
        <EmptyState
          icon={Home}
          title="Aucune annonce publiée"
          description="Créez votre première annonce pour commencer à recevoir des contacts."
          action={
            <Link
              to={`${dashboardBase}/annonces/nouvelle`}
              className="px-5 py-2.5 rounded-xl bg-[#047857] text-white text-[14px] font-medium hover:bg-[#035f46] transition-colors"
            >
              Publier une annonce
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {annonces.map((a) => {
            const status = ANNONCE_STATUS[a.status];
            const remainingDays = getRemainingDays(a.boosted_until);
            return (
              <Link
                key={a.id}
                to={`${dashboardBase}/annonces/${a.id}/modifier`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-[#E6DFD0] p-4 hover:shadow-md transition-shadow"
              >
                <img
                  src={getMainImageUrl(a)}
                  alt={a.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-medium text-[#1C2520] truncate">{a.title}</p>
                  <p className="text-[13px] text-[#5C6961] mt-0.5">
                    {a.city} · {formatPriceWithCurrency(a.price, a.transaction_type)}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {isBoostActive(a) ? (
  <div className="mt-2 flex items-center gap-2 flex-wrap">

    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
      <Rocket size={12} />
      Premium
    </span>

    {remainingDays > 0 && (
      <span className="text-xs text-[#047857] font-medium">
        {`Expire dans ${remainingDays} jour${remainingDays > 1 ? "s" : ""}`}
      </span>
    )}

  </div>
) : a.status === "published" ? (
  <div className="mt-2">

    <Link
  to={`${dashboardBase}/annonces/${a.id}/boost`}
  onClick={(e) => e.stopPropagation()}
  className="inline-block rounded-lg bg-[#047857] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#035f46]"
>
  🚀 Booster cette annonce
</Link>

  </div>
) : null}
                    <span className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ${status?.badgeClass || ""}`}>
                      {status?.label}
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-[#8C9189]">
                      <Eye size={12} /> {a.views_count}
                    </span>
                  </div>
                </div>
                <MoreVertical size={18} className="text-[#8C9189] shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
