import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import api from "../../services/api";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";

export default function VisitRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newDate, setNewDate] = useState("");

  async function loadRequests() {
    try {
      const { data } = await api.get(
        "/admin-dashboard/visit-requests/"
      );

      setRequests(data.results || data);
    } catch (err) {
      console.error(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);
    async function acceptVisit(id) {
    try {
      await api.post(`/admin-dashboard/visit-requests/${id}/accept/`);
      loadRequests();
    } catch (err) {
      console.error(err);
      alert("Impossible d'accepter la demande.");
    }
  }

  async function refuseVisit(id) {
    if (!window.confirm("Refuser cette demande de visite ?")) return;

    try {
      await api.post(`/admin-dashboard/visit-requests/${id}/refuse/`);
      loadRequests();
    } catch (err) {
      console.error(err);
      alert("Impossible de refuser la demande.");
    }
  }

  function openReschedule(req) {
    setSelectedRequest(req);
    setNewDate(req.requested_date?.slice(0, 16) || "");
    setShowModal(true);
  }

  async function saveNewDate() {
    if (!selectedRequest) return;

    try {
      await api.post(
        `/admin-dashboard/visit-requests/${selectedRequest.id}/reschedule/`,
        {
          requested_date: newDate,
        }
      );

      setShowModal(false);
      setSelectedRequest(null);
      loadRequests();
    } catch (err) {
      console.error(err);
      alert("Impossible de modifier la date.");
    }
  }

  if (loading) {
    return (
      <LoadingSpinner
        fullPage
        label="Chargement des demandes de visite..."
      />
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Aucune demande de visite"
        description="Les demandes des clients apparaîtront ici."
      />
    );
  }
    return (
    <>
      <div>
        <h1
          className="text-2xl text-[#1C2520] mb-7"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          Demandes de visite
        </h1>

        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-[#E6DFD0] p-5"
            >
              <div className="flex justify-between items-start">

                <div>

                  <h2 className="font-semibold text-lg">
                    {req.annonce_title}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Client :
                    <strong> {req.client_name}</strong>
                  </p>

                  <p className="text-sm text-gray-500">
                    Ville :
                    <strong> {req.annonce_city}</strong>
                  </p>

                  <p className="text-sm mt-2">
                    <strong>Date souhaitée :</strong>
                    <br />
                    {new Date(req.requested_date).toLocaleString()}
                  </p>

                  {req.owner_message && (
                    <div className="mt-3">
                      <strong>Message :</strong>
                      <p className="text-sm text-gray-600 mt-1">
                        {req.owner_message}
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          req.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : req.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : req.status === "rescheduled"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {req.status}
                    </span>
                  </div>

                </div>

                <div className="flex flex-col gap-2">

                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => acceptVisit(req.id)}
                        className="flex items-center gap-2 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
                      >
                        <CheckCircle size={16} />
                        Accepter
                      </button>

                      <button
                        onClick={() => openReschedule(req)}
                        className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                      >
                        <Calendar size={16} />
                        Modifier date
                      </button>

                      <button
                        onClick={() => refuseVisit(req.id)}
                        className="flex items-center gap-2 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700"
                      >
                        <XCircle size={16} />
                        Refuser
                      </button>
                    </>
                  )}

                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
            {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">

            <h2 className="text-xl font-semibold mb-4">
              Modifier la date de visite
            </h2>

            <input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mb-5"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Annuler
              </button>

              <button
                onClick={saveNewDate}
                className="px-4 py-2 rounded-xl bg-[#047857] text-white"
              >
                Enregistrer
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}