import { X, CreditCard, ShieldCheck } from "lucide-react";
import BoostPlans from "./BoostPlans";

export default function BoostPaymentModal({
  open,
  onClose,
  selectedPlan,
  setSelectedPlan,
  onContinue,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5">

      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden">

        {/* HEADER */}

        <div className="flex items-center justify-between px-8 py-6 border-b border-[#ECE7DD]">

          <div>

            <h2
              className="text-3xl text-[#1C2520]"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
              }}
            >
              Booster votre annonce
            </h2>

            <p className="text-[#6B7280] mt-2">
              Choisissez la durée de votre boost.
            </p>

          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center"
          >
            <X size={20} />
          </button>

        </div>

        {/* BODY */}

        <div className="p-8">

          <BoostPlans
            selected={selectedPlan}
            onSelect={setSelectedPlan}
          />

          {selectedPlan && (

            <div className="mt-8 rounded-2xl bg-[#FAF8F3] border border-[#ECE7DD] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[#6B7280]">
                    Pack sélectionné
                  </p>

                  <h3 className="text-2xl font-semibold mt-2">

                    {selectedPlan.days} jours

                  </h3>

                </div>

                <div className="text-right">

                  <p className="text-[#6B7280]">
                    Total
                  </p>

                  <div className="text-4xl font-bold text-[#C2622D]">

                    {selectedPlan.price} DH

                  </div>

                </div>

              </div>

            </div>

          )}

        </div>

        {/* FOOTER */}

        <div className="border-t border-[#ECE7DD] px-8 py-6 flex items-center justify-between">

          <div className="flex items-center gap-3 text-[#6B7280]">

            <ShieldCheck
              size={18}
              className="text-[#047857]"
            />

            Paiement sécurisé

          </div>

          <button
            disabled={!selectedPlan}
            onClick={onContinue}
            className="px-8 py-3 rounded-xl bg-[#C2622D] text-white font-medium hover:bg-[#A84F22] disabled:opacity-40"
          >
            <CreditCard
              size={18}
              className="inline mr-2"
            />

            Continuer vers le paiement

          </button>

        </div>

      </div>

    </div>
  );
}