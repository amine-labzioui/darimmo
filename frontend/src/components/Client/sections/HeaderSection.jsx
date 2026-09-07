import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Building2,
} from "lucide-react";

import { formatPriceWithCurrency } from "../../../utils/formatters";

function StatCard({ icon: Icon, value, label }) {
  return (
    <div
      className="
        group
        rounded-[28px]
        bg-white
        border
        border-[#ECE7DD]
        shadow-md
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
        p-6
        min-h-[120px]
        flex
        flex-col
        justify-between
      "
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F3FBF7]">

        <Icon
          size={26}
          className="text-[#047857]"
        />

      </div>

      <div>

        <div className="text-3xl font-bold text-[#1C2520]">

          {value}

        </div>

        <div className="mt-1 text-sm text-[#6B7280]">

          {label}

        </div>

      </div>

    </div>
  );
}

export default function HeaderSection({ annonce }) {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-12">

      <div className="max-w-6xl">

        <div className="flex flex-wrap items-center gap-3 text-[#6B7280]">

          <MapPin
            size={17}
            className="text-[#047857]"
          />

          <span>

            {annonce.city}

            {annonce.neighborhood &&
              ` • ${annonce.neighborhood}`}

          </span>

          <span className="px-3 py-1 rounded-full bg-[#EEF8F3] text-[#047857] text-sm font-semibold">

            Premium

          </span>

        </div>

        <h1
          className="mt-5 text-[52px] leading-tight text-[#1C2520]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          {annonce.title}
        </h1>

        <div className="mt-7">

          <span className="text-[54px] font-bold text-[#047857]">

            {formatPriceWithCurrency(
              annonce.price,
              annonce.transaction_type
            )}

          </span>

        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">

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