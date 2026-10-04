import LoadingSpinner from "../../Shared/LoadingSpinner";
import { getBoostUnavailableMessage, isBoostActive } from "../../../utils/helpers";
import { formatDate } from "../../../utils/formatters";

export default function BoostAnnonceCard({
  boostPlans,
  loadingPlans,
  annonce,
  onBoost,
}) {
  if (loadingPlans) {
    return (
      <div className="bg-white rounded-xl border border-[#E6DFD0] p-5 mt-6">
        <LoadingSpinner />
      </div>
    );
  }

  const unavailableMessage = getBoostUnavailableMessage(annonce);

  return (
    <div className="bg-white rounded-xl border border-[#E6DFD0] p-5 mt-6">

      <h2
        className="text-lg text-[#1C2520]"
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 600,
        }}
      >
        Booster cette annonce
      </h2>

      <p className="text-sm text-[#6B7280] mt-1 mb-4">
        Faites apparaître votre annonce en premier dans les résultats de recherche.
      </p>

      {unavailableMessage ? (
        <div className="rounded-lg bg-[#F7F4EE] border border-[#E6DFD0] p-3 text-sm text-[#5C6961]">
          {unavailableMessage}
        </div>
      ) : isBoostActive(annonce) ? (
        <div className="rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] p-3">

          <div className="text-sm font-semibold text-[#047857]">
            {annonce.boosted_until
              ? `Boost actif jusqu'au ${formatDate(annonce.boosted_until)}.`
              : "Boost actif."}
          </div>

          {annonce.boosted_until && (
            <div className="text-sm mt-1 text-[#065F46]">
              Vous pourrez booster à nouveau après cette date.
            </div>
          )}

        </div>
      ) : (
      <div className="grid md:grid-cols-3 gap-3">

        {boostPlans.map((plan) => (

          <div
            key={plan.id}
            className="border border-[#E6DFD0] rounded-lg p-4 hover:shadow-md transition"
          >

            <h3 className="text-base font-semibold">
              {plan.name}
            </h3>

            <div className="mt-2 text-2xl font-bold text-[#047857]">
              {plan.price} DH
            </div>

            <div className="text-sm text-[#6B7280] mt-1">
              {plan.duration_days} jours
            </div>

            <p className="mt-2 text-sm text-[#5C6961]">
              {plan.description}
            </p>

            <button
              onClick={() => onBoost(plan.id)}
              className="
                w-full
                mt-4
                py-2
                rounded-lg
                bg-[#047857]
                text-white
                text-sm
                font-medium
                hover:bg-[#035f46]
                transition
              "
            >
              Booster maintenant
            </button>

          </div>

        ))}

      </div>
      )}

    </div>
  );
}