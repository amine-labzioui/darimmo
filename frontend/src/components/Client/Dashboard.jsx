import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Heart,
  CalendarCheck,
  Search,
  MessageSquare,
  Plus,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import { clientService } from "../../services/clientService";
import { useAuth } from "../../hooks/useAuth";

import LoadingSpinner from "../Shared/LoadingSpinner";

export default function Dashboard() {
  const { user, isAgence } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientService
      .getSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <LoadingSpinner
        fullPage
        label="Chargement de votre tableau de bord..."
      />
    );
  }

  // Si l'appel du résumé a échoué (summary nul), on affiche « — » plutôt qu'un faux 0.
  const count = (key) => (summary ? summary[key] ?? 0 : "—");

  const cards = [
    {
      icon: Heart,
      label: "Favoris",
      value: count("favorites_count"),
      to: "/favoris",
      color: "#C2622D",
      bg: "from-orange-50 to-white",
    },
    {
      icon: CalendarCheck,
      label: "Demandes de visite",
      value: count("visit_requests_count"),
      to: "/client/visites",
      color: "#047857",
      bg: "from-emerald-50 to-white",
    },
    {
      icon: Search,
      label: "Recherches sauvegardées",
      value: count("saved_searches_count"),
      to: "/client/recherches",
      color: "#0B7EA3",
      bg: "from-sky-50 to-white",
    },
    {
      icon: MessageSquare,
      label: "Messages reçus",
      value: count("unread_messages_count"),
      to: "/messages",
      color: "#E8A020",
      bg: "from-amber-50 to-white",
    },
  ];

  return (
    <div className="space-y-6">

      {/* HERO */}

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#047857] via-[#0A7A5B] to-[#0C8D69] p-5 lg:p-6 text-white shadow-sm">

        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>

        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-white/5 blur-2xl"></div>

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <Sparkles size={14} />

              <span className="uppercase tracking-wide text-[11px] font-semibold opacity-80">
                DarImmo Premium
              </span>

            </div>

            <h1
              className="text-2xl"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
              }}
            >
              Bonjour {user?.first_name || user?.username}
            </h1>

            <p className="mt-1 text-white/80 text-sm max-w-2xl leading-relaxed">
              Consultez rapidement vos favoris, vos demandes de visite,
              vos recherches sauvegardées et votre activité.
            </p>

          </div>

          {isAgence && (

            <Link
              to="/agence/annonces/nouvelle"
              className="
                group
                bg-white
                text-[#047857]
                rounded-lg
                px-4
                py-2
                flex
                items-center
                gap-2
                text-sm
                font-semibold
                shadow-sm
                hover:shadow-md
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >

              <Plus
                size={16}
                className="group-hover:rotate-90 transition-transform"
              />

              Publier une annonce

              <ArrowUpRight
                size={16}
                className="group-hover:translate-x-1 transition"
              />

            </Link>

          )}

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (

  <Link
    key={card.label}
    to={card.to}
    className={`
      group
      relative
      overflow-hidden
      rounded-xl
      border
      border-[#ECE7DB]
      bg-gradient-to-br
      ${card.bg}
      p-4
      shadow-sm
      hover:shadow-md
      hover:-translate-y-1
      transition-all
      duration-300
    `}
  >

    <div
      className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
      style={{
        background: card.color,
        transform: "translate(35%,-35%)",
      }}
    />

    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
      style={{
        background: `${card.color}20`,
      }}
    >

      <card.icon
        size={18}
        style={{
          color: card.color,
        }}
      />

    </div>

    <p className="text-[#6B7280] text-xs font-medium">
      {card.label}
    </p>

    <h2 className="text-2xl font-bold text-[#1C2520] mt-1">
      {card.value}
    </h2>

    <div className="mt-3 flex items-center justify-end">

      <ArrowUpRight
        size={16}
        className="text-[#9CA3AF] group-hover:text-[#047857] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
      />

    </div>

  </Link>

))}

</div>

{/* PERFORMANCE AGENCE */}

{isAgence && (

  <div
    className="
      relative
      overflow-hidden
      rounded-xl
      border
      border-[#ECE7DB]
      bg-white
      p-5
      shadow-sm
    "
  >

    <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#047857]/5 blur-3xl"></div>

    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">

      <div>

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-lg bg-[#047857]/10 flex items-center justify-center">

            <TrendingUp
              size={18}
              className="text-[#047857]"
            />

          </div>

          <div>

            <h2 className="text-lg font-semibold text-[#1C2520]">
              Performance de vos annonces
            </h2>

            <p className="text-sm text-[#6B7280] mt-0.5">
              Consultez les statistiques détaillées de tous vos biens publiés.
            </p>

          </div>

        </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">

          <div className="rounded-lg border border-[#ECE7DB] bg-[#FAFAF8] p-3">

            <p className="text-xs text-[#6B7280]">
              Mes demandes de visite
            </p>

            <h3 className="text-2xl font-bold text-[#1C2520] mt-1">
              {count("visit_requests_count")}
            </h3>

          </div>

          <div className="rounded-lg border border-[#ECE7DB] bg-[#FAFAF8] p-3">

            <p className="text-xs text-[#6B7280]">
              Messages reçus
            </p>

            <h3 className="text-2xl font-bold text-[#1C2520] mt-1">
              {count("unread_messages_count")}
            </h3>

          </div>

        </div>

      </div>

      <div className="flex items-center">

        <Link
          to="/client/analytics"
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-[#047857]
            px-4
            py-2
            text-sm
            text-white
            font-semibold
            shadow-sm
            hover:shadow-md
            hover:bg-[#03664F]
            hover:-translate-y-1
            transition-all
            duration-300
          "
        >

          Voir les statistiques

          <ArrowUpRight
            size={16}
          />

        </Link>

      </div>

    </div>

  </div>
  )}
</div>

  );
}