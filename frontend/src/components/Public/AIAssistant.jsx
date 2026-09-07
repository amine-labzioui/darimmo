import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Send, Sparkles, MapPin, Bed, Maximize } from "lucide-react";
import { aiService } from "../../services/analyticsService";
import { getOrCreateSessionId } from "../../utils/helpers";
import { formatPriceWithCurrency } from "../../utils/formatters";

const WELCOME_MESSAGE = {
  sender: "ai",
  content:
    "Bonjour 👋 Je suis l'Assistant DarImmo. Je peux vous aider à trouver un bien selon votre budget et vos critères, ou répondre à vos questions sur le marché immobilier marocain. Comment puis-je vous aider ?",
};

export default function AIAssistant() {
  const [sessionId] = useState(getOrCreateSessionId);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { sender: "user", content: text }]);
    setDraft("");
    setSending(true);

    try {
      const response = await aiService.sendMessage(text, sessionId);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", content: response.reply, recommendations: response.recommendations || [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          content: "Désolé, une erreur est survenue. Veuillez réessayer dans un instant.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  const suggestions = [
    "Je cherche une villa à Marrakech avec piscine",
    "Quel est le prix moyen au m² à Casablanca ?",
    "Conseils pour investir dans l'immobilier au Maroc",
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-full bg-[#047857] flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1
            className="text-xl text-[#1C2520]"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
          >
            Assistant DarImmo IA
          </h1>
          <p className="text-[12.5px] text-[#5C6961]">Disponible 24h/24 pour vous accompagner</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E6DFD0] flex flex-col h-[60vh] min-h-[420px]">
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${msg.sender === "user" ? "" : "w-full"}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-[14.5px] ${
                    msg.sender === "user"
                      ? "bg-[#047857] text-white rounded-br-sm"
                      : "bg-[#F0EAD8] text-[#1C2520] rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>

                {msg.recommendations?.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    {msg.recommendations.map((rec) => (
                      <Link
                        key={rec.id}
                        to={`/annonces/${rec.annonce}`}
                        onClick={() => aiService.trackRecommendationClick(rec.id)}
                        className="bg-white border border-[#E6DFD0] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {rec.main_image && (
                          <img src={rec.main_image} alt={rec.annonce_title} className="w-full h-28 object-cover" />
                        )}
                        <div className="p-3">
                          <p className="text-[13px] font-medium text-[#1C2520] truncate">{rec.annonce_title}</p>
                          <div className="flex items-center gap-1 text-[11.5px] text-[#5C6961] mt-1">
                            <MapPin size={11} /> {rec.annonce_city}
                          </div>
                          <p className="text-[13px] font-semibold text-[#047857] mt-1.5">
                            {formatPriceWithCurrency(rec.annonce_price, "vente")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#F0EAD8] flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C9189] animate-pulse-soft" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C9189] animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C9189] animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setDraft(s)}
                className="px-3 py-1.5 rounded-full border border-[#E6DFD0] text-[12.5px] text-[#3F4A43] hover:border-[#047857]/40 hover:bg-[#F5F0E8] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2.5 px-5 py-4 border-t border-[#E6DFD0]">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Posez votre question…"
            className="flex-1 px-4 py-2.5 rounded-full border border-[#E6DFD0] text-[14px] outline-none focus:border-[#047857]"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="w-10 h-10 rounded-full bg-[#047857] text-white flex items-center justify-center hover:bg-[#035f46] transition-colors disabled:opacity-50 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
