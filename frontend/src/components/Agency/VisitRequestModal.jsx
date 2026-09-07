import { useState } from "react";

export default function VisitRequestModal({
  open,
  onClose,
  onConfirm,
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  if (!open) return null;

  const submit = () => {
    if (!date || !time) {
      alert("Veuillez sélectionner une date et une heure.");
      return;
    }

    onConfirm({
      confirmed_date: `${date}T${time}:00`,
      owner_message: message,
    });

    setDate("");
    setTime("");
    setMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/25 flex items-center justify-center">

      <div className="bg-white rounded-3xl w-full max-w-lg p-8">

        <h2
          className="text-3xl text-[#1C2520] mb-2"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          Reprogrammer la visite
        </h2>

        <p className="text-[#707670] mb-8">
          Choisissez une nouvelle date de visite.
        </p>

        <div className="space-y-5">

          <div>

            <label className="text-sm text-[#8E948F]">
              Date
            </label>

            <input
              type="date"
              className="mt-2 w-full border border-[#E7DED1] rounded-xl h-12 px-4 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

          </div>

          <div>

            <label className="text-sm text-[#8E948F]">
              Heure
            </label>

            <input
              type="time"
              className="mt-2 w-full border border-[#E7DED1] rounded-xl h-12 px-4 outline-none"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

          </div>

          <div>

            <label className="text-sm text-[#8E948F]">
              Message
            </label>

            <textarea
              rows={4}
              className="mt-2 w-full border border-[#E7DED1] rounded-xl p-4 resize-none outline-none"
              placeholder="Ajouter un message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

          </div>

        </div>

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="px-6 h-11 rounded-xl border border-[#E7DED1]"
          >
            Annuler
          </button>

          <button
            onClick={submit}
            className="px-6 h-11 rounded-xl bg-[#047857] text-white"
          >
            Confirmer
          </button>

        </div>

      </div>

    </div>
  );
}