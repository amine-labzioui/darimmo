import { Link } from "react-router-dom";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
} from "lucide-react";

import {
  formatPriceWithCurrency,
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
        rounded-[30px]
        bg-white
        border
        border-[#ECE7DD]
        shadow-sm
        hover:shadow-2xl
        transition-all
        duration-500
      "
    >
      <div className="overflow-hidden h-64">

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

      <div className="p-6">

        <div className="flex items-center gap-2 text-[#6B7280] text-sm">

          <MapPin size={15} />

          {annonce.city}

        </div>

        <h3 className="mt-3 text-xl font-bold text-[#1C2520] line-clamp-2">

          {annonce.title}

        </h3>

        <div className="mt-5 flex items-center gap-5 text-[#6B7280]">

          <div className="flex items-center gap-2">

            <Bed size={18} />

            {annonce.bedrooms}

          </div>

          <div className="flex items-center gap-2">

            <Bath size={18} />

            {annonce.bathrooms}

          </div>

          <div className="flex items-center gap-2">

            <Maximize size={18} />

            {annonce.surface} m²

          </div>

        </div>

        <div className="mt-6 text-3xl font-bold text-[#047857]">

          {formatPriceWithCurrency(
            annonce.price,
            annonce.transaction_type
          )}

        </div>

      </div>

    </Link>
  );
}