import Modal from "../../Shared/Modal";
import { Send } from "lucide-react";

export default function ContactModal({
  open,
  onClose,
  message,
  setMessage,
  sending,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Contacter le vendeur"
    >
      <textarea
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="
          w-full
          rounded-lg
          border
          border-[#E6DFD0]
          p-3
          text-sm
          outline-none
          resize-none
          focus:border-[#047857]
        "
      />

      <button
        onClick={onSubmit}
        disabled={sending}
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
          flex
          items-center
          justify-center
          gap-2
          disabled:opacity-50
        "
      >
        <Send size={16} />

        {sending ? "Envoi..." : "Envoyer le message"}
      </button>
    </Modal>
  );
}