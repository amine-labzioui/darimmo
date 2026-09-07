import { Routes, Route } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Home,
  CreditCard,
  CalendarCheck,
} from "lucide-react";

import Sidebar from "../components/Shared/Sidebar";

import AdminDashboard from "../components/Admin/AdminDashboard";
import UserManagement from "../components/Admin/UserManagement";
import AnnonceModeration from "../components/Admin/AnnonceModeration";
import TransactionManagement from "../components/Admin/TransactionManagement";
import VisitRequestManagement from "../components/Admin/VisitRequestManagement";

const ITEMS = [
  {
    to: "/admin",
    label: "Vue d'ensemble",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/admin/utilisateurs",
    label: "Utilisateurs",
    icon: Users,
  },
  {
    to: "/admin/annonces",
    label: "Annonces",
    icon: Home,
  },
  {
    to: "/admin/transactions",
    label: "Transactions",
    icon: CreditCard,
  },
  {
    to: "/admin/visites",
    label: "Demandes de visite",
    icon: CalendarCheck,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar
          items={ITEMS}
          title="Administration"
        />

        <div className="flex-1 min-w-0">
          <Routes>
            <Route
              index
              element={<AdminDashboard />}
            />

            <Route
              path="utilisateurs"
              element={<UserManagement />}
            />

            <Route
              path="annonces"
              element={<AnnonceModeration />}
            />

            <Route
              path="transactions"
              element={<TransactionManagement />}
            />

            <Route
              path="visites"
              element={<VisitRequestManagement />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}