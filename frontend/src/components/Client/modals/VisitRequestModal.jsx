import { useState } from "react";
import Modal from "../../Shared/Modal";
import { clientService } from "../../../services/clientService";
import { useNotification } from "../../../hooks/useNotification";

export default function VisitRequestModal({
  open,
  onClose,
  annonce,
}) {
  const { pushToast } = useNotification();

  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!date) {
      pushToast({
        type: "warning",
        title: "Choisissez une date",
      });
      return;
    }

    setLoading(true);

    try {
      await clientService.createVisitRequest({
        annonce: annonce.id,
        requested_date: new Date(date).toISOString(),
        client_message: message,
      });

      pushToast({
        type: "success",
        title: "Demande envoyée",
      });

      setDate("");
      setMessage("");
      onClose();

    } catch {

      pushToast({
        type: "error",
        title: "Impossible d'envoyer la demande",
      });

    } finally {

      setLoading(false);

    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Demander une visite"
    >
      <label className="block mb-1.5 text-sm font-medium">
        Date souhaitée
      </label>

      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="
          w-full
          rounded-lg
          border
          border-[#E6DFD0]
          px-3
          py-2
          text-sm
          outline-none
          focus:border-[#047857]
        "
      />

      <label className="block mt-4 mb-1.5 text-sm font-medium">
        Message
      </label>

      <textarea
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="
          w-full
          rounded-lg
          border
          border-[#E6DFD0]
          px-3
          py-2
          text-sm
          resize-none
          outline-none
          focus:border-[#047857]
        "
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="
          mt-4
          w-full
          rounded-lg
          bg-[#047857]
          py-2
          text-sm
          text-white
          font-semibold
          hover:bg-[#03664F]
          transition
          disabled:opacity-50
        "
      >
        {loading
          ? "Envoi..."
          : "Confirmer la demande"}
      </button>
    </Modal>
  );
}