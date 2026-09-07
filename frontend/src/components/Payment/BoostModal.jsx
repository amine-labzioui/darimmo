import { useEffect, useState } from "react";
import {
  X,
  Zap,
  Crown,
  Gem,
  Check,
  Sparkles,
} from "lucide-react";

import { paymentService } from "../../services/paymentService";
import LoadingSpinner from "../Shared/LoadingSpinner";

export default function BoostModal({
  open,
  onClose,
  onContinue,
}) {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const icons = [
    <Zap size={28} />,
    <Crown size={28} />,
    <Gem size={28} />,
  ];

  const gradients = [
    "from-[#047857] to-[#059669]",
    "from-[#D4AF37] to-[#F6D365]",
    "from-[#6D28D9] to-[#9333EA]",
  ];

  const labels = [
    null,
    "PLUS POPULAIRE",
    "LUXE",
  ];

  useEffect(() => {
    if (!open) return;

    async function loadPlans() {
      try {
        setLoading(true);

        const data =
          await paymentService.getBoostPlans();

        setPlans(data);

        if (data.length) {
          setSelected(data[1] || data[0]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, [open]);

  if (!open) return null;
    return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">

      <div className="w-full max-w-6xl overflow-hidden rounded-[36px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)]">

        {/* Header */}

        <div className="border-b border-[#ECE7DD] px-10 py-8 flex items-center justify-between">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#F3FBF7] px-4 py-2 text-xs font-semibold uppercase tracking-[3px] text-[#047857]">
              <Sparkles size={14} />
              Premium DarImmo
            </div>

            <h2
              className="mt-4 text-4xl text-[#1C2520]"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
              }}
            >
              Boostez votre annonce
            </h2>

            <p className="mt-2 text-[#6B7280]">
              Choisissez la formule qui correspond à vos besoins.
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-gray-100"
          >
            <X />
          </button>

        </div>

        {loading ? (

          <div className="py-24">
            <LoadingSpinner />
          </div>

        ) : (

          <div className="grid gap-8 p-10 lg:grid-cols-3">

            {plans.map((plan, index) => (
                            <button
                key={plan.id}
                onClick={() => setSelected(plan)}
                className={`relative overflow-hidden rounded-[28px] border-2 transition-all duration-300 text-left
                ${
                  selected?.id === plan.id
                    ? "border-[#047857] shadow-2xl scale-[1.03]"
                    : "border-[#ECE7DD] hover:border-[#047857]/40 hover:-translate-y-2 hover:shadow-xl"
                }`}
              >

                {labels[index] && (
                  <div className="absolute right-5 top-5 rounded-full bg-[#1C2520] px-3 py-1 text-[10px] font-bold tracking-[2px] text-white">
                    {labels[index]}
                  </div>
                )}

                <div
                  className={`bg-gradient-to-r ${gradients[index]} p-8 text-white`}
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                        {icons[index]}
                      </div>

                      <h3
                        className="mt-6 text-3xl"
                        style={{
                          fontFamily: "'Fraunces', serif",
                          fontWeight: 600,
                        }}
                      >
                        {plan.name}
                      </h3>

                    </div>

                    <div className="text-right">

                      <div className="text-5xl font-bold">
                        {plan.price}
                      </div>

                      <div className="mt-2 text-white/90">
                        DH
                      </div>

                    </div>

                  </div>

                </div>

                <div className="space-y-4 p-8">

                  <p className="text-[#6B7280]">
                    {plan.description}
                  </p>

                  <div className="space-y-3">

                    <div className="flex items-center gap-3">
                      <Check
                        size={18}
                        className="text-[#047857]"
                      />
                      <span>
                        Boost pendant {plan.duration_days} jours
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Check
                        size={18}
                        className="text-[#047857]"
                      />
                      <span>
                        Priorité dans les recherches
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Check
                        size={18}
                        className="text-[#047857]"
                      />
                      <span>
                        Badge Premium
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Check
                        size={18}
                        className="text-[#047857]"
                      />
                      <span>
                        Jusqu'à 5x plus de visibilité
                      </span>
                    </div>

                  </div>
                                    <div className="mt-8 border-t border-[#ECE7DD] pt-6">

                    <button
                      onClick={() => setSelected(plan)}
                      className={`h-14 w-full rounded-2xl font-semibold transition-all
                      ${
                        selected?.id === plan.id
                          ? "bg-[#047857] text-white shadow-lg"
                          : "bg-[#F4F4F4] text-[#1C2520] hover:bg-[#ECECEC]"
                      }`}
                    >
                      {selected?.id === plan.id
                        ? "Plan sélectionné"
                        : "Sélectionner"}
                    </button>

                  </div>

                </div>

              </button>

            ))}

          </div>

        )}

        {!loading && selected && (

          <div className="border-t border-[#ECE7DD] bg-[#FAFAFA] px-10 py-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="text-sm uppercase tracking-[3px] text-[#6B7280]">
                  Plan sélectionné
                </div>

                <div
                  className="mt-2 text-3xl text-[#1C2520]"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 600,
                  }}
                >
                  {selected.name}
                </div>

                <div className="mt-2 text-[#6B7280]">
                  {selected.description}
                </div>

              </div>

              <div className="text-right">

                <div className="text-5xl font-bold text-[#047857]">
                  {selected.price} DH
                </div>

                <div className="mt-2 text-[#6B7280]">
                  {selected.duration_days} jours
                </div>

              </div>

            </div>
                        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">

              <button
                onClick={() => onContinue(selected)}
                className="
                  flex-1
                  rounded-2xl
                  bg-gradient-to-r
                  from-[#047857]
                  to-[#059669]
                  px-8
                  py-4
                  text-lg
                  font-semibold
                  text-white
                  shadow-lg
                  transition
                  hover:scale-[1.02]
                "
              >
                Continuer vers le paiement
              </button>

              <button
                onClick={onClose}
                className="
                  rounded-2xl
                  border
                  border-[#D9D9D9]
                  px-8
                  py-4
                  font-semibold
                  text-[#374151]
                  transition
                  hover:bg-white
                "
              >
                Annuler
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}