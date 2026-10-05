import { useEffect, useState } from "react";
import { Search, ShieldCheck, Ban, RotateCcw } from "lucide-react";
import api from "../../services/api";
import { useNotification } from "../../hooks/useNotification";
import { useAuth } from "../../hooks/useAuth";
import { USER_ROLES } from "../../utils/constants";
import { formatDate } from "../../utils/formatters";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";

export default function UserManagement() {
  const { pushToast } = useNotification();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setLoadError(false);
    try {
      const { data } = await api.get("/admin-dashboard/users/");
      const list = data.results || data;
      setUsers(list);
      // L'API est paginée : le total vient de `count`, pas de la page chargée.
      setTotal(data.count ?? list.length);
    } catch {
      setUsers([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSuspend(id) {
    try {
      await api.post(`/admin-dashboard/users/${id}/suspendre/`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: false } : u)));
      pushToast({ type: "success", title: "Utilisateur suspendu" });
    } catch {
      pushToast({ type: "error", title: "Une erreur est survenue" });
    }
  }

  async function handleReactivate(id) {
    try {
      await api.post(`/admin-dashboard/users/${id}/reactiver/`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: true } : u)));
      pushToast({ type: "success", title: "Utilisateur réactivé" });
    } catch {
      pushToast({ type: "error", title: "Une erreur est survenue" });
    }
  }

  async function handleVerify(id) {
    try {
      await api.post(`/admin-dashboard/users/${id}/verifier/`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_verified: true } : u)));
      pushToast({ type: "success", title: "Utilisateur vérifié" });
    } catch {
      pushToast({ type: "error", title: "Une erreur est survenue" });
    }
  }

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner fullPage label="Chargement des utilisateurs…" />;

  if (loadError) {
    return (
      <EmptyState
        title="Chargement impossible"
        description="Les données n'ont pas pu être chargées. Vérifiez que le serveur est démarré, puis rechargez la page."
      />
    );
  }

  return (
    <div>
      <h1
        className="text-2xl text-[#1C2520] mb-1"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        Gestion des utilisateurs
      </h1>
      <p className="text-[#5C6961] text-sm mb-6">{total} compte(s) au total</p>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9189]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou e-mail…"
          className="w-full h-10 pl-9 pr-4 rounded-lg border border-[#E6DFD0] bg-white text-sm outline-none focus:border-[#047857]"
        />
      </div>

      <div className="bg-white rounded-xl border border-[#E6DFD0] shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-[#E6DFD0] text-[11px] uppercase tracking-wide text-[#8C9189]">
              <th className="px-4 py-2.5 font-medium">Utilisateur</th>
              <th className="px-4 py-2.5 font-medium">Rôle</th>
              <th className="px-4 py-2.5 font-medium">Annonces</th>
              <th className="px-4 py-2.5 font-medium">Inscrit le</th>
              <th className="px-4 py-2.5 font-medium">Statut</th>
              <th className="px-4 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-[#EFEAE0] last:border-0">
                <td className="px-4 py-2.5">
                  <p className="text-[#1C2520] font-medium">{u.first_name} {u.last_name}</p>
                  <p className="text-xs text-[#8C9189]">{u.email}</p>
                </td>
                <td className="px-4 py-2.5 text-[#3F4A43]">{USER_ROLES[u.role]}</td>
                <td className="px-4 py-2.5 text-[#3F4A43]">{u.annonces_count || 0}</td>
                <td className="px-4 py-2.5 text-[#3F4A43]">{formatDate(u.date_joined)}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {u.is_active ? "Actif" : "Suspendu"}
                  </span>
                  {u.is_verified && (
                    <span className="ml-1.5 px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">Vérifié</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1.5">
                    {!u.is_verified && (
                      <IconButton onClick={() => handleVerify(u.id)} title="Vérifier">
                        <ShieldCheck size={15} />
                      </IconButton>
                    )}
                    {String(u.id) === String(currentUser?.id) ? null : u.is_active ? (
                      <IconButton onClick={() => handleSuspend(u.id)} title="Suspendre" danger>
                        <Ban size={15} />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleReactivate(u.id)} title="Réactiver">
                        <RotateCcw size={15} />
                      </IconButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IconButton({ children, onClick, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
        danger ? "text-red-600 hover:bg-red-50" : "text-[#047857] hover:bg-[#ECFDF5]"
      }`}
    >
      {children}
    </button>
  );
}
