import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Sparkles,
  Building2,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

import HeroSearch from "./HeroSearch";
import AnnonceCard from "./AnnonceCard";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { annonceService } from "../../services/annonceService";

const CITIES = [
  {
    name: "Casablanca",
    image: "/images/cities/casablanca.jpg",
    annonces: "250+ biens",
  },
  {
    name: "Marrakech",
    image: "/images/cities/marrakech.jpg",
    annonces: "180+ biens",
  },
  {
    name: "Rabat",
    image: "/images/cities/rabat.jpg",
    annonces: "120+ biens",
  },
];

function Hero() {
  return (
    <section className="relative overflow-hidden">

      <div className="relative h-[290px] md:h-[330px] lg:h-[360px]">

        <img
          src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2200&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">

          <div className="max-w-xl">

            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs text-white backdrop-blur">
              <Sparkles size={14} />
              DarImmo Luxury
            </span>

            <h1
              className="mt-4 text-3xl font-semibold leading-tight text-white lg:text-5xl"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Trouvez votre futur logement.
            </h1>

            <p className="mt-3 text-base leading-7 text-white/90">
              Villas, appartements, terrains et bureaux partout au Maroc.
            </p>

            <div className="mt-5 flex gap-3">

              <Link
                to="/recherche"
                className="rounded-full bg-[#047857] px-6 py-2.5 font-semibold text-white transition hover:bg-[#065f46]"
              >
                Explorer
              </Link>

              <Link
                to="/assistant-ia"
                className="rounded-full border border-white/30 bg-white/10 px-6 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white hover:text-[#047857]"
              >
                Assistant IA
              </Link>

            </div>

          </div>

        </div>

      </div>

      <div className="relative z-20 mx-auto -mt-7 max-w-6xl px-6">
        <HeroSearch />
      </div>

    </section>
  );
}
function FeaturedProperties() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    annonceService
      .list({ ordering: "-created_at" })
      .then((data) => {
        setAnnonces((data.results || []).slice(0, 20));
      })
      .catch(() => setAnnonces([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-[#FAF8F5] pt-12 pb-16">

      <div className="mx-auto max-w-[1800px] px-5">

        <div className="mb-8 flex items-end justify-between">

          <div>

            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C2622D]">
              Dernières annonces
            </span>

            <h2
              className="mt-2 text-3xl lg:text-4xl text-[#1C2520]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Biens à la une
            </h2>

            <p className="mt-2 text-[#667085]">
              Les dernières propriétés publiées sur DarImmo.
            </p>

          </div>

          <Link
            to="/recherche"
            className="hidden lg:flex items-center gap-2 rounded-full border border-[#047857] px-5 py-2.5 font-medium text-[#047857] transition hover:bg-[#047857] hover:text-white"
          >
            Voir tout
            <ArrowRight size={18} />
          </Link>

        </div>

        {loading ? (
          <LoadingSpinner label="Chargement..." />
        ) : annonces.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#DDD] py-16 text-center">
            Aucune annonce disponible.
          </div>
        ) : (

          <div
            className="
              grid
              gap-4
              grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
            "
          >

            {annonces.map((annonce) => (
              <AnnonceCard
                key={annonce.id}
                annonce={annonce}
              />
            ))}

          </div>

        )}

      </div>

    </section>
  );
}
function ExploreCities() {
  return (
    <section className="bg-white py-14">

      <div className="mx-auto max-w-7xl px-5">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C2622D]">
              Explorer
            </span>

            <h2
              className="mt-2 text-3xl lg:text-4xl text-[#1C2520]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Les villes les plus recherchées
            </h2>

            <p className="mt-2 text-[#667085]">
              Découvrez les biens disponibles dans les villes les plus populaires.
            </p>

          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-3">

          {CITIES.map((city) => (

            <Link
              key={city.name}
              to={`/recherche?city=${city.name}`}
              className="group"
            >

              <div className="relative overflow-hidden rounded-2xl">

                <img
                  src={city.image}
                  alt={city.name}
                  className="h-[210px] w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5">

                  <div className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur">
                    {city.annonces}
                  </div>

                  <h3
                    className="mt-3 text-2xl text-white"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {city.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-sm text-white/90">
                    <MapPin size={15} />
                    Voir les annonces
                  </div>

                </div>

              </div>

            </Link>

          ))}

        </div>

      </div>

    </section>
  );
}
function WhyDarImmo() {
  const stats = [
    { value: "2 500+", label: "Annonces vérifiées" },
    { value: "350+", label: "Agences partenaires" },
    { value: "98%", label: "Clients satisfaits" },
    { value: "24/7", label: "Assistant IA" },
  ];

  const features = [
    {
      icon: <Building2 size={22} />,
      title: "Biens vérifiés",
      description:
        "Chaque annonce est vérifiée avant sa publication afin de garantir des informations fiables.",
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Paiements sécurisés",
      description:
        "Toutes les transactions sont protégées avec une sécurité renforcée.",
    },
    {
      icon: <BadgeCheck size={22} />,
      title: "Professionnels certifiés",
      description:
        "Collaborez uniquement avec des agences et promoteurs validés par DarImmo.",
    },
  ];

  return (
    <section className="bg-[#F7F7F5] py-14">

      <div className="mx-auto max-w-7xl px-5">

        <div className="mb-10 text-center">

          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C2622D]">
            Pourquoi DarImmo
          </span>

          <h2
            className="mt-2 text-3xl lg:text-4xl text-[#1C2520]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Une plateforme immobilière moderne
          </h2>

        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {stats.map((stat) => (

            <div
              key={stat.label}
              className="rounded-2xl bg-white p-6 text-center shadow-sm"
            >

              <div className="text-3xl font-bold text-[#047857]">
                {stat.value}
              </div>

              <div className="mt-2 text-sm text-[#667085]">
                {stat.label}
              </div>

            </div>

          ))}

        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">

          {features.map((feature) => (

            <div
              key={feature.title}
              className="rounded-3xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#047857] text-white">
                {feature.icon}
              </div>

              <h3
                className="mt-5 text-xl text-[#1C2520]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#667085]">
                {feature.description}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}
function AISection() {
  return (
    <section className="py-14">

      <div className="mx-auto max-w-7xl px-5">

        <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#024635] via-[#047857] to-[#0E7490]">

          <div className="grid items-center gap-8 px-8 py-10 lg:grid-cols-2 lg:px-14 lg:py-14">

            <div>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-white backdrop-blur">
                <Sparkles size={15} />
                DarImmo AI
              </span>

              <h2
                className="mt-5 text-3xl lg:text-5xl text-white"
                style={{
                  fontFamily: "'Fraunces', serif",
                }}
              >
                Votre conseiller immobilier intelligent.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-8 text-white/90">
                Notre intelligence artificielle vous aide à trouver le bien
                idéal, comparer les prix du marché et répondre à toutes vos
                questions en quelques secondes.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  to="/assistant-ia"
                  className="rounded-full bg-white px-6 py-3 font-semibold text-[#047857] transition hover:scale-105"
                >
                  Discuter avec l'IA
                </Link>

                <Link
                  to="/recherche"
                  className="rounded-full border border-white/25 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white hover:text-[#047857]"
                >
                  Explorer les biens
                </Link>

              </div>

            </div>

            <div className="hidden lg:flex justify-center">

              <div className="relative">

                <div className="absolute -inset-8 rounded-full bg-white/10 blur-3xl" />

                <div
                  className="
                    relative
                    flex
                    h-56
                    w-56
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/20
                    bg-white/10
                    backdrop-blur
                  "
                >

                  <Sparkles
                    size={90}
                    className="text-white"
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProperties />
      <ExploreCities />
      <WhyDarImmo />
      <AISection />
    </>
  );
}
