import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CreditCard,
  ShieldCheck,
  Lock,
} from "lucide-react";

import api from "../services/api";
import { useNotification } from "../hooks/useNotification";

export default function CMISimulator() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { pushToast } = useNotification();

  const transactionId = params.get("transaction");

  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!holder || !number || !expiry || !cvv) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);

      await new Promise((r) => setTimeout(r, 1800));

      await api.post("/payments/simulate/", {
        transaction_id: transactionId,
      });

      navigate(`/paiement/succes?transaction=${transactionId}`);
    } catch (err) {
      console.error(err.response?.data);
      pushToast({
        type: "error",
        title: "Le paiement n'a pas pu être effectué",
        message: "Veuillez réessayer dans un instant.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center p-8">

      <div className="w-full max-w-6xl rounded-[36px] overflow-hidden bg-white shadow-[0_35px_90px_rgba(0,0,0,.20)]">

        <div className="grid lg:grid-cols-2">
                  {/* LEFT */}

          <div className="bg-gradient-to-br from-[#024635] via-[#047857] to-[#0E7490] p-10 text-white">

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">

              <ShieldCheck size={18} />

              Paiement sécurisé CMI

            </div>

            <h1 className="mt-8 text-4xl font-semibold leading-tight">
              Centre Monétique Interbancaire
            </h1>

            <p className="mt-5 text-lg text-white/80 leading-8">
              Paiement sécurisé par carte bancaire marocaine.
            </p>

            <div className="mt-12 rounded-[30px] bg-white/10 p-8 backdrop-blur">

              <div className="flex items-center justify-between">

                <span className="text-sm tracking-[4px] uppercase">
                  Carte bancaire
                </span>

                <CreditCard size={30} />

              </div>

              <div className="mt-10 text-3xl tracking-[5px] font-semibold">

                {number || "**** **** **** ****"}

              </div>

              <div className="mt-10 flex justify-between">

                <div>

                  <div className="text-xs uppercase opacity-70">
                    Titulaire
                  </div>

                  <div className="mt-2 font-medium">
                    {holder || "Nom complet"}
                  </div>

                </div>

                <div>

                  <div className="text-xs uppercase opacity-70">
                    Expire
                  </div>

                  <div className="mt-2 font-medium">
                    {expiry || "MM/YY"}
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="p-10">

            <h2 className="text-3xl font-semibold text-[#1C2520]">
              Informations de paiement
            </h2>

            <p className="mt-3 text-[#6B7280]">
              Veuillez saisir les informations de votre carte bancaire.
            </p>

            <div className="mt-8 space-y-6">
                            <div>

                <label className="mb-2 block font-medium text-[#374151]">
                  Nom du titulaire
                </label>

                <input
                  type="text"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value)}
                  placeholder="Ex : Anas El Idrissi"
                  className="h-14 w-full rounded-2xl border border-[#D8D8D8] px-5 outline-none transition focus:border-[#047857]"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium text-[#374151]">
                  Numéro de carte
                </label>

                <input
                  type="text"
                  maxLength={19}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="h-14 w-full rounded-2xl border border-[#D8D8D8] px-5 outline-none transition focus:border-[#047857]"
                />

              </div>

              <div className="grid grid-cols-2 gap-5">

                <div>

                  <label className="mb-2 block font-medium text-[#374151]">
                    Date d'expiration
                  </label>

                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/AA"
                    className="h-14 w-full rounded-2xl border border-[#D8D8D8] px-5 outline-none transition focus:border-[#047857]"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium text-[#374151]">
                    CVV
                  </label>

                  <input
                    type="password"
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="***"
                    className="h-14 w-full rounded-2xl border border-[#D8D8D8] px-5 outline-none transition focus:border-[#047857]"
                  />

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

                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                      Vos données bancaires sont protégées.
                      Cette plateforme utilise le simulateur officiel CMI
                      pour démontrer le processus de paiement.
                    </p>

                  </div>

                </div>

              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
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
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Traitement du paiement..."
                  : "Payer avec CMI"}
              </button>

              <button
  onClick={() => navigate(-1)}
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
