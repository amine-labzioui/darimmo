import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Building2,
} from "lucide-react";

import { formatPriceWithCurrency } from "../../../utils/formatters";
import { isBoostActive } from "../../../utils/helpers";

function StatCard({ icon: Icon, value, label }) {
  return (
    <div
      className="
        group
        rounded-xl
        bg-white
        border
        border-[#ECE7DD]
        shadow-sm
        hover:shadow-md
        hover:-translate-y-1
        transition-all
        duration-300
        p-4
        gap-3
        flex
        flex-col
        justify-between
      "
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#F3FBF7]">

        <Icon
          size={18}
          className="text-[#047857]"
        />

      </div>

      <div>

        <div className="text-lg font-semibold text-[#1C2520]">

          {value}

        </div>

        <div className="mt-0.5 text-xs text-[#6B7280]">

          {label}

        </div>

      </div>

    </div>
  );
}

export default function HeaderSection({ annonce }) {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-6">

      <div className="max-w-6xl">

        <div className="flex flex-wrap items-center gap-2 text-sm text-[#6B7280]">

          <MapPin
            size={14}
            className="text-[#047857]"
          />

          <span>

            {annonce.city}

            {annonce.neighborhood &&
              ` • ${annonce.neighborhood}`}

          </span>

          {isBoostActive(annonce) && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#EEF8F3] text-[#047857] text-xs font-semibold">

              Premium

            </span>
          )}

        </div>

        <h1
          className="mt-2 text-2xl lg:text-3xl leading-tight text-[#1C2520]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          {annonce.title}
        </h1>

        <div className="mt-2">

          <span className="text-2xl font-semibold text-[#047857]">

            {formatPriceWithCurrency(
              annonce.price,
              annonce.transaction_type
            )}

          </span>

        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">

          <StatCard
            icon={BedDouble}
            value={annonce.bedrooms || 0}
            label="Chambres"
          />

          <StatCard
            icon={Bath}
            value={annonce.bathrooms || 0}
            label="Salle de bain"
          />

          <StatCard
            icon={Maximize}
            value={`${annonce.surface} m²`}
            label="Surface"
          />

          <StatCard
            icon={Building2}
            value={annonce.property_type}
            label="Type"
          />

        </div>

      </div>

    </section>
  );
}