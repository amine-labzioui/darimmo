import { useEffect, useState } from "react";
import { Zap, Check } from "lucide-react";
import { paymentService } from "../../services/paymentService";
import { formatPrice } from "../../utils/formatters";
import LoadingSpinner from "../Shared/LoadingSpinner";

export default function BoostOptions({ annonceId, onSelectPlan }) {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService
      .getBoostPlans()
      .then((data) => setPlans(data.results || data))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Chargement des formules…" />;

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <button
          key={plan.id}
          onClick={() => {
            setSelected(plan.id);
            onSelectPlan?.(plan);
          }}
          className={`w-full text-left flex items-center justify-between gap-4 px-5 py-4 rounded-xl border-2 transition-colors ${
            selected === plan.id ? "border-[#047857] bg-[#ECFDF5]" : "border-[#E6DFD0] hover:border-[#047857]/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Zap size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[14.5px] font-medium text-[#1C2520]">{plan.name}</p>
              <p className="text-[12.5px] text-[#5C6961]">{plan.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <p className="text-[15px] font-semibold text-[#047857]">{formatPrice(plan.price)} MAD</p>
            {selected === plan.id && (
              <span className="w-5 h-5 rounded-full bg-[#047857] flex items-center justify-center">
                <Check size={12} className="text-white" />
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
