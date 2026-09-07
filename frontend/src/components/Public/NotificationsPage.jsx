import { Bell, CheckCheck } from "lucide-react";
import { useNotification } from "../../hooks/useNotification";
import { timeAgo } from "../../utils/formatters";
import { classNames } from "../../utils/helpers";
import EmptyState from "../Shared/EmptyState";

const TYPE_LABELS = {
  new_message: "Nouveau message",
  visit_request: "Demande de visite",
  visit_confirmed: "Visite confirmée",
  annonce_approved: "Annonce approuvée",
  annonce_rejected: "Annonce rejetée",
  new_match: "Nouveau bien correspondant",
  payment_success: "Paiement réussi",
};

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotification();

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-7">
        <h1
          className="text-2xl text-[#1C2520]"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 text-[13.5px] text-[#047857] font-medium hover:underline"
          >
            <CheckCheck size={15} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Aucune notification" description="Vous êtes à jour !" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={classNames(
                "w-full text-left bg-white rounded-xl border p-4 transition-colors",
                n.is_read ? "border-[#E6DFD0]" : "border-[#047857]/30 bg-[#ECFDF5]/40"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-[#047857] uppercase tracking-wide">
                    {TYPE_LABELS[n.notification_type] || n.notification_type}
                  </p>
                  <p className="text-[14px] text-[#1C2520] mt-1">{n.title}</p>
                  {n.body && <p className="text-[13px] text-[#5C6961] mt-0.5">{n.body}</p>}
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#C2622D] shrink-0 mt-1.5" />}
              </div>
              <p className="text-[11.5px] text-[#8C9189] mt-2">{timeAgo(n.created_at)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
