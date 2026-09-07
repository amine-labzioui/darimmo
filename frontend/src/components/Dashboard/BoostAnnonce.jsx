import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { paymentService } from "../../services/paymentService";
import LoadingSpinner from "../Shared/LoadingSpinner";
console.log("BoostAnnonce file loaded");

export default function BoostAnnonce() {
  console.log("BoostAnnonce mounted");
  const { id } = useParams();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService
  .getBoostPlans()
  .then((data) => {
    console.log(data.results);
    setPlans(data.results);
  })
  .finally(() => setLoading(false));
   
  }, []);

  async function buy(planId) {
    try {
      const data = await paymentService.createCheckout({
       annonceId: id,
       boostPlanId: planId,
       provider: "cmi",
      });

      window.location.href = data.checkout_url;
    } catch (err) {
  console.log(err.response?.data);
  console.log(err);
  alert("Impossible de lancer le paiement.");
}
}


  if (loading)
    return <LoadingSpinner fullPage />;
  console.log(Array.isArray(plans), plans);

  return (
    <div className="max-w-5xl mx-auto">

      <h1
        className="text-3xl mb-8"
        style={{
          fontFamily:"Fraunces",
          fontWeight:600
        }}
      >
        Booster mon annonce
      </h1>


      <div className="grid md:grid-cols-3 gap-6">

  {plans.map((plan) => {
    console.log("PLAN =>", plan);

    return (
      <div
  key={plan.id}
  className="rounded-3xl border border-stone-200 bg-white p-8 shadow-lg"
>
  <h2 className="text-2xl font-semibold text-gray-900">
    {plan.name}
  </h2>

  <p className="mt-3 text-gray-600">
    {plan.description}
  </p>

  <div className="mt-8">
    <span className="text-4xl font-bold text-emerald-700">
      {plan.price}
    </span>

    <span className="ml-2 text-gray-600">
      MAD
    </span>
  </div>

  <div className="mt-3 text-sm text-gray-600">
    {plan.duration_days} jours
  </div>

  <button
    onClick={() => buy(plan.id)}
    className="mt-8 w-full rounded-xl bg-emerald-700 py-3 text-white hover:bg-emerald-800"
  >
    Choisir
  </button>
</div>
  );
})}
      </div>
    </div>
  );
}