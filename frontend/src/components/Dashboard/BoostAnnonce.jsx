import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { paymentService } from "../../services/paymentService";
import { annonceService } from "../../services/annonceService";
import { getBoostUnavailableMessage, isBoostActive } from "../../utils/helpers";
import { formatDate } from "../../utils/formatters";
import LoadingSpinner from "../Shared/LoadingSpinner";

export default function BoostAnnonce() {
  const { id } = useParams();

  const [plans, setPlans] = useState([]);
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      paymentService.getBoostPlans().then((data) => {
        setPlans(data.results);
      }),
      // Sert à savoir si un boost est déjà actif sur cette annonce.
      annonceService
        .getById(id)
        .then(setAnnonce)
        .catch(() => setAnnonce(null)),
    ]).finally(() => setLoading(false));
  }, [id]);

  async function buy(planId) {
    try {
      const data = await paymentService.createCheckout({
       annonceId: id,
       boostPlanId: planId,
       provider: "cmi",
      });

      window.location.href = data.checkout_url;
    } catch (err) {
  console.error(err.response?.data);
  console.error(err);
  alert("Impossible de lancer le paiement.");
}
}


  if (loading)
    return <LoadingSpinner fullPage />;

  const unavailableMessage = getBoostUnavailableMessage(annonce);

  return (
    <div className="max-w-5xl mx-auto">

      <h1
        className="text-2xl mb-6"
        style={{
          fontFamily:"Fraunces",
          fontWeight:600
        }}
      >
        Booster mon annonce
      </h1>


      {unavailableMessage ? (
        <div className="rounded-lg bg-[#F7F4EE] border border-[#E6DFD0] p-3 text-sm text-[#5C6961]">
          {unavailableMessage}
        </div>
      ) : isBoostActive(annonce) ? (
        <div className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-4">
          <div className="font-semibold text-[#047857]">
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
      <div className="grid md:grid-cols-3 gap-4">

  {plans.map((plan) => {
    return (
      <div
  key={plan.id}
  className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
>
  <h2 className="text-lg font-semibold text-gray-900">
    {plan.name}
  </h2>

  <p className="mt-1.5 text-sm text-gray-600">
    {plan.description}
  </p>

  <div className="mt-4">
    <span className="text-2xl font-bold text-emerald-700">
      {plan.price}
    </span>

    <span className="ml-1.5 text-sm text-gray-600">
      MAD
    </span>
  </div>

  <div className="mt-1 text-sm text-gray-600">
    {plan.duration_days} jours
  </div>

  <button
    onClick={() => buy(plan.id)}
    className="mt-5 w-full rounded-lg bg-emerald-700 py-2 text-sm text-white hover:bg-emerald-800"
  >
    Choisir
  </button>
</div>
  );
})}
      </div>
      )}
    </div>
  );
}