import { Routes, Route } from "react-router-dom";
import {
  LayoutDashboard, Home, Heart, CalendarCheck, Search,
  MessageSquare, User, Lock, BarChart3,
} from "lucide-react";
import Sidebar from "../components/Shared/Sidebar";
import Dashboard from "../components/Client/Dashboard";
import MyAnnonces from "../components/Client/MyAnnonces";
import CreateAnnonce from "../components/Client/CreateAnnonce";
import EditAnnonce from "../components/Client/EditAnnonce";
import Analytics from "../components/Client/Analytics";
import Messages from "../components/Client/Messages";
import VisitRequests from "../components/Client/VisitRequests";
import SavedSearches from "../components/Client/SavedSearches";
import Profile from "../components/Client/Profile";
import ChangePassword from "../components/Client/ChangePassword";
import { useAuth } from "../hooks/useAuth";
import BoostAnnonce from "../components/Dashboard/BoostAnnonce";
import Favorites from "../components/Client/Favorites";


export default function ClientDashboardPage() {
  const baseItems = [
  { to: "/client", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  ];
  
  const clientItems = [
    { to: "/client/favoris", label: "Favoris", icon: Heart },
    { to: "/client/visites", label: "Demandes de visite", icon: CalendarCheck },
    { to: "/client/recherches", label: "Recherches sauvegardées", icon: Search },
  ];

  const commonItems = [
    { to: "/client/messages", label: "Messages", icon: MessageSquare },
    { to: "/client/profil", label: "Mon profil", icon: User },
    { to: "/client/securite", label: "Sécurité", icon: Lock },
  ];

  const items = [
  ...baseItems,
  ...clientItems,
  ...commonItems,
 ];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar items={items} title="Mon espace" />
        <div className="flex-1 min-w-0">
          <Routes>
            <Route index element={<Dashboard />} />

            <Route path="annonces" element={<MyAnnonces />} />
            <Route path="annonces/nouvelle" element={<CreateAnnonce />} />
            <Route path="annonces/:id/modifier" element={<EditAnnonce />} />
            <Route path="annonces/:id/boost" element={<BoostAnnonce />} />

            <Route path="analytics" element={<Analytics />} />
            <Route path="visites" element={<VisitRequests />} />
            <Route path="recherches" element={<SavedSearches />} />
            <Route path="securite" element={<ChangePassword />} />
            

            <Route path="messages" element={<Messages />} />
            <Route path="profil" element={<Profile />} />
            <Route path="favoris" element={<Favorites />} />

            
          </Routes>
        </div>
      </div>
    </div>
  );
}
