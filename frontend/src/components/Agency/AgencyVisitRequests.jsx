import { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";
import { useNavigate } from "react-router-dom";
import VisitRequestModal from "./VisitRequestModal";

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
export default function AgencyVisitRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newDate, setNewDate] = useState("");

  const loadRequests = async () => {
    try {
      const { data } = await api.get("/agency-dashboard/visit-requests/");
      setRequests(data.results || data);
    } catch (error) {
      console.error(error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateStatus = async (id, status, confirmedDate = null) => {
  try {
    const payload = {
      status,
    };

    if (confirmedDate) {
      payload.confirmed_date = confirmedDate;
    }

    await api.patch(
      `/agency-dashboard/visit-requests/${id}/`,
      payload
    );

    setModalOpen(false);
    setSelectedRequest(null);

    loadRequests();

  } catch (err) {
    console.error(err);
    alert("Erreur lors de la mise à jour.");
  }
  };
  const reprogramVisit = async (data) => {
  if (!selectedRequest) return;

  try {
    await api.patch(
      `/agency-dashboard/visit-requests/${selectedRequest.id}/`,
      {
        status: "rescheduled",
        confirmed_date: data.confirmed_date,
        owner_message: data.owner_message,
      }
    );

    setModalOpen(false);
    setSelectedRequest(null);

    loadRequests();

  } catch (error) {
    console.error(error);
    alert("Impossible de reprogrammer la visite.");
  }
  };
  const confirmReschedule = () => {
  if (!selectedRequest) return;

  if (!newDate) {
    alert("Veuillez choisir une nouvelle date.");
    return;
  }

  updateStatus(
    selectedRequest.id,
    "accepted",
    newDate
  );
  };
  const contactClient = async (req) => {
  try {
    const { data } = await api.post(
      "/messaging/conversations/contacter/",
      {
        annonce: req.annonce,
        message: "Bonjour.",
      }
    );

    navigate("/messages");

  } catch (error) {
    console.error(error.response);
  }
 };

  const pending = requests.filter(
    (r) => r.status === "pending"
  ).length;

  const accepted = requests.filter(
    (r) => r.status === "accepted"
  ).length;

  const refused = requests.filter(
    (r) => r.status === "refused"
  ).length;

  return (
    <div className="max-w-7xl mx-auto">

      <div className="mb-6">

        <h1
          className="text-2xl text-[#1C2520]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          Demandes de visite
        </h1>

        <p className="text-[#6C746E] text-sm mt-1">
          Consultez et gérez les rendez-vous demandés par vos clients.
        </p>

      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">

        <div className="bg-white border border-[#ECE6DA] rounded-xl p-4">

          <p className="text-xs text-[#8B938D]">
            Total
          </p>

          <h2
            className="text-2xl mt-1 text-[#1C2520]"
            style={{
              fontFamily: "'Fraunces', serif",
            }}
          >
            {requests.length}
          </h2>

        </div>

        <div className="bg-white border border-[#ECE6DA] rounded-xl p-4">

          <p className="text-xs text-[#8B938D]">
            En attente
          </p>

          <h2
            className="text-2xl mt-1 text-[#C57A2D]"
            style={{
              fontFamily: "'Fraunces', serif",
            }}
          >
            {pending}
          </h2>

        </div>

        <div className="bg-white border border-[#ECE6DA] rounded-xl p-4">

          <p className="text-xs text-[#8B938D]">
            Confirmées
          </p>

          <h2
            className="text-2xl mt-1 text-[#047857]"
            style={{
              fontFamily: "'Fraunces', serif",
            }}
          >
            {accepted}
          </h2>

        </div>

        <div className="bg-white border border-[#ECE6DA] rounded-xl p-4">

          <p className="text-xs text-[#8B938D]">
            Refusées
          </p>

          <h2
            className="text-2xl mt-1 text-[#B84B4B]"
            style={{
              fontFamily: "'Fraunces', serif",
            }}
          >
            {refused}
          </h2>

        </div>

      </div>

      <div className="space-y-3">
        {requests.map((req) => (

  <div
    key={req.id}
    className="bg-white border border-[#ECE6DA] rounded-xl p-4 hover:border-[#D7CEBF] transition-all duration-300"
  >

    <div className="flex items-start justify-between gap-4">

      <div className="flex-1 min-w-0">

        <div className="flex items-center justify-between mb-2">

          <h2
            className="text-base text-[#1C2520] truncate"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
            }}
          >
            {req.annonce_title}
          </h2>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium
            ${
              req.status === "accepted"
                ? "bg-[#EDF8F3] text-[#047857]"
                : req.status === "refused"
                ? "bg-[#FDEEEE] text-[#B84B4B]"
                : "bg-[#FFF7EC] text-[#C57A2D]"
            }`}
          >
            {req.status === "accepted"
              ? "Confirmée"
              : req.status === "refused"
              ? "Refusée"
              : "En attente"}
          </span>

        </div>

        <div className="grid md:grid-cols-3 gap-3 text-[14px]">

          <div>
            <p className="text-[#909892] text-xs mb-1">
              Client
            </p>

            <p className="text-[#1C2520] font-medium">
              {req.client_name}
            </p>
          </div>

          <div>
            <p className="text-[#909892] text-xs mb-1">
              Date souhaitée
            </p>


            <p className="text-[#1C2520]">
            {formatDate(req.requested_date)}
            </p>
             {req.confirmed_date && (
       <>
            <p className="text-[#909892] text-xs mt-3 mb-1">
             Date confirmée
            </p>

             <p className="text-[#047857] font-medium">
             {formatDate(req.confirmed_date)}
            </p>
     </>
  )}
          </div>
          
          

          <div>
            <p className="text-[#909892] text-xs mb-1">
              Téléphone
            </p>

            <p className="text-[#1C2520]">
              {req.client_phone || "-"}
            </p>
          </div>

        </div>

        {req.message && (

          <div className="mt-4">

            <p className="text-[#909892] text-xs mb-1">
              Message
            </p>

            <p
              className="text-[#5C6961] text-sm leading-6"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {req.message}
            </p>

          </div>

        )}

      </div>

      <div className="flex flex-col gap-2 w-[150px]">
        {req.status === "pending" ? (
  <>
    <button
      onClick={() => updateStatus(req.id, "accepted")}
      className="h-9 rounded-lg bg-[#EEF8F2] text-[#047857] text-sm font-medium hover:bg-[#DFF3E8] transition-all"
    >
      Accepter
    </button>

    <button
      onClick={() => updateStatus(req.id, "refused")}
      className="h-9 rounded-lg bg-[#FDF1F1] text-[#B84B4B] text-sm font-medium hover:bg-[#F9E5E5] transition-all"
    >
      Refuser
    </button>
  </>
) : (
  <button
    onClick={() => updateStatus(req.id, "pending")}
    className="h-9 rounded-lg bg-[#F7F4EE] text-[#6C746E] text-sm font-medium hover:bg-[#EFE8DC] transition-all"
  >
    Réouvrir
  </button>
)}

<button
  onClick={() => {
    setSelectedRequest(req);
    setNewDate(
      req.confirmed_date
        ? req.confirmed_date.slice(0, 16)
        : ""
    );
    setModalOpen(true);
  }}
  className="h-9 rounded-lg border border-[#E7DFD2] text-[#5C6961] text-sm hover:bg-[#FAF8F4] transition-all"
>
  Reprogrammer
</button>

<button
  onClick={() => contactClient(req)}
  className="h-9 rounded-lg border border-[#E7DFD2] text-[#5C6961] text-sm hover:bg-[#FAF8F4] transition-all"
>
  Contacter
</button>

<button
  onClick={() => navigate(`/annonces/${req.annonce}`)}
  className="h-9 rounded-lg border border-[#E7DFD2] text-[#5C6961] text-sm hover:bg-[#FAF8F4] transition-all"
>
  Voir l'annonce
</button>

{modalOpen && (
  <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl w-[420px] p-5">

      <h2
        className="text-lg mb-4"
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 600,
        }}
      >
        Reprogrammer la visite
      </h2>

      <label className="block text-sm text-[#6C746E] mb-2">
        Nouvelle date
      </label>

      <input
        type="datetime-local"
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
        className="w-full border border-[#E5DED2] rounded-lg px-3 h-10 mb-4 text-sm outline-none"
      />

      <div className="flex justify-end gap-3">

        <button
          onClick={() => {
            setModalOpen(false);
            setSelectedRequest(null);
          }}
          className="px-4 h-9 text-sm border border-[#E5DED2] rounded-lg"
        >
          Annuler
        </button>

        <button
          onClick={confirmReschedule}
          className="px-4 h-9 text-sm rounded-lg bg-[#F7F4EE] border border-[#E5DED2]"
        >
          Enregistrer
        </button>

      </div>

    </div>

  </div>
)}
</div>

</div>

</div>

))}
      </div>

    </div>
  );
}