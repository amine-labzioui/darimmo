import { useEffect, useState } from "react";
import {
  Home,
  CalendarCheck,
  Eye,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../Shared/LoadingSpinner";

export default function AgencyDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    annonces: 0,
    visites: 0,
    vues: 0,
    boostees: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const annonces = await api.get("/annonces/mes_annonces/");
        console.log("ANNONCES =", annonces.data);

        const visites = await api.get("/agency-dashboard/visit-requests/");
        console.log("VISITES =", visites.data);

        const annonceList = annonces.data.results || annonces.data;
        const visitList = visites.data.results || visites.data;
        console.log(annonceList);
        
        console.log("Premier annonce =", annonceList[0]);

        

        setStats({
          annonces: annonceList.length,
          visites: visitList.length,
          vues: annonceList.reduce(
            (sum, a) => sum + (a.views_count || 0),
            0
          ),
          boostees: annonceList.filter(
            (a) => a.is_boosted
          ).length,
        });
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading)
    return (
      <LoadingSpinner
        fullPage
        label="Chargement..."
      />
    );

  const cards = [
    {
      icon: Home,
      label: "Mes annonces",
      value: stats.annonces,
      color: "#047857",
    },
    {
      icon: CalendarCheck,
      label: "Demandes",
      value: stats.visites,
      color: "#C2622D",
    },
    {
      icon: Eye,
      label: "Vues",
      value: stats.vues,
      color: "#0B7EA3",
    },
    {
      icon: TrendingUp,
      label: "Boostées",
      value: stats.boostees,
      color: "#E8A020",
    },
  ];

  return (
  <div className="space-y-10">

    <div>
      <h1
        className="text-4xl text-[#1C2520]"
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 600,
        }}
      >
        Tableau de bord
      </h1>

      <p className="text-[#7B857D] mt-3 text-lg">
        Bienvenue dans votre espace professionnel.
      </p>
    </div>

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card) => (

        <div
          key={card.label}
          className="bg-white rounded-3xl border border-[#ECE6DA] p-8"
        >

          <div
            className="text-[42px] text-[#1C2520]"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
            }}
          >
            {card.value}
          </div>

          <div className="mt-2 text-[#8B938D] text-sm tracking-wide uppercase">
            {card.label}
          </div>

        </div>

      ))}

    </div>

    <div className="grid lg:grid-cols-2 gap-7">

      <div className="bg-white rounded-3xl border border-[#ECE6DA] p-8">

        <h2
          className="text-2xl text-[#1C2520]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          Activité
        </h2>

        <div className="mt-8 space-y-5">

          <div className="flex justify-between">
            <span className="text-[#6C746E]">
              Total des annonces
            </span>

            <span className="font-semibold text-[#1C2520]">
              {stats.annonces}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#6C746E]">
              Demandes de visite
            </span>

            <span className="font-semibold text-[#1C2520]">
              {stats.visites}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#6C746E]">
              Total des vues
            </span>

            <span className="font-semibold text-[#1C2520]">
              {stats.vues}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#6C746E]">
              Annonces boostées
            </span>

            <span className="font-semibold text-[#1C2520]">
              {stats.boostees}
            </span>
          </div>

        </div>

      </div>

      <div className="bg-white rounded-3xl border border-[#ECE6DA] p-8">

        <h2
          className="text-2xl text-[#1C2520]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          Actions rapides
        </h2>

        <div className="mt-8 flex flex-col gap-4">

          <Link
            to="/agence/annonces/nouvelle"
            className="h-12 rounded-2xl bg-[#F7F4EE] flex items-center justify-center text-[#1C2520] hover:bg-[#EEE7DA] transition-all"
          >
            Ajouter une annonce
          </Link>

          <Link
            to="/agence/annonces"
            className="h-12 rounded-2xl border border-[#E6DFD0] flex items-center justify-center text-[#1C2520] hover:bg-[#FAF8F4]"
          >
            Gérer mes annonces
          </Link>

          <Link
            to="/agence/visites"
            className="h-12 rounded-2xl border border-[#E6DFD0] flex items-center justify-center text-[#1C2520] hover:bg-[#FAF8F4]"
          >
            Voir les visites
          </Link>

        </div>

      </div>

    </div>

  </div>
);}