import { useEffect, useState } from "react";
import {
  Users,
  Home,
  Eye,
  CheckCircle2,
  Clock,
  TrendingUp,
  CalendarCheck,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { analyticsService } from "../../services/analyticsService";
import LoadingSpinner from "../Shared/LoadingSpinner";

const COLORS = ["#047857", "#C2622D", "#0B7EA3", "#E8A020", "#8C9189"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getAdminStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage label="Chargement des statistiques globales…" />;
  if (!stats) return <p className="text-[#5C6961]">Impossible de charger les statistiques.</p>;

  const cards = [
  {
    icon: Users,
    label: "Utilisateurs",
    value: stats.total_users,
    color: "#047857",
  },
  {
    icon: Home,
    label: "Annonces",
    value: stats.total_annonces,
    color: "#C2622D",
  },
  {
    icon: CheckCircle2,
    label: "Annonces publiées",
    value: stats.annonces_published,
    color: "#0B7EA3",
  },
  {
    icon: Clock,
    label: "Annonces en attente",
    value: stats.annonces_pending,
    color: "#E8A020",
  },
  {
    icon: CalendarCheck,
    label: "Demandes de visite",
    value: stats.visit_requests_count,
    color: "#047857",
  },
  {
    icon: TrendingUp,
    label: "Demandes en attente",
    value: stats.visit_pending_count,
    color: "#C2622D",
  },
];

  const userPieData = [
    { name: "Clients", value: stats.total_clients },
    { name: "Agences", value: stats.total_agences },
  ];

  const annoncePieData = [
    { name: "Publiées", value: stats.annonces_published },
    { name: "En attente", value: stats.annonces_pending },
    { name: "Vendues", value: stats.annonces_sold },
    { name: "Louées", value: stats.annonces_rented },
    { name: "Archivées", value: stats.annonces_archived ?? 0 },
  ];

  return (
    <div>
      <h1
        className="text-2xl text-[#1C2520] mb-1"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        Tableau de bord administrateur
      </h1>
      <p className="text-[#5C6961] text-sm mb-6">Vue d'ensemble de la plateforme DarImmo</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-[#E6DFD0] shadow-sm p-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5" style={{ backgroundColor: `${card.color}1A` }}>
              <card.icon size={16} style={{ color: card.color }} />
            </div>
            <p className="text-2xl font-semibold text-[#1C2520]">{card.value}</p>
            <p className="text-sm text-[#5C6961] mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ChartCard title="Répartition des utilisateurs" data={userPieData} />
        <ChartCard title="Statut des annonces" data={annoncePieData} />
      </div>
    </div>
  );
}

// Étiquette et trait d'une part du graphique : rien pour une part à 0.
function renderSliceLabel({ x, y, value, fill, textAnchor }) {
  if (!value) return null;
  return (
    <text x={x} y={y} fill={fill} textAnchor={textAnchor} dominantBaseline="central" fontSize={12}>
      {value}
    </text>
  );
}

function renderSliceLabelLine({ points, stroke, value }) {
  if (!value || !points) return null;
  const [start, end] = points;
  return <path d={`M${start.x},${start.y}L${end.x},${end.y}`} stroke={stroke} fill="none" />;
}

function ChartCard({ title, data }) {
  // Chaque entrée garde sa couleur ; les parts à 0 ne sont pas dessinées,
  // mais la légende liste toutes les entrées.
  const colored = data.map((entry, index) => ({
    ...entry,
    fill: COLORS[index % COLORS.length],
  }));
  const slices = colored.filter((entry) => entry.value > 0);
  const legendPayload = colored.map((entry) => ({
    value: entry.name,
    type: "rect",
    color: entry.fill,
  }));

  return (
    <div className="bg-white rounded-xl border border-[#E6DFD0] shadow-sm p-5">
      <h2 className="text-base font-semibold text-[#1C2520] mb-3">{title}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={slices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={renderSliceLabel} labelLine={renderSliceLabelLine}>
            {slices.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} stroke="none" />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E6DFD0", fontSize: 13 }} />
          <Legend payload={legendPayload} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
