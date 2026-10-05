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

// L'API est paginée : on lit toutes les pages pour que les totaux
// portent sur l'ensemble des transactions, pas sur la première page.
async function fetchAllTransactions() {
  const all = [];
  let page = 1;
  while (true) {
    const { data } = await api.get("/payments/transactions/", { params: { page } });
    if (!data.results) return data;
    all.push(...data.results);
    if (!data.next) return all;
    page += 1;
  }
}

const PROVIDER_LABELS = {
  cmi: "CMI",
  stripe: "Stripe",
};

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { value: "all", label: "Toutes" },
  { value: "succeeded", label: "Réussies" },
  { value: "pending", label: "En attente" },
  { value: "failed", label: "Échouées" },
  { value: "refunded", label: "Remboursées" },
];

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAllTransactions()
      .then(setTransactions)
      .catch(() => {
        setTransactions([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage label="Chargement des transactions…" />;

  if (loadError) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Chargement impossible"
        description="Les données n'ont pas pu être chargées. Vérifiez que le serveur est démarré, puis rechargez la page."
      />
    );
  }

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

  // Filtre et pagination côté client (toutes les transactions sont déjà chargées).
  // « Échouées » et « Remboursées » ne sont proposés que si ce statut existe.
  const filters = STATUS_FILTERS.filter(
    (f) =>
      ["all", "succeeded", "pending"].includes(f.value) ||
      transactions.some((t) => t.status === f.value)
  );

  const filtered =
    statusFilter === "all"
      ? transactions
      : transactions.filter((t) => t.status === statusFilter);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function changeFilter(value) {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">

    <div>

        <h1
            className="text-2xl font-semibold text-[#1C2520]"
            style={{ fontFamily: "'Fraunces', serif" }}
        >
            Transactions
        </h1>

        <p className="text-[#6B7280] text-sm mt-1">
            Historique des paiements Premium
        </p>

    </div>

</div>

<div className="grid grid-cols-4 gap-4 mb-6">

    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">

        <div className="flex justify-between">

            <div>

                <p className="text-xs text-gray-500">
                    Revenu
                </p>

                <h2 className="text-2xl font-bold text-[#047857] mt-1">
                    {formatPrice(totalRevenue)} MAD
                </h2>

            </div>

            <DollarSign size={20} className="text-[#047857]" />

        </div>

    </div>

    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">

        <div className="flex justify-between">

            <div>

                <p className="text-xs text-gray-500">
                    Transactions
                </p>

                <h2 className="text-2xl font-bold mt-1">
                    {transactions.length}
                </h2>

            </div>

            <CreditCard size={20} className="text-[#047857]" />

        </div>

    </div>

    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">

        <div className="flex justify-between">

            <div>

                <p className="text-xs text-gray-500">
                    Réussies
                </p>

                <h2 className="text-2xl font-bold text-green-600 mt-1">
                    {successCount}
                </h2>

            </div>

            <CheckCircle2 size={20} className="text-green-600" />

        </div>

    </div>

    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">

        <div className="flex justify-between">

            <div>

                <p className="text-xs text-gray-500">
                    En attente
                </p>

                <h2 className="text-2xl font-bold text-amber-500 mt-1">
                    {pendingCount}
                </h2>

            </div>

            <Clock3 size={20} className="text-amber-500" />

        </div>

    </div>

</div>

      <div className="flex flex-wrap gap-1 mb-4 bg-white rounded-lg border border-[#E5E7EB] p-1 w-fit">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => changeFilter(f.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-[#047857] text-white"
                : "text-[#5C6961] hover:bg-[#F5F0E8]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="bg-[#F9FAFB]">
            <tr className="border-b border-[#E6DFD0] text-[12.5px] text-[#8C9189]">
              <th className="px-4 py-2.5 font-medium">Utilisateur</th>
              <th className="px-4 py-2.5 font-medium">Annonce</th>
              <th className="px-4 py-2.5 font-medium">Formule</th>
              <th className="px-4 py-2.5 font-medium">Fournisseur</th>
              <th className="px-4 py-2.5 font-medium">Montant</th>
              <th className="px-4 py-2.5 font-medium">Statut</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[#8C9189]">
                  Aucune transaction pour ce statut.
                </td>
              </tr>
            )}
            {visible.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-[#FAFAFA] transition">
                <td className="px-4 py-2.5 text-[#1C2520]">{t.user}</td>
                <td className="px-4 py-2.5 text-[#3F4A43]">{t.annonce_title || "—"}</td>
                <td className="px-4 py-2.5 text-[#3F4A43]">{t.boost_plan_name || "—"}</td>
                <td className="px-4 py-2.5 text-[#3F4A43]">{PROVIDER_LABELS[t.provider] || t.provider}</td>
                <td className="px-4 py-2.5 font-semibold text-[#047857]">{formatPrice(t.amount)} MAD</td>
                <td className="px-4 py-2.5">
                  <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold
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
                <td className="px-4 py-2.5 text-[#8C9189]">{formatDateTime(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-[#5C6961]">
        <span>
          {filtered.length} transaction(s) · Page {currentPage} sur {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white font-medium hover:bg-[#F5F0E8] disabled:opacity-50 disabled:hover:bg-white"
          >
            Précédent
          </button>
          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= pageCount}
            className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white font-medium hover:bg-[#F5F0E8] disabled:opacity-50 disabled:hover:bg-white"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
