import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Download,
  Receipt,
  Home,
} from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const { isAgence } = useAuth();
  const dashboardBase = isAgence ? "/agence" : "/client";

  const transaction = params.get("transaction");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
  const verifyPayment = async () => {
    try {
      await api.post("/payments/simulate/", {
        transaction_id: transaction,
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (transaction) {
    verifyPayment();
  } else {
    setLoading(false);
  }
}, [transaction]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F2]">

        <div className="rounded-[30px] bg-white px-16 py-14 shadow-xl">

          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#047857] border-t-transparent" />

          <h2
            className="mt-8 text-center text-3xl text-[#1C2520]"
            style={{
              fontFamily: "'Fraunces', serif",
            }}
          >
            Vérification du paiement...
          </h2>

        </div>

      </div>
    );
  }

  if (!success) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center p-8">

        <div className="w-full max-w-3xl rounded-[36px] bg-white p-12 shadow-[0_30px_80px_rgba(0,0,0,.15)]">

          <div className="text-center">

            <XCircle
              size={90}
              className="mx-auto text-red-500"
            />

            <h1
              className="mt-8 text-5xl text-[#1C2520]"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
              }}
            >
              Paiement non confirmé
            </h1>

            <p className="mt-4 text-lg text-[#6B7280]">
              Nous n'avons pas pu vérifier ce paiement. Votre annonce n'a pas été modifiée.
            </p>

          </div>

          <Link
            to={`${dashboardBase}/annonces`}
            className="mt-10 flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#047857] font-semibold text-white transition hover:bg-[#065F46]"
          >
            <Home size={20} />
            Mes annonces
          </Link>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center p-8">

      <div className="w-full max-w-3xl rounded-[36px] bg-white p-12 shadow-[0_30px_80px_rgba(0,0,0,.15)]">

        <div className="text-center">

          <CheckCircle2
            size={90}
            className="mx-auto text-[#16A34A]"
          />

          <h1
            className="mt-8 text-5xl text-[#1C2520]"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
            }}
          >
            Paiement confirmé
          </h1>

          <p className="mt-4 text-lg text-[#6B7280]">
            Votre annonce Premium est maintenant activée.
          </p>

        </div>

        <div className="mt-12 rounded-[28px] bg-[#FAFAFA] p-8">

          <div className="flex justify-between border-b border-[#E5E5E5] pb-5">

            <span className="text-[#6B7280]">
              Transaction
            </span>

            <span className="font-semibold">
              {transaction}
            </span>

          </div>

          <div className="mt-5 flex justify-between border-b border-[#E5E5E5] pb-5">

            <span className="text-[#6B7280]">
              Statut
            </span>

            <span className="font-semibold text-[#16A34A]">
              Confirmé
            </span>

          </div>

          <div className="mt-5 flex justify-between border-b border-[#E5E5E5] pb-5">

            <span className="text-[#6B7280]">
              Paiement
            </span>

            <span className="font-semibold">
              CMI Maroc
            </span>

          </div>

          <div className="mt-5 flex justify-between">

            <span className="text-[#6B7280]">
              Date
            </span>

            <span className="font-semibold">
              {new Date().toLocaleDateString()}
            </span>

          </div>

        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">

          <button
  onClick={() => {
    const token = localStorage.getItem("darimmo_access_token");

    window.open(
      `${API_URL}/payments/invoice/${transaction}/?token=${token}`,
      "_blank"
    );
  }}
  className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-[#047857] font-semibold text-[#047857] transition hover:bg-[#047857] hover:text-white"
>
  <Download size={20} />
  Télécharger la facture
</button>

          <Link
            to={`${dashboardBase}/annonces`}
            className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#047857] font-semibold text-white transition hover:bg-[#065F46]"
          >
            <Home size={20} />
            Mes annonces
          </Link>

        </div>

      </div>

    </div>
  );
}