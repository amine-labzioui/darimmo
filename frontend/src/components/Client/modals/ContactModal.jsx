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
          rounded-2xl
          border
          border-[#E6DFD0]
          p-4
          outline-none
          resize-none
          focus:border-[#047857]
        "
      />

      <button
        onClick={onSubmit}
        disabled={sending}
        className="
          mt-5
          w-full
          rounded-2xl
          bg-[#047857]
          py-4
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
        <Send size={18} />

        {sending ? "Envoi..." : "Envoyer le message"}
      </button>
    </Modal>
  );
}