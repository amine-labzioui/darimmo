import { Zap } from "lucide-react";

export default function BoostCard({
  onClick,
  boosted,
  expiresAt,
}) {
  return (
    <div className="rounded-2xl border border-[#E6DFD0] bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h3
            className="text-xl text-[#1C2520]"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
            }}
          >
            Booster cette annonce
          </h3>

          <p className="mt-2 text-[#6B7280] text-sm">
            Apparaissez en tête des résultats de recherche.
          </p>

        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] flex items-center justify-center">

          <Zap
            className="text-[#C2622D]"
            size={26}
          />

        </div>

      </div>

      {boosted ? (

        <div className="mt-6 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-4">

          <p className="font-semibold text-[#047857]">
            Boost actif
          </p>

          <p className="text-sm text-[#065F46] mt-1">
            Expire le {expiresAt}
          </p>

        </div>

      ) : (

        <button
          onClick={onClick}
          className="mt-6 w-full rounded-xl bg-[#C2622D] text-white py-3 font-medium hover:bg-[#A84F22] transition"
        >
          Booster maintenant
        </button>

      )}

    </div>
  );
}