import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Heart,
  User,
  MessageCircle,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { initials } from "../../utils/formatters";

const ZelligeStar = ({ className = "" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <path
      d="M50 4 L61 32 L92 28 L70 50 L92 72 L61 68 L50 96 L39 68 L8 72 L30 50 L8 28 L39 32 Z"
      fill="currentColor"
    />
  </svg>
);

const NAV_LINKS = [
  { label: "Acheter", href: "/recherche?transaction_type=vente" },
  { label: "Louer", href: "/recherche?transaction_type=location" },
  { label: "Agences", href: "/agences" },
  { label: "Assistant IA", href: "/assistant-ia" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { unreadCount } = useNotification();

  const navigate = useNavigate();
  const location = useLocation();

  const dashboardPath = isAdmin ? "/admin" : "/tableau-de-bord";

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  async function handleLogout() {
    await logout();
    setUserMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FFFBF5]/90 backdrop-blur-md border-b border-[#E6DFD0]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-md bg-[#047857] flex items-center justify-center">
              <ZelligeStar className="w-5 h-5 text-[#F5F0E8]" />
            </span>
            <span
              className="text-xl text-[#1C2520] tracking-tight"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              DarImmo
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm text-[#3F4A43] hover:text-[#047857] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">

  {isAuthenticated ? (
    <>
      {/* Messages */}
      <Link
        to="/messages"
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#3F4A43] hover:bg-[#F5F0E8] transition-all duration-200"
      >
        <MessageCircle size={18} />
      </Link>

      {/* Notifications */}
      <Link
        to="/notifications"
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#3F4A43] hover:bg-[#F5F0E8] transition-all duration-200"
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C2622D] text-white text-[10px] font-semibold flex items-center justify-center shadow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

      {/* User */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex items-center gap-3 rounded-full pl-1 pr-3 py-1.5 border border-transparent hover:border-[#E6DFD0] hover:bg-white transition-all duration-200 shadow-sm"
        >
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#047857] to-[#0F766E] text-white text-sm font-semibold flex items-center justify-center shadow">
            {initials(user?.first_name, user?.last_name) ||
              user?.username?.charAt(0)?.toUpperCase()}
          </span>

          <div className="text-left">
            <p className="text-sm font-semibold text-[#1C2520] leading-none">
              {user?.first_name || user?.username}
            </p>

            <p className="text-[11px] text-[#7B857C] mt-1">
              {isAdmin ? "Administrateur" : "Mon compte"}
            </p>
          </div>

          <ChevronDown
            size={15}
            className={`transition-transform duration-200 ${
              userMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
                  {userMenuOpen && (
  <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl border border-[#E6DFD0] shadow-lg overflow-hidden z-50 animate-fade-in">

    {/* Header */}
    <div className="px-4 py-3 bg-gradient-to-r from-[#047857] to-[#0F766E] text-white">
      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
          {initials(user?.first_name, user?.last_name) ||
            user?.username?.charAt(0)?.toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            {user?.first_name
              ? `${user.first_name} ${user.last_name}`
              : user?.username}
          </p>

          <p className="text-xs text-white/80 truncate">
            {user?.email}
          </p>
        </div>

      </div>
    </div>

    {/* Menu */}
    <div className="py-2">

      <Link
        to={dashboardPath}
        onClick={() => setUserMenuOpen(false)}
        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#F5F0E8] transition-colors"
      >
        <LayoutDashboard size={16} />
        <span>Tableau de bord</span>
      </Link>

      <Link
        to="/profil"
        onClick={() => setUserMenuOpen(false)}
        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#F5F0E8] transition-colors"
      >
        <User size={16} />
        <span>Mon profil</span>
      </Link>

      <Link
        to="/favoris"
        onClick={() => setUserMenuOpen(false)}
        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#F5F0E8] transition-colors"
      >
        <Heart size={16} />
        <span>Mes favoris</span>
      </Link>

      <Link
        to="/messages"
        onClick={() => setUserMenuOpen(false)}
        className="flex items-center justify-between px-4 py-2 text-sm hover:bg-[#F5F0E8] transition-colors"
      >
        <div className="flex items-center gap-3">
          <MessageCircle size={16} />
          <span>Messages</span>
        </div>
      </Link>

      <Link
        to="/notifications"
        onClick={() => setUserMenuOpen(false)}
        className="flex items-center justify-between px-4 py-2 text-sm hover:bg-[#F5F0E8] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Bell size={16} />
          <span>Notifications</span>
        </div>

        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[#C2622D] text-white text-xs">
            {unreadCount}
          </span>
        )}
      </Link>

      <div className="border-t border-[#EFEAE0] my-2"></div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
        <span>Déconnexion</span>
      </button>

    </div>
  </div>
)}
                </div>
              </>
            ) : (
              <Link
                to="/connexion"
                className="px-4 py-2 rounded-full bg-[#047857] text-white text-sm font-medium hover:bg-[#035f46] transition-colors duration-200 shadow-sm"
              >
                Connexion / Inscription
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-[#1C2520]"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {open && (
  <div className="md:hidden border-t border-[#E6DFD0] bg-[#FFFBF5]">

    {isAuthenticated && (
      <div className="px-5 py-4 border-b border-[#E6DFD0]">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#047857] to-[#0F766E] text-white flex items-center justify-center text-sm font-semibold">
            {initials(user?.first_name, user?.last_name) ||
              user?.username?.charAt(0)?.toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1C2520] truncate">
              {user?.first_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username}
            </p>

            <p className="text-xs text-[#8C9189] truncate">
              {user?.email}
            </p>
          </div>

        </div>

      </div>
    )}

    <div className="px-5 py-3 space-y-1">

      {NAV_LINKS.map((link) => (
        <Link
          key={link.label}
          to={link.href}
          onClick={() => setOpen(false)}
          className="block rounded-lg px-3 py-2.5 text-sm text-[#3F4A43] hover:bg-[#F5F0E8] transition"
        >
          {link.label}
        </Link>
      ))}

      {isAuthenticated ? (
        <>
          <Link
            to={dashboardPath}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[#F5F0E8]"
          >
            <LayoutDashboard size={16} />
            Tableau de bord
          </Link>

          <Link
            to="/messages"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-[#F5F0E8]"
          >
            <div className="flex items-center gap-3">
              <MessageCircle size={16} />
              Messages
            </div>
          </Link>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-[#F5F0E8]"
          >
            <div className="flex items-center gap-3">
              <Bell size={16} />
              Notifications
            </div>

            {unreadCount > 0 && (
              <span className="px-2 py-1 rounded-full bg-[#C2622D] text-white text-xs">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link
            to="/favoris"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[#F5F0E8]"
          >
            <Heart size={16} />
            Mes favoris
          </Link>

          <Link
            to="/profil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[#F5F0E8]"
          >
            <User size={16} />
            Mon profil
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </>
      ) : (
        <Link
          to="/connexion"
          onClick={() => setOpen(false)}
          className="block mt-3 w-full text-center rounded-full bg-[#047857] py-2 text-sm text-white font-medium hover:bg-[#03654A] transition"
        >
          Connexion / Inscription
        </Link>
      )}

    </div>

  </div>
)}
</header>
  );
}