import { useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";
import { formatPrice, formatDateTime } from "../../utils/formatters";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";

const STATUS_COLORS = {
  pending: "amber",
  succeeded: "green",
  failed: "red",
  refunded: "gray",
};

const STATUS_LABELS = {
  pending: "En attente",
  succeeded: "Réussie",
  failed: "Échouée",
  refunded: "Remboursée",
};

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/payments/transactions/")
      .then(({ data }) => setTransactions(data.results || data))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage label="Chargement des transactions…" />;

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Aucune transaction"
        description="Les paiements de boost d'annonces apparaîtront ici."
      />
    );
  }

const totalRevenue = transactions
    .filter((t) => t.status === "succeeded")
    .reduce((sum, t) => sum + Number(t.amount), 0);

const successCount = transactions.filter(
    (t) => t.status === "succeeded"
).length;

const pendingCount = transactions.filter(
    (t) => t.status === "pending"
).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">

    <div>

        <h1
            className="text-3xl font-semibold text-[#1C2520]"
            style={{ fontFamily: "'Fraunces', serif" }}
        >
            Transactions
        </h1>

        <p className="text-[#6B7280] mt-1">
            Historique des paiements Premium
        </p>

    </div>

</div>

<div className="grid grid-cols-4 gap-5 mb-8">

    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">

        <div className="flex justify-between">

            <div>

                <p className="text-sm text-gray-500">
                    Revenu
                </p>

                <h2 className="text-2xl font-bold text-[#047857] mt-2">
                    {formatPrice(totalRevenue)} MAD
                </h2>

            </div>

            <DollarSign className="text-[#047857]" />

        </div>

    </div>

    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">

        <div className="flex justify-between">

            <div>

                <p className="text-sm text-gray-500">
                    Transactions
                </p>

                <h2 className="text-2xl font-bold mt-2">
                    {transactions.length}
                </h2>

            </div>

            <CreditCard className="text-[#047857]" />

        </div>

    </div>

    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">

        <div className="flex justify-between">

            <div>

                <p className="text-sm text-gray-500">
                    Réussies
                </p>

                <h2 className="text-2xl font-bold text-green-600 mt-2">
                    {successCount}
                </h2>

            </div>

            <CheckCircle2 className="text-green-600" />

        </div>

    </div>

    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">

        <div className="flex justify-between">

            <div>

                <p className="text-sm text-gray-500">
                    En attente
                </p>

                <h2 className="text-2xl font-bold text-amber-500 mt-2">
                    {pendingCount}
                </h2>

            </div>

            <Clock3 className="text-amber-500" />

        </div>

    </div>

</div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-[#F9FAFB]">
            <tr className="border-b border-[#E6DFD0] text-[12.5px] text-[#8C9189]">
              <th className="px-5 py-3 font-medium">Utilisateur</th>
              <th className="px-5 py-3 font-medium">Annonce</th>
              <th className="px-5 py-3 font-medium">Formule</th>
              <th className="px-5 py-3 font-medium">Fournisseur</th>
              <th className="px-5 py-3 font-medium">Montant</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-[#FAFAFA] transition">
                <td className="px-5 py-3.5 text-[#1C2520]">{t.user}</td>
                <td className="px-5 py-3.5 text-[#3F4A43]">{t.annonce_title || "—"}</td>
                <td className="px-5 py-3.5 text-[#3F4A43]">{t.boost_plan_name || "—"}</td>
                <td className="px-5 py-3.5 text-[#3F4A43] capitalize">{t.provider}</td>
                <td className="px-5 py-4 font-bold text-[#047857]">{formatPrice(t.amount)} MAD</td>
                <td className="px-5 py-3.5">
                  <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold
                  ${
                  t.status==="succeeded"
                  ?"bg-green-100 text-green-700"
                  :t.status==="pending"
                  ?"bg-amber-100 text-amber-700"
                  :t.status==="failed"
                  ?"bg-red-100 text-red-700"
                  :"bg-gray-100 text-gray-700"
                  }`}>
                  {
                  t.status==="succeeded"
                  &&<CheckCircle2 size={13}/>
                  }

                  {
                  t.status==="pending"
                  &&<Clock3 size={13}/>
                  }

                  {STATUS_LABELS[t.status]}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[#8C9189]">{formatDateTime(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
