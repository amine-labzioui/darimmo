import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SimilarPropertiesSection from "./sections/SimilarPropertiesSection";

import { annonceService } from "../../services/annonceService";
import { clientService } from "../../services/clientService";
import { messageService } from "../../services/messageService";

import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { getAnnonceUnavailableMessage } from "../../utils/helpers";

import LoadingSpinner from "../Shared/LoadingSpinner";

import GallerySection from "./sections/GallerySection";
import HeaderSection from "./sections/HeaderSection";
import DescriptionSection from "./sections/DescriptionSection";
import SidebarSection from "./sections/SidebarSection";

import ContactModal from "./modals/ContactModal";
import VisitRequestModal from "./modals/VisitRequestModal";

export default function AnnonceDetail() {
  const { id } = useParams();

  const { isAuthenticated, isClient } = useAuth();
  const { pushToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);

  const [contactOpen, setContactOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);

  const [sending, setSending] = useState(false);

  const [similarAds, setSimilarAds] = useState([]);

  const [message, setMessage] = useState(
    "Bonjour, je suis intéressé par ce bien. Pourriez-vous me donner plus d'informations ?"
  );

  useEffect(() => {
    loadAnnonce();
    }, [id]);

  async function loadAnnonce() {
  try {
    setLoading(true);

    const data = await annonceService.getById(id);

    setAnnonce(data);

    // Charger les biens similaires
    const response = await annonceService.list();

    const similaires = response.results
      .filter(
        (a) =>
          a.id !== data.id &&
          a.city === data.city &&
          a.property_type === data.property_type
      )
      .slice(0, 3);

    setSimilarAds(similaires);

  } catch (error) {
    console.error(error);
    setAnnonce(null);
    setSimilarAds([]);
  } finally {
    setLoading(false);
  }
}

  // Actions réservées aux utilisateurs connectés : un visiteur est envoyé vers la
  // connexion, puis ramené sur cette annonce (location transmise dans state.from).
  function requireLogin(message) {
    if (isAuthenticated) return true;
    pushToast({ type: "info", title: message });
    navigate("/connexion", { state: { from: location } });
    return false;
  }

  async function handleFavorite() {
    if (!requireLogin("Connectez-vous pour ajouter ce bien à vos favoris")) return;

    try {
      await clientService.addFavorite(annonce.id);

      pushToast({
        type: "success",
        title: "Ajouté aux favoris",
      });

    } catch {

      pushToast({
        type: "error",
        title: "Une erreur est survenue",
      });

    }
  }

  async function handleContact() {

    if (!isAuthenticated) return;

    setSending(true);

    try {

      await messageService.contacterVendeur(
        annonce.id,
        message
      );

      pushToast({
        type: "success",
        title: "Message envoyé",
      });

      setContactOpen(false);

    } finally {

      setSending(false);

    }

  }

  if (loading) {
    return (
      <LoadingSpinner
        fullPage
        label="Chargement..."
      />
    );
  }

  if (!annonce) {
    return null;
  }

  const unavailableMessage = getAnnonceUnavailableMessage(annonce);

  return (
    <div className="min-h-screen bg-[#FAF8F3]">

      {unavailableMessage && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div
            role="status"
            className="rounded-lg bg-[#F7F4EE] border border-[#E6DFD0] px-4 py-3 text-sm font-medium text-[#1C2520]"
          >
            {unavailableMessage}
          </div>
        </div>
      )}

      <GallerySection
        annonce={annonce}
        activeImage={activeImage}
        setActiveImage={setActiveImage}
        onFavorite={handleFavorite}
      />

      <HeaderSection annonce={annonce} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_320px] gap-6">

        <DescriptionSection annonce={annonce} />

        <SidebarSection
          annonce={annonce}
          isClient={isClient}
          onFavorite={handleFavorite}
          onContact={() => {
            if (requireLogin("Connectez-vous pour contacter le vendeur")) setContactOpen(true);
          }}
          onVisit={() => {
            if (requireLogin("Connectez-vous pour programmer une visite")) setVisitOpen(true);
          }}
        />

      </div>
      

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        sending={sending}
        message={message}
        setMessage={setMessage}
        onSubmit={handleContact}
      />

      <VisitRequestModal
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        annonce={annonce}
      />
      <SimilarPropertiesSection
        annonces={similarAds}
      />

    </div>
  );
}
