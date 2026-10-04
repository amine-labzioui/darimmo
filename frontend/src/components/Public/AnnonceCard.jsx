import { Link } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Heart,
  Sparkles,
} from "lucide-react";

import { formatPriceWithCurrency } from "../../utils/formatters";
import { getMainImageUrl, isBoostActive } from "../../utils/helpers";

export default function AnnonceCard({
  annonce,
  onToggleFavorite,
  isFavorite = false,
}) {
  const isSale =
    annonce.transaction_type === "vente";

  const statusLabel = isSale
    ? "À vendre"
    : "À louer";

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        bg-white
        border
        border-gray-200
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        hover:border-emerald-600
      "
    >
      <Link
        to={`/annonces/${annonce.id}`}
        className="block"
      >
        <div className="relative">

          <img
            src={getMainImageUrl(annonce)}
            alt={annonce.title}
            className="
              w-full
              h-40
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23F3F4F6'/%3E%3C/svg%3E";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-lg ${
              isSale
                ? "bg-emerald-700 text-white"
                : "bg-orange-600 text-white"
            }`}
          >
            {statusLabel}
          </span>

          {isBoostActive(annonce) && (
            <div
              className="
                absolute
                top-3
                right-3
                flex
                items-center
                gap-1
                rounded-full
                bg-gradient-to-r
                from-yellow-400
                via-amber-500
                to-orange-500
                px-2.5
                py-1
                text-[10px]
                font-bold
                text-white
                shadow-xl
              "
            >
              <Sparkles size={10} />
              PREMIUM
            </div>
          )}

          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(annonce);
              }}
              className="
                absolute
                bottom-3
                right-3
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-white
                shadow-lg
                transition
                hover:scale-110
              "
            >
              <Heart
                size={16}
                className={
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-500"
                }
              />
            </button>
          )}

        </div>

        <div className="p-3">
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <MapPin size={13} className="text-emerald-700" />

            <span className="truncate">
              {annonce.city}
              {annonce.neighborhood &&
                ` • ${annonce.neighborhood}`}
            </span>
          </div>

          <h3
            className="
              mt-2
              truncate
              text-[17px]
              font-semibold
              text-gray-900
              group-hover:text-emerald-700
              transition-colors
            "
            style={{
              fontFamily: "'Fraunces', serif",
            }}
          >
            {annonce.title}
          </h3>

          <div className="mt-2 flex items-center justify-between">

            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold capitalize text-emerald-700">
              {annonce.property_type}
            </span>

            {annonce.is_featured && (
              <span className="text-[10px] font-semibold text-amber-600">
                ⭐ Sélection
              </span>
            )}

          </div>

          <div className="mt-3">

            <span className="text-xl font-bold text-emerald-700">
              {formatPriceWithCurrency(
                annonce.price,
                annonce.transaction_type
              )}
            </span>

          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">

            <div className="rounded-lg bg-gray-50 py-2 text-center">

              <Bed
                size={15}
                className="mx-auto text-emerald-700"
              />

              <div className="mt-1 text-sm font-semibold">
                {annonce.bedrooms || 0}
              </div>

            </div>

            <div className="rounded-lg bg-gray-50 py-2 text-center">

              <Bath
                size={15}
                className="mx-auto text-emerald-700"
              />

              <div className="mt-1 text-sm font-semibold">
                {annonce.bathrooms || 0}
              </div>

            </div>

            <div className="rounded-lg bg-gray-50 py-2 text-center">

              <Maximize
                size={15}
                className="mx-auto text-emerald-700"
              />

              <div className="mt-1 text-sm font-semibold">
                {annonce.surface || "--"}
              </div>

            </div>

          </div>

          <div className="mt-3">

            <div
              className="
                flex
                items-center
                justify-between
                rounded-xl
                bg-emerald-700
                px-3
                py-2
                transition
                group-hover:bg-emerald-800
              "
            >

              <span className="text-xs font-medium text-white">
                Voir détails
              </span>

              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-sm
                  font-bold
                  text-emerald-700
                "
              >
                →
              </span>

            </div>

          </div>

        </div>

      </Link>

    </article>
  );
}