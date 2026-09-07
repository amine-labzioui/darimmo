import { useState } from "react";
import {
  X,
  CreditCard,
  Lock,
  ShieldCheck,
} from "lucide-react";

export default function PaymentModal({
  open,
  onClose,
  plan,
  onSelectProvider,
}) {
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  if (!open || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">

      <div className="w-full max-w-2xl overflow-hidden rounded-[36px] bg-white shadow-[0_35px_90px_rgba(0,0,0,.25)]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-[#ECE7DD] px-10 py-8">

          <div>

            <span className="rounded-full bg-[#F3FBF7] px-4 py-2 text-xs font-semibold uppercase tracking-[3px] text-[#047857]">
              Paiement sécurisé
            </span>

            <h2
              className="mt-4 text-4xl text-[#1C2520]"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
              }}
            >
              Paiement CMI
            </h2>

            <p className="mt-2 text-[#6B7280]">
              Toutes les transactions sont protégées.
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X />
          </button>

        </div>

        {/* Body */}

        <div className="grid gap-10 p-10 lg:grid-cols-2">
                    {/* Carte bancaire */}

          <div>

            <div className="rounded-[28px] bg-gradient-to-br from-[#024635] via-[#047857] to-[#0F766E] p-7 text-white shadow-xl">

              <div className="flex items-center justify-between">

                <span className="text-sm tracking-[3px] uppercase opacity-90">
                  CMI Maroc
                </span>

                <CreditCard size={28} />

              </div>

              <div className="mt-10 text-2xl tracking-[4px] font-semibold">
                {number || "**** **** **** ****"}
              </div>

              <div className="mt-8 flex justify-between">

                <div>

                  <div className="text-xs opacity-70">
                    Titulaire
                  </div>

                  <div className="mt-1 font-medium">
                    {holder || "Votre Nom"}
                  </div>

                </div>

                <div>

                  <div className="text-xs opacity-70">
                    Expiration
                  </div>

                  <div className="mt-1 font-medium">
                    {expiry || "MM/YY"}
                  </div>

                </div>

              </div>

            </div>

            <div className="mt-8 space-y-5">

              <div>

                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Nom du titulaire
                </label>

                <input
                  value={holder}
                  onChange={(e) => setHolder(e.target.value)}
                  placeholder="Nom complet"
                  className="h-14 w-full rounded-2xl border border-[#D8D8D8] px-5 outline-none transition focus:border-[#047857]"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Numéro de carte
                </label>

                <input
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="h-14 w-full rounded-2xl border border-[#D8D8D8] px-5 outline-none transition focus:border-[#047857]"
                />

              </div>
                            <div className="grid grid-cols-2 gap-5">

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#374151]">
                    Date d'expiration
                  </label>

                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="h-14 w-full rounded-2xl border border-[#D8D8D8] px-5 outline-none transition focus:border-[#047857]"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#374151]">
                    CVV
                  </label>

                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="h-14 w-full rounded-2xl border border-[#D8D8D8] px-5 outline-none transition focus:border-[#047857]"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* Résumé */}

          <div>

            <div className="rounded-[28px] border border-[#ECE7DD] bg-[#FAFAFA] p-8">

              <div className="flex items-center gap-3">

                <ShieldCheck
                  size={24}
                  className="text-[#047857]"
                />

                <span className="font-semibold text-[#1C2520]">
                  Paiement sécurisé CMI
                </span>

              </div>

              <div className="mt-8 space-y-5">

                <div className="flex justify-between">

                  <span className="text-[#6B7280]">
                    Formule
                  </span>

                  <span className="font-semibold">
                    {plan.name}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-[#6B7280]">
                    Durée
                  </span>

                  <span className="font-semibold">
                    {plan.duration_days} jours
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-[#6B7280]">
                    TVA
                  </span>

                  <span className="font-semibold">
                    Incluse
                  </span>

                </div>

                <div className="border-t border-[#E5E5E5] pt-5">

                  <div className="flex items-center justify-between">

                    <span className="text-lg font-semibold">
                      Total
                    </span>

                    <span className="text-4xl font-bold text-[#047857]">
                      {plan.price} DH
                    </span>

                  </div>

                </div>

              </div>
                            <div className="mt-8 rounded-2xl bg-[#F3FBF7] p-5">

                <div className="flex items-start gap-3">

                  <Lock
                    size={20}
                    className="mt-1 text-[#047857]"
                  />

                  <div>

                    <div className="font-semibold text-[#1C2520]">
                      Paiement sécurisé
                    </div>

                    <div className="mt-1 text-sm leading-6 text-[#6B7280]">
                      Vos informations bancaires sont protégées.
                      Cette démonstration utilise le simulateur CMI de DarImmo.
                    </div>

                  </div>

                </div>

              </div>

              <button
                onClick={() => onSelectProvider("cmi")}
                className="
                  mt-8
                  flex
                  h-16
                  w-full
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-r
                  from-[#047857]
                  to-[#059669]
                  text-lg
                  font-semibold
                  text-white
                  shadow-lg
                  transition
                  hover:scale-[1.02]
                "
              >
                Payer {plan.price} DH avec CMI
              </button>

              <button
                onClick={onClose}
                className="
                  mt-4
                  h-14
                  w-full
                  rounded-2xl
                  border
                  border-[#D8D8D8]
                  font-semibold
                  text-[#374151]
                  transition
                  hover:bg-[#F8F8F8]
                "
              >
                Annuler
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}