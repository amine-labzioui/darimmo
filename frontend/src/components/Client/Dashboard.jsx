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

  const cards = [
    {
      icon: Heart,
      label: "Favoris",
      value: summary?.favorites_count ?? 0,
      to: "/favoris",
      color: "#C2622D",
      bg: "from-orange-50 to-white",
    },
    {
      icon: CalendarCheck,
      label: "Demandes de visite",
      value: summary?.visit_requests_count ?? 0,
      to: "/tableau-de-bord/visites",
      color: "#047857",
      bg: "from-emerald-50 to-white",
    },
    {
      icon: Search,
      label: "Recherches sauvegardées",
      value: summary?.saved_searches_count ?? 0,
      to: "/tableau-de-bord/recherches",
      color: "#0B7EA3",
      bg: "from-sky-50 to-white",
    },
    {
      icon: MessageSquare,
      label: "Messages non lus",
      value: summary?.unread_messages_count ?? 0,
      to: "/messages",
      color: "#E8A020",
      bg: "from-amber-50 to-white",
    },
  ];

  return (
    <div className="space-y-10">

      {/* HERO */}

      <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-r from-[#047857] via-[#0A7A5B] to-[#0C8D69] p-10 lg:p-14 text-white shadow-xl">

        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>

        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-white/5 blur-2xl"></div>

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

          <div>

            <div className="flex items-center gap-2 mb-4">

              <Sparkles size={18} />

              <span className="uppercase tracking-[4px] text-xs font-semibold opacity-80">
                DarImmo Premium
              </span>

            </div>

            <h1
              className="text-4xl lg:text-5xl"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
              }}
            >
              Bonjour {user?.first_name || user?.username}
            </h1>

            <p className="mt-5 text-white/80 text-lg max-w-2xl leading-relaxed">
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
                rounded-2xl
                px-7
                py-4
                flex
                items-center
                gap-3
                font-semibold
                shadow-xl
                hover:shadow-2xl
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >

              <Plus
                size={22}
                className="group-hover:rotate-90 transition-transform"
              />

              Publier une annonce

              <ArrowUpRight
                size={18}
                className="group-hover:translate-x-1 transition"
              />

            </Link>

          )}

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => (

  <Link
    key={card.label}
    to={card.to}
    className={`
      group
      relative
      overflow-hidden
      rounded-[28px]
      border
      border-[#ECE7DB]
      bg-gradient-to-br
      ${card.bg}
      p-7
      shadow-sm
      hover:shadow-2xl
      hover:-translate-y-2
      transition-all
      duration-300
    `}
  >

    <div
      className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10"
      style={{
        background: card.color,
        transform: "translate(35%,-35%)",
      }}
    />

    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
      style={{
        background: `${card.color}20`,
      }}
    >

      <card.icon
        size={30}
        style={{
          color: card.color,
        }}
      />

    </div>

    <p className="text-[#6B7280] text-sm font-medium">
      {card.label}
    </p>

    <h2 className="text-4xl font-bold text-[#1C2520] mt-3">
      {card.value}
    </h2>

    <div className="mt-6 flex items-center justify-between">

      <div
        className="flex items-center gap-2 text-sm font-semibold"
        style={{
          color: card.color,
        }}
      >

        <TrendingUp size={16} />

        Performance

      </div>

      <ArrowUpRight
        size={20}
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
      rounded-[30px]
      border
      border-[#ECE7DB]
      bg-white
      p-8
      shadow-sm
    "
  >

    <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#047857]/5 blur-3xl"></div>

    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">

      <div>

        <div className="flex items-center gap-3 mb-4">

          <div className="w-14 h-14 rounded-2xl bg-[#047857]/10 flex items-center justify-center">

            <TrendingUp
              size={28}
              className="text-[#047857]"
            />

          </div>

          <div>

            <h2 className="text-2xl font-semibold text-[#1C2520]">
              Performance de vos annonces
            </h2>

            <p className="text-[#6B7280] mt-1">
              Consultez les statistiques détaillées de tous vos biens publiés.
            </p>

          </div>

        </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">

          <div className="rounded-2xl border border-[#ECE7DB] bg-[#FAFAF8] p-6">

            <p className="text-sm text-[#6B7280]">
              Annonces publiées
            </p>

            <h3 className="text-3xl font-bold text-[#1C2520] mt-2">
              —
            </h3>

          </div>

          <div className="rounded-2xl border border-[#ECE7DB] bg-[#FAFAF8] p-6">

            <p className="text-sm text-[#6B7280]">
              Visites générées
            </p>

            <h3 className="text-3xl font-bold text-[#1C2520] mt-2">
              {summary?.visit_requests_count ?? 0}
            </h3>

          </div>

          <div className="rounded-2xl border border-[#ECE7DB] bg-[#FAFAF8] p-6">

            <p className="text-sm text-[#6B7280]">
              Messages reçus
            </p>

            <h3 className="text-3xl font-bold text-[#1C2520] mt-2">
              {summary?.unread_messages_count ?? 0}
            </h3>

          </div>

        </div>

      </div>

      <div className="flex items-center">

        <Link
          to="/tableau-de-bord/analytics"
          className="
            inline-flex
            items-center
            gap-3
            rounded-2xl
            bg-[#047857]
            px-6
            py-4
            text-white
            font-semibold
            shadow-lg
            hover:shadow-xl
            hover:bg-[#03664F]
            hover:-translate-y-1
            transition-all
            duration-300
          "
        >

          Voir les statistiques

          <ArrowUpRight
            size={18}
          />

        </Link>

      </div>

    </div>

  </div>
  )}
</div>

  );
}