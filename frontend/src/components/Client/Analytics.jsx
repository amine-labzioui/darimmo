import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Heart,
  MessageSquare,
  Home,
  Trophy,
  TrendingUp,
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
    <div className="space-y-8">

      <div>
        <h1
          className="text-3xl text-[#1C2520]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          Tableau de bord
        </h1>

        <p className="text-[#5C6961] mt-2">
          Visualisez les performances de toutes vos annonces.
        </p>
      </div>

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5">

        <StatCard
          icon={Eye}
          title="Vues"
          value={totals.views}
          color="emerald"
        />

        <StatCard
          icon={Heart}
          title="Favoris"
          value={totals.favorites}
          color="orange"
        />

        <StatCard
          icon={MessageSquare}
          title="Messages"
          value={totals.messages}
          color="blue"
        />

        <StatCard
          icon={Home}
          title="Annonces"
          value={stats.length}
          color="violet"
        />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <StatCard
        icon={Eye}
        label="Vues"
        value={totals.views}
        color="#047857"
      />

      <StatCard
        icon={MessageSquare}
        label="Messages"
        value={totals.messages}
        color="#2563EB"
      />

      <StatCard
        icon={Heart}
        label="Favoris"
        value={totals.favorites}
        color="#DC2626"
      />

    </div>

    {/* Graph */}
    <div className="bg-white rounded-3xl shadow-sm border border-[#ECE7DB] p-6">

      <h2 className="text-lg font-semibold text-[#1C2520] mb-5">
        Nombre de vues par annonce
      </h2>

      <ResponsiveContainer
        width="100%"
        height={360}
      >
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

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
    <div className="bg-white rounded-3xl shadow-sm border border-[#ECE7DB] overflow-hidden">

      <div className="px-6 py-5 border-b">
        <h2 className="font-semibold text-lg">
          Détail des annonces
        </h2>
      </div>

      <table className="w-full">

        <thead className="bg-[#F8F7F3]">

          <tr className="text-left">

            <th className="px-6 py-4">
              Annonce
            </th>

            <th className="px-6 py-4">
              Vues
            </th>

            <th className="px-6 py-4">
              Messages
            </th>

            <th className="px-6 py-4">
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

              <td className="px-6 py-5 font-medium">
                {item.title}
              </td>

              <td className="px-6 py-5">

              <span className="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">

              👁{item.total_views}

              </span>

              </td>

              <td className="px-6 py-5">

              <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
 
              💬 {item.messages_count}

              </span>

              </td>

              <td className="px-6 py-5">

              <span className="inline-flex px-3 py-1 rounded-full bg-red-100 text-red-600 font-semibold">

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
        rounded-3xl
        bg-white
        border
        border-[#ECE7DB]
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-300
        hover:-translate-y-1
        p-6
      "
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
        style={{
          background: color,
          transform: "translate(30%,-30%)",
        }}
      />

      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: `${color}20`,
        }}
      >
        <Icon
          size={24}
          style={{
            color,
          }}
        />
      </div>

      <p className="text-[#6B7280] text-sm font-medium">
        {label}
      </p>

      <h3 className="text-4xl font-bold text-[#1C2520] mt-2">
        {value}
      </h3>

      <div className="mt-5 flex items-center gap-2">
        <TrendingUp
          size={16}
          color={color}
        />

        <span
          className="text-sm font-medium"
          style={{
            color,
          }}
        >
          Performance
        </span>
      </div>
    </div>
  );
}
{/* Top annonce */}

{topAnnonce && (
  <div className="grid lg:grid-cols-2 gap-6">

    <div className="bg-gradient-to-r from-[#047857] to-[#0f9b6d] rounded-3xl text-white p-7 shadow-xl">

      <div className="flex items-center gap-3 mb-5">

        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
          <Trophy size={28} />
        </div>

        <div>

          <p className="text-sm opacity-80">
            Meilleure annonce
          </p>

          <h2 className="text-2xl font-bold">
            {topAnnonce.title}
          </h2>

        </div>

      </div>

      <div className="grid grid-cols-3 gap-5 mt-8">

        <div>

          <p className="opacity-80 text-sm">
            Vues
          </p>

          <h3 className="text-3xl font-bold">
            {topAnnonce.total_views}
          </h3>

        </div>

        <div>

          <p className="opacity-80 text-sm">
            Favoris
          </p>

          <h3 className="text-3xl font-bold">
            {topAnnonce.favorites_count}
          </h3>

        </div>

        <div>

          <p className="opacity-80 text-sm">
            Messages
          </p>

          <h3 className="text-3xl font-bold">
            {topAnnonce.messages_count}
          </h3>

        </div>

      </div>

    </div>

    <div className="bg-white rounded-3xl border border-[#ECE7DB] shadow-sm p-7">

      <h2 className="text-xl font-semibold mb-6 text-[#1C2520]">
        Répartition des vues
      </h2>

      <ResponsiveContainer
        width="100%"
        height={260}
      >

        <PieChart>

          <Pie
            data={pieData}
            dataKey="value"
            outerRadius={95}
            innerRadius={55}
            paddingAngle={4}
          >

            {pieData.map((entry, index) => (

              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />

            ))}

          </Pie>

          <Tooltip />

        </PieChart>

      </ResponsiveContainer>

    </div>

  </div>
)}}
