import { Link } from "react-router-dom";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
} from "lucide-react";

import {
  formatPriceWithCurrency,
  formatSurface,
} from "../../../utils/formatters";

import {
  getMainImageUrl,
} from "../../../utils/helpers";

export default function SimilarPropertyCard({
  annonce,
}) {
  return (
    <Link
      to={`/annonces/${annonce.id}`}
      className="
        group
        overflow-hidden
        rounded-xl
        bg-white
        border
        border-[#ECE7DD]
        shadow-sm
        hover:shadow-md
        transition-all
        duration-500
      "
    >
      <div className="overflow-hidden h-44">

        <img
          src={getMainImageUrl(annonce)}
          alt={annonce.title}
          className="
            w-full
            h-full
            object-cover
            group-hover:scale-110
            transition
            duration-700
          "
        />

      </div>

      <div className="p-4">

        <div className="flex items-center gap-2 text-[#6B7280] text-sm">

          <MapPin size={14} />

          {annonce.city}

        </div>

        <h3 className="mt-1.5 text-base font-semibold text-[#1C2520] line-clamp-2">

          {annonce.title}

        </h3>

        <div className="mt-2 flex items-center gap-4 text-sm text-[#6B7280]">

          <div className="flex items-center gap-1.5">

            <Bed size={14} />

            {annonce.bedrooms}

          </div>

          <div className="flex items-center gap-1.5">

            <Bath size={14} />

            {annonce.bathrooms}

          </div>

          <div className="flex items-center gap-1.5">

            <Maximize size={14} />

            {formatSurface(annonce.surface)}

          </div>

        </div>

        <div className="mt-3 text-lg font-semibold text-[#047857]">

          {formatPriceWithCurrency(
            annonce.price,
            annonce.transaction_type
          )}

        </div>

      </div>

    </Link>
  );
}