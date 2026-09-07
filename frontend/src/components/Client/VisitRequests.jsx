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
          icon: <CheckCircle2 size={16} />,
          label: "Visite confirmée",
        };

      case "pending":
        return {
          color:
            "bg-amber-50 border border-amber-200 text-amber-700",
          icon: <Clock3 size={16} />,
          label: "En attente",
        };

      case "refused":
        return {
          color:
            "bg-red-50 border border-red-200 text-red-700",
          icon: <XCircle size={16} />,
          label: "Refusée",
        };

      case "rescheduled":
        return {
          color:
            "bg-blue-50 border border-blue-200 text-blue-700",
          icon: <Calendar size={16} />,
          label: "Nouvelle date proposée",
        };

      default:
        return {
          color:
            "bg-gray-50 border border-gray-200 text-gray-600",
          icon: <CalendarCheck size={16} />,
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
    <div className="space-y-8">

      <div>
        <h1
          className="text-3xl text-[#1C2520]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          Mes demandes de visite
        </h1>

        <p className="mt-2 text-[#6B7280]">
          Retrouvez toutes vos demandes de visite ainsi que les réponses des agences.
        </p>
      </div>

      <div className="space-y-6">

        {requests.map((req) => {
          const status = getStatus(req);

          return (
            <div
              key={req.id}
              className="
                bg-white
                border
                border-[#ECE7DD]
                rounded-[28px]
                overflow-hidden
                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300
              "
            >

              <div className="grid lg:grid-cols-[240px_1fr_240px]">

                {/* IMAGE */}

                <div className="bg-[#F8F6F2] p-5">

                    <img
                      src={
                        req.main_image
                          ? `http://127.0.0.1:8000${req.main_image}`
                          : "https://placehold.co/500x350?text=DarImmo"
                      }
                    alt={req.annonce_title}
                    className="
                      w-full
                      h-44
                      object-cover
                      rounded-2xl
                    "
                  />

                </div>

                {/* INFOS */}

                <div className="p-7 flex flex-col justify-between">

                  <div>

                    <div className="flex items-center gap-3 mb-3">

                      <span className="text-xs uppercase tracking-[3px] text-[#A8A29E]">
                        Demande de visite
                      </span>

                    </div>

                    <h2
                      className="text-2xl text-[#1C2520]"
                      style={{
                        fontFamily: "'Fraunces', serif",
                      }}
                    >
                      {req.annonce_title}
                    </h2>

                    <div className="flex items-center gap-2 mt-2 text-[#6B7280]">

                      <MapPin size={16} />

                      <span>
                        {req.annonce_city}
                      </span>

                    </div>

                    {req.price && (
                      <div className="mt-4 text-2xl font-semibold text-[#047857]">
                        {formatPriceWithCurrency(req.price)}
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 mt-7">

                      <div>

                        <div className="text-xs uppercase text-gray-400 mb-2">
                          Date demandée
                        </div>

                        <div className="flex items-center gap-2 text-[#1C2520]">

                          <Calendar size={18} />

                          {formatDateTime(req.requested_date)}

                        </div>

                      </div>

                      {req.proposed_date && (

                        <div>

                          <div className="text-xs uppercase text-gray-400 mb-2">
                            Nouvelle date
                          </div>

                          <div className="flex items-center gap-2 text-[#2563EB]">

                            <CalendarCheck size={18} />

                            {formatDateTime(req.proposed_date)}

                          </div>

                        </div>

                      )}

                      {req.confirmed_date && (

                        <div>

                          <div className="text-xs uppercase text-gray-400 mb-2">
                            Date confirmée
                          </div>

                          <div className="flex items-center gap-2 text-[#047857]">

                            <CheckCircle2 size={18} />

                            {formatDateTime(req.confirmed_date)}

                          </div>

                        </div>

                      )}

                    </div>

                    {req.owner_message && (

                      <div
                        className="
                          mt-7
                          rounded-2xl
                          bg-[#FAFAFA]
                          border
                          border-[#ECECEC]
                          p-5
                        "
                      >

                        <div className="flex items-center gap-2 font-semibold text-[#1C2520] mb-3">

                          <MessageSquare size={18} />

                          Message de l'agence

                        </div>

                        <p className="text-[#555] whitespace-pre-line leading-7">
                          {req.owner_message}
                        </p>

                      </div>

                    )}

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="border-l border-[#ECE7DD] p-7 flex flex-col justify-between">

                  <div>

                    <div
                      className={`
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-3
                        rounded-2xl
                        font-semibold
                        ${status.color}
                      `}
                    >
                      {status.icon}
                      {status.label}
                    </div>

                    <div className="mt-8 space-y-4">

                      <div>
                        <div className="text-xs uppercase text-gray-400 mb-1">
                          Créée le
                        </div>

                        <div className="font-medium">
                          {formatDateTime(req.created_at)}
                        </div>
                      </div>

                      {req.updated_at && (
                        <div>
                          <div className="text-xs uppercase text-gray-400 mb-1">
                            Dernière mise à jour
                          </div>

                          <div className="font-medium">
                            {formatDateTime(req.updated_at)}
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                  <div className="space-y-3 mt-8">

                    <Link
                      to={`/annonces/${req.annonce_id}`}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        w-full
                        rounded-2xl
                        border
                        border-[#1C2520]
                        py-4
                        font-semibold
                        text-[#1C2520]
                        hover:bg-[#1C2520]
                        hover:text-white
                        transition
                      "
                    >
                      Voir l'annonce
                      <ArrowRight size={18} />
                    </Link>

                    {req.status === "rescheduled" && (
                      <button
                        className="
                          w-full
                          rounded-2xl
                          py-4
                          bg-[#047857]
                          text-white
                          font-semibold
                          hover:bg-[#03664F]
                          transition
                        "
                      >
                        Confirmer la nouvelle date
                      </button>
                    )}

                    {req.status === "pending" && (
                      <button
                        className="
                          w-full
                          rounded-2xl
                          py-4
                          border
                          border-red-300
                          text-red-600
                          hover:bg-red-50
                          transition
                        "
                      >
                        Annuler la demande
                      </button>
                    )}

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