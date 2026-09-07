import { CheckCircle2 } from "lucide-react";

export default function BoostSuccess({
  open,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5">

      <div className="w-full max-w-md rounded-[30px] bg-white p-10 text-center shadow-2xl">

        <div className="w-24 h-24 rounded-full bg-[#ECFDF5] mx-auto flex items-center justify-center">

          <CheckCircle2
            size={48}
            className="text-[#047857]"
          />

        </div>

        <h2
          className="mt-8 text-3xl text-[#1C2520]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          Paiement confirmé
        </h2>

        <p className="mt-4 text-[#6B7280] leading-7">

          Votre annonce est maintenant boostée.

          <br />

          Elle apparaîtra en priorité dans les résultats de recherche.

        </p>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-[#047857] text-white py-3 font-medium hover:bg-[#035f46]"
        >
          Continuer
        </button>

      </div>

    </div>
  );
}