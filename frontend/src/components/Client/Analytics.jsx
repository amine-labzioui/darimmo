import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Heart,
  MessageSquare,
  Home,
  Trophy,
  BarChart3,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

import { analyticsService } from "../../services/analyticsService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";

const COLORS = [
  "#047857",
  "#D97706",
  "#2563EB",
  "#7C3AED",
  "#DC2626",
  "#0891B2",
  "#65A30D",
  "#EA580C",
];

export default function Analytics() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await analyticsService.getMyAnnoncesStats();
      setStats(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    return stats.reduce(
      (acc, item) => ({
        views: acc.views + item.total_views,
        favorites: acc.favorites + item.favorites_count,
        messages: acc.messages + item.messages_count,
      }),
      {
        views: 0,
        favorites: 0,
        messages: 0,
      }
    );
  }, [stats]);

  const topAnnonce = useMemo(() => {
    if (!stats.length) return null;

    return [...stats].sort(
      (a, b) => b.total_views - a.total_views
    )[0];
  }, [stats]);

  const chartData = useMemo(() => {
    return stats.map((item) => ({
      id: item.annonce_id,
      title: item.title,
      short:
        item.title.length > 15
          ? item.title.substring(0, 15) + "..."
          : item.title,
      vues: item.total_views,
      favoris: item.favorites_count,
      messages: item.messages_count,
    }));
  }, [stats]);

  const pieData = useMemo(() => {
    return stats
      .filter((x) => x.total_views > 0)
      .map((item) => ({
        name:
          item.title.length > 18
            ? item.title.substring(0, 18) + "..."
            : item.title,
        value: item.total_views,
      }));
  }, [stats]);

  if (loading)
    return (
      <LoadingSpinner
        fullPage
        label="Chargement des statistiques..."
      />
    );

  if (!stats.length)
    return (
      <EmptyState
        icon={BarChart3}
        title="Aucune statistique disponible"
        description="Publiez votre première annonce pour commencer à suivre ses performances."
      />
    );

  return (
    <div className="space-y-6">

      <div>
        <h1
          className="text-2xl text-[#1C2520]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          Tableau de bord
        </h1>

        <p className="text-[#5C6961] text-sm mt-1">
          Visualisez les performances de toutes vos annonces.
        </p>
      </div>

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-4">

        <StatCard
          icon={Eye}
          label="Vues"
          value={totals.views}
          color="#047857"
        />

        <StatCard
          icon={Heart}
          label="Favoris"
          value={totals.favorites}
          color="#DC2626"
        />

        <StatCard
          icon={MessageSquare}
          label="Conversations"
          value={totals.messages}
          color="#2563EB"
        />

        <StatCard
          icon={Home}
          label="Annonces"
          value={stats.length}
          color="#7C3AED"
        />

      </div>

    {/* Graph */}
    <div className="bg-white rounded-xl shadow-sm border border-[#ECE7DB] p-5">

      <h2 className="text-lg font-semibold text-[#1C2520] mb-4">
        Nombre de vues par annonce
      </h2>

      <ResponsiveContainer
        width="100%"
        height={280}
      >
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="short" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="vues"
            fill="#047857"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

    </div>

    {/* Tableau */}
    <div className="bg-white rounded-xl shadow-sm border border-[#ECE7DB] overflow-hidden">

      <div className="px-5 py-3.5 border-b">
        <h2 className="font-semibold text-lg">
          Détail des annonces
        </h2>
      </div>

      <table className="w-full text-sm">

        <thead className="bg-[#F8F7F3]">

          <tr className="text-left">

            <th className="px-5 py-2.5">
              Annonce
            </th>

            <th className="px-5 py-2.5">
              Vues
            </th>

            <th className="px-5 py-2.5">
              Conversations
            </th>

            <th className="px-5 py-2.5">
              Favoris
            </th>

          </tr>

        </thead>

        <tbody>

          {stats.map((item) => (

            <tr
              key={item.annonce_id}
              className="border-t hover:bg-[#FAFAF8]"
            >

              <td className="px-5 py-3 font-medium">
                {item.title}
              </td>

              <td className="px-5 py-3">

              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 font-semibold">

              👁{item.total_views}

              </span>

              </td>

              <td className="px-5 py-3">

              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-semibold">
 
              💬 {item.messages_count}

              </span>

              </td>

              <td className="px-5 py-3">

              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-red-100 text-red-600 font-semibold">

              ❤️ {item.favorites_count}

              </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </div>
);


function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-xl
        bg-white
        border
        border-[#ECE7DB]
        shadow-sm
        hover:shadow-md
        transition-all
        duration-300
        hover:-translate-y-1
        p-4
      "
    >
      <div
        className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
        style={{
          background: color,
          transform: "translate(30%,-30%)",
        }}
      />

      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{
          background: `${color}20`,
        }}
      >
        <Icon
          size={18}
          style={{
            color,
          }}
        />
      </div>

      <p className="text-[#6B7280] text-xs font-medium">
        {label}
      </p>

      <h3 className="text-2xl font-bold text-[#1C2520] mt-1">
        {value}
      </h3>
    </div>
  );
}
}
