import { useEffect, useRef, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { messageService } from "../../services/messageService";
import { useAuth } from "../../hooks/useAuth";
import { timeAgo } from "../../utils/formatters";
import { classNames } from "../../utils/helpers";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";

export default function Messages() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  // ==========================
  // Charger les conversations
  // ==========================
  useEffect(() => {
    async function loadConversations() {
      try {
        const data = await messageService.getConversations();
        const list = data.results || data;

        setConversations(list);

        if (list.length > 0) {
          setActiveId(list[0].id);
        }
      } catch (error) {
        console.error(error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, []);

  // ==========================
  // Charger les messages
  // ==========================
  useEffect(() => {
    if (!activeId) return;

    async function loadMessages() {
      try {
        const data = await messageService.getMessages(activeId);

        if (Array.isArray(data)) {
          setMessages(data);
        } else if (data.results) {
          setMessages(data.results);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error(error);
        setMessages([]);
      }
    }

    loadMessages();
  }, [activeId]);

  // ==========================
  // Scroll automatique
  // ==========================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ==========================
  // Envoyer un message
  // ==========================
  async function handleSend(e) {
    e.preventDefault();

    if (!draft.trim()) return;

    setSending(true);

    try {
      const newMessage = await messageService.sendMessage(
        activeId,
        draft.trim()
      );

      setMessages((old) => [...old, newMessage]);

      setDraft("");
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <LoadingSpinner
        fullPage
        label="Chargement de vos conversations..."
      />
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Aucune conversation"
        description="Contactez un vendeur depuis une annonce pour démarrer une conversation."
      />
    );
  }

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId
  );
      return (
    <div className="bg-white rounded-3xl shadow-xl border border-[#E8E2D6] overflow-hidden h-[calc(100vh-180px)] min-h-[650px] flex">

      {/* ================= Sidebar ================= */}

      <div className="w-80 border-r border-[#EFE7DA] bg-[#FCFBF8] flex flex-col">

        <div className="px-6 py-5 border-b border-[#EFE7DA]">
          <h2 className="text-xl font-bold text-[#1C2520]">
            Messages
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {conversations.length} conversation{conversations.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">

          {conversations.map((conv) => {

            const active = conv.id === activeId;

            return (

              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={classNames(
                  "w-full flex items-start gap-3 px-5 py-4 transition-all border-b border-[#F4EEE4]",
                  active
                    ? "bg-[#E8F6F1]"
                    : "hover:bg-[#F8F6F2]"
                )}
              >

                <div className="w-12 h-12 rounded-full bg-[#047857] text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {(user?.role === "agence"
                    ? conv.client_name
                    : conv.agent_name
                  )
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">

                  <div className="flex justify-between items-center">

                    <p className="font-semibold text-[#1C2520] truncate">

                      {user?.role === "agence"
                        ? conv.client_name
                        : conv.agent_name}

                    </p>

                    {conv.last_message && (

                      <span className="text-xs text-gray-400">

                        {timeAgo(conv.last_message.created_at)}

                      </span>

                    )}

                  </div>

                  <p className="text-xs text-gray-500 truncate mt-1">

                    {conv.annonce_title}

                  </p>

                  {conv.last_message && (

                    <p className="text-sm text-gray-600 truncate mt-2">

                      {conv.last_message.content}

                    </p>

                  )}

                </div>

              </button>

            );

          })}

        </div>

      </div>

      {/* ================= Conversation ================= */}

      <div className="flex-1 flex flex-col bg-[#FAF8F4]">

        {activeConversation && (

          <div className="px-6 py-5 bg-white border-b border-[#EFE7DA] flex items-center gap-4 shadow-sm">

            <div className="w-12 h-12 rounded-full bg-[#047857] text-white flex items-center justify-center font-bold">

              {(user?.role === "agence"
                ? activeConversation.client_name
                : activeConversation.agent_name
              )
                ?.charAt(0)
                ?.toUpperCase()}

            </div>

            <div>

              <h3 className="font-semibold text-[#1C2520]">

                {user?.role === "agence"
                  ? activeConversation.client_name
                  : activeConversation.agent_name}

              </h3>

              <p className="text-sm text-gray-500">

                {activeConversation.annonce_title}

              </p>

            </div>

          </div>

        )}

        {/* ================= Messages ================= */}

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

          {messages.map((msg) => {

            const isOwn = Number(msg.sender) === Number(user?.id);

            return (

              <div
                key={msg.id}
                className={classNames(
                  "flex",
                  isOwn ? "justify-end" : "justify-start"
                )}
              >

                <div
                  className={classNames(
                    "max-w-[70%] px-5 py-3 rounded-3xl shadow-sm transition-all",
                    isOwn
                      ? "bg-[#047857] text-white rounded-br-md"
                      : "bg-white border border-[#ECE5D8] text-[#1C2520] rounded-bl-md"
                  )}
                >

                  <p className="leading-7 whitespace-pre-wrap">

                    {msg.content}

                  </p>

                  <div
                    className={classNames(
                      "text-[11px] mt-2",
                      isOwn
                        ? "text-green-100"
                        : "text-gray-400"
                    )}
                  >

                    {timeAgo(msg.created_at)}

                  </div>

                </div>

              </div>

            );

          })}

          <div ref={bottomRef}></div>

        </div>

        {/* ================= Input ================= */}

        <form
          onSubmit={handleSend}
          className="bg-white border-t border-[#EFE7DA] px-6 py-5 flex items-center gap-4"
        >

          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 rounded-full border border-[#DCD5C8] px-6 py-3 outline-none focus:border-[#047857] transition"
          />

          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="w-14 h-14 rounded-full bg-[#047857] text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
          >

            <Send size={20} />

          </button>

        </form>

      </div>

    </div>
  );
}