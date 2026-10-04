import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import Navbar from "./components/Shared/Navbar";
import Footer from "./components/Shared/Footer";
import NotificationToasts from "./components/Shared/Notification";
import ProtectedRoute from "./components/Shared/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import AnnonceDetailPage from "./pages/AnnonceDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import AgencyDashboardPage from "./pages/AgencyDashboardPage";

import Favorites from "./components/Client/Favorites";
import Messages from "./components/Client/Messages";
import AIAssistant from "./components/Public/AIAssistant";
import Agencies from "./components/Public/Agencies";
import NotificationsPage from "./components/Public/NotificationsPage";
import PaymentSuccess from "./components/Payment/PaymentSuccess";
import BoostAnnonce from "./components/Dashboard/BoostAnnonce";
import CMISimulator from "./pages/CMISimulator";

import "./styles/global.css";
import "./styles/variables.css";
import "./styles/responsive.css";
import "./styles/animations.css";

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E8]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <NotificationToasts />
    </div>
  );
}
function DashboardRedirect() {
    const { user } = useAuth();

    if (!user) return <Navigate to="/connexion" replace />;

    if (user.role === "agence") {
        return <Navigate to="/agence" replace />;
    }

    if (user.role === "admin") {
        return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/client" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <UserProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                {/* ===== Public ===== */}
                <Route path="/" element={<HomePage />} />
                <Route path="/recherche" element={<SearchPage />} />
                <Route path="/annonces/:id" element={<AnnonceDetailPage />} />
                <Route path="/agences" element={<Agencies />} />
                <Route path="/assistant-ia" element={<AIAssistant />} />
                <Route path="/connexion" element={<LoginPage />} />
                <Route path="/inscription" element={<RegisterPage />} />
                {/* Réinitialisation par e-mail non disponible côté backend : page masquée */}
                <Route path="/mot-de-passe-oublie" element={<Navigate to="/connexion" replace />} />
                <Route path="/paiement/succes" element={<PaymentSuccess />} />
                <Route path="/cmi-simulator"element={<CMISimulator />}
/>

                {/* ===== Authentifié ===== */}
                <Route
                  path="/profil"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favoris"
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
                        <Messages />
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tableau-de-bord"
                  element={
                    <ProtectedRoute>
                     <DashboardRedirect />
                    </ProtectedRoute>
                  }
                  />

                <Route
                  path="/agence/*"
                  element={
                    <ProtectedRoute role="agence">
                      <AgencyDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/*"
                  element={
                    <ProtectedRoute>
                      <ClientDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* ===== Admin ===== */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                {/* ===== 404 ===== */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </UserProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
