import LoadingSpinner from "../../Shared/LoadingSpinner";

export default function BoostAnnonceCard({
  boostPlans,
  loadingPlans,
  annonce,
  onBoost,
}) {
  if (loadingPlans) {
    return (
      <div className="bg-white rounded-2xl border border-[#E6DFD0] p-6 mt-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E6DFD0] p-7 mt-6">

      <h2
        className="text-xl text-[#1C2520]"
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 600,
        }}
      >
        Booster cette annonce
      </h2>

      <p className="text-sm text-[#6B7280] mt-2 mb-6">
        Faites apparaître votre annonce en premier dans les résultats de recherche.
      </p>

      {annonce.is_boosted && (
        <div className="mb-6 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-4">

          <div className="font-semibold text-[#047857]">
            Cette annonce est actuellement boostée
          </div>

          {annonce.boosted_until && (
            <div className="text-sm mt-1 text-[#065F46]">
              Jusqu'au {new Date(annonce.boosted_until).toLocaleDateString()}
            </div>
          )}

        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">

        {boostPlans.map((plan) => (

          <div
            key={plan.id}
            className="border border-[#E6DFD0] rounded-2xl p-5 hover:shadow-lg transition"
          >

            <h3 className="font-semibold text-lg">
              {plan.name}
            </h3>

            <div className="mt-3 text-3xl font-bold text-[#047857]">
              {plan.price} DH
            </div>

            <div className="text-sm text-[#6B7280] mt-1">
              {plan.duration_days} jours
            </div>

            <p className="mt-4 text-sm text-[#5C6961]">
              {plan.description}
            </p>

            <button
              onClick={() => onBoost(plan.id)}
              className="
                w-full
                mt-6
                py-3
                rounded-xl
                bg-[#047857]
                text-white
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

    </div>
  );
}