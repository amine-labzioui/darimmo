import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquare,
  XCircle,
  Home,
  ArrowRight,
} from "lucide-react";

import { clientService } from "../../services/clientService";
import { formatDateTime, formatPriceWithCurrency } from "../../utils/formatters";

import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";

// Origine du backend (ex. http://localhost:8000), déduite de l'URL de l'API :
// l'API des visites renvoie un chemin d'image relatif (/media/...).
const API_ORIGIN = new URL(
  import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  window.location.origin
).origin;

export default function VisitRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);

      const data = await clientService.getVisitRequests();

      setRequests(data.results || data || []);
    } catch (err) {
      console.error(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  function getStatus(req) {
    switch (req.status) {
      case "accepted":
        return {
          color:
            "bg-emerald-50 border border-emerald-200 text-emerald-700",
          icon: <CheckCircle2 size={14} />,
          label: "Visite confirmée",
        };

      case "pending":
        return {
          color:
            "bg-amber-50 border border-amber-200 text-amber-700",
          icon: <Clock3 size={14} />,
          label: "En attente",
        };

      case "refused":
        return {
          color:
            "bg-red-50 border border-red-200 text-red-700",
          icon: <XCircle size={14} />,
          label: "Refusée",
        };

      case "rescheduled":
        return {
          color:
            "bg-blue-50 border border-blue-200 text-blue-700",
          icon: <Calendar size={14} />,
          label: "Nouvelle date proposée",
        };

      default:
        return {
          color:
            "bg-gray-50 border border-gray-200 text-gray-600",
          icon: <CalendarCheck size={14} />,
          label: req.status,
        };
    }
  }

  if (loading) {
    return (
      <LoadingSpinner
        fullPage
        label="Chargement de vos demandes..."
      />
    );
  }

  if (!requests.length) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Aucune demande de visite"
        description="Vous n'avez encore effectué aucune demande."
      />
    );
  }
    return (
    <div className="space-y-6">

      <div>
        <h1
          className="text-2xl text-[#1C2520]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          Mes demandes de visite
        </h1>

        <p className="mt-1 text-sm text-[#6B7280]">
          Retrouvez toutes vos demandes de visite ainsi que les réponses des agences.
        </p>
      </div>

      <div className="space-y-3">

        {requests.map((req) => {
          const status = getStatus(req);

          return (
            <div
              key={req.id}
              className="
                bg-white
                border
                border-[#ECE7DD]
                rounded-xl
                overflow-hidden
                shadow-sm
                hover:shadow-md
                transition-all
                duration-300
              "
            >

              <div className="grid lg:grid-cols-[176px_1fr_208px]">

                {/* IMAGE */}

                <div className="bg-[#F8F6F2] p-3">

                    <img
                      src={
                        req.main_image
                          ? new URL(req.main_image, API_ORIGIN).href
                          : "/placeholder-property.svg"
                      }
                    alt={req.annonce_title}
                    className="
                      w-full
                      h-28
                      object-cover
                      rounded-lg
                    "
                  />

                </div>

                {/* INFOS */}

                <div className="p-4 flex flex-col justify-between">

                  <div>

                    <div className="flex items-center gap-3 mb-1">

                      <span className="text-[11px] uppercase tracking-wide text-[#A8A29E]">
                        Demande de visite
                      </span>

                    </div>

                    <h2
                      className="text-base font-semibold text-[#1C2520]"
                      style={{
                        fontFamily: "'Fraunces', serif",
                      }}
                    >
                      {req.annonce_title}
                    </h2>

                    <div className="flex items-center gap-1.5 mt-1 text-sm text-[#6B7280]">

                      <MapPin size={14} />

                      <span>
                        {req.annonce_city}
                      </span>

                    </div>

                    {req.price && (
                      <div className="mt-2 text-lg font-semibold text-[#047857]">
                        {formatPriceWithCurrency(req.price)}
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 mt-4">

                      <div>

                        <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                          Date demandée
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#1C2520]">

                          <Calendar size={16} />

                          {formatDateTime(req.requested_date)}

                        </div>

                      </div>

                      {req.proposed_date && (

                        <div>

                          <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                            Nouvelle date
                          </div>

                          <div className="flex items-center gap-2 text-sm text-[#2563EB]">

                            <CalendarCheck size={16} />

                            {formatDateTime(req.proposed_date)}

                          </div>

                        </div>

                      )}

                      {req.confirmed_date && (

                        <div>

                          <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                            Date confirmée
                          </div>

                          <div className="flex items-center gap-2 text-sm text-[#047857]">

                            <CheckCircle2 size={16} />

                            {formatDateTime(req.confirmed_date)}

                          </div>

                        </div>

                      )}

                    </div>

                    {req.owner_message && (

                      <div
                        className="
                          mt-4
                          rounded-lg
                          bg-[#FAFAFA]
                          border
                          border-[#ECECEC]
                          p-3
                        "
                      >

                        <div className="flex items-center gap-2 text-sm font-semibold text-[#1C2520] mb-1.5">

                          <MessageSquare size={16} />

                          Message de l'agence

                        </div>

                        <p className="text-sm text-[#555] whitespace-pre-line leading-6">
                          {req.owner_message}
                        </p>

                      </div>

                    )}

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="border-t lg:border-t-0 lg:border-l border-[#ECE7DD] p-4 flex flex-col justify-between">

                  <div>

                    <div
                      className={`
                        inline-flex
                        items-center
                        gap-1.5
                        px-2.5
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        ${status.color}
                      `}
                    >
                      {status.icon}
                      {status.label}
                    </div>

                    <div className="mt-4 space-y-3">

                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-0.5">
                          Créée le
                        </div>

                        <div className="text-sm font-medium">
                          {formatDateTime(req.created_at)}
                        </div>
                      </div>

                      {req.updated_at && (
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-0.5">
                            Dernière mise à jour
                          </div>

                          <div className="text-sm font-medium">
                            {formatDateTime(req.updated_at)}
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                  <div className="mt-4">

                    <Link
                      to={`/annonces/${req.annonce_id}`}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        w-full
                        rounded-lg
                        border
                        border-[#1C2520]
                        py-2
                        text-sm
                        font-semibold
                        text-[#1C2520]
                        hover:bg-[#1C2520]
                        hover:text-white
                        transition
                      "
                    >
                      Voir l'annonce
                      <ArrowRight size={16} />
                    </Link>

                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}