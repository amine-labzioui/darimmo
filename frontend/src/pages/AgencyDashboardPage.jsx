import MyAnnonces from "../components/Client/MyAnnonces";
import CreateAnnonce from "../components/Client/CreateAnnonce";
import EditAnnonce from "../components/Client/EditAnnonce";
import BoostAnnonce from "../components/Dashboard/BoostAnnonce";
import Analytics from "../components/Client/Analytics";
import AgencyVisitRequests from "../components/Agency/AgencyVisitRequests";
import AgencyDashboard from "../components/Agency/Dashboard";
import Messages from "../components/Client/Messages";
import Profile from "../components/Client/Profile";

import { Routes, Route } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  CalendarCheck,
  MessageSquare,
  BarChart3,
  User,
} from "lucide-react";

import Sidebar from "../components/Shared/Sidebar";

export default function AgencyDashboardPage() {
    console.log("AGENCY DASHBOARD LOADED");
  const items = [
    {
      to: "/agence",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/agence/annonces",
      label: "Mes annonces",
      icon: Home,
    },
    {
      to: "/agence/visites",
      label: "Demandes de visite",
      icon: CalendarCheck,
    },
    {
      to: "/agence/messages",
      label: "Messages",
      icon: MessageSquare,
    },
    {
      to: "/agence/statistiques",
      label: "Statistiques",
      icon: BarChart3,
    },
    {
      to: "/agence/profil",
      label: "Profil",
      icon: User,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        <Sidebar items={items} title="Agence" />

        <div className="flex-1">

          <Routes>

            <Route
    index
    element={<AgencyDashboard />}
    />

  <Route path="annonces" element={<MyAnnonces />} />

  <Route path="annonces/nouvelle" element={<CreateAnnonce />} />

  <Route
    path="annonces/:id/modifier"
    element={<EditAnnonce />}
  />

  <Route
    path="annonces/:id/boost"
    element={<BoostAnnonce />}
  />

  
  <Route
    path="visites"
    element={<AgencyVisitRequests />}
 />
 <Route
    path="messages"
    element={<Messages />}
/>
<Route
    path="statistiques"
    element={<Analytics />}
  />
  <Route
    path="profil"
    element={<Profile />}
/>

</Routes>

        </div>

      </div>
    </div>
  );
}