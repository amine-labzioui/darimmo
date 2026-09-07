import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useNotification } from "../../hooks/useNotification";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLORS = {
  success: "border-[#047857] text-[#047857]",
  error: "border-red-500 text-red-500",
  info: "border-[#0B7EA3] text-[#0B7EA3]",
};

export default function NotificationToasts() {
  const { toasts } = useNotification();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2.5 w-full max-w-sm">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className={`animate-slide-in-right bg-white rounded-xl shadow-lg border-l-4 ${
              COLORS[toast.type] || COLORS.info
            } px-4 py-3 flex items-start gap-3`}
          >
            <Icon size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="text-sm font-medium text-[#1C2520]">{toast.title}</p>
              )}
              {toast.message && (
                <p className="text-sm text-[#5C6961] mt-0.5">{toast.message}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
