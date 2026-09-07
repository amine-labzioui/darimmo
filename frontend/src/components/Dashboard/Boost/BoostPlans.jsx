import { Check, Crown } from "lucide-react";

const PLANS = [
  {
    id: 1,
    days: 7,
    price: 149,
    color: "border-[#F3D6B9]",
  },
  {
    id: 2,
    days: 15,
    price: 249,
    color: "border-[#E9C89B]",
    popular: true,
  },
  {
    id: 3,
    days: 30,
    price: 399,
    color: "border-[#C2622D]",
  },
];

export default function BoostPlans({
  selected,
  onSelect,
}) {
  return (
    <div className="grid md:grid-cols-3 gap-5">

      {PLANS.map((plan) => (

        <button
          key={plan.id}
          type="button"
          onClick={() => onSelect(plan)}
          className={`
            relative
            rounded-3xl
            border-2
            ${plan.color}
            bg-white
            p-7
            text-left
            transition-all
            hover:shadow-xl
            ${
              selected?.id === plan.id
                ? "ring-4 ring-[#C2622D]/20 scale-[1.02]"
                : ""
            }
          `}
        >

          {plan.popular && (

            <div className="absolute -top-3 left-1/2 -translate-x-1/2">

              <div className="px-4 py-1 rounded-full bg-[#C2622D] text-white text-xs flex items-center gap-1">

                <Crown size={14} />

                Le plus choisi

              </div>

            </div>

          )}

          <div className="text-4xl font-bold text-[#1C2520]">

            {plan.price}

            <span className="text-lg ml-1">
              DH
            </span>

          </div>

          <div className="mt-3 text-[#6B7280]">

            Boost pendant

          </div>

          <div className="text-2xl font-semibold mt-1">

            {plan.days} jours

          </div>

          <div className="mt-8 space-y-3">

            <Feature>
              Priorité dans les résultats
            </Feature>

            <Feature>
              Badge Boost
            </Feature>

            <Feature>
              Plus de visibilité
            </Feature>

            <Feature>
              Plus de contacts
            </Feature>

          </div>

        </button>

      ))}

    </div>
  );
}

function Feature({ children }) {
  return (
    <div className="flex items-center gap-2 text-sm">

      <Check
        size={16}
        className="text-[#047857]"
      />

      {children}

    </div>
  );
}