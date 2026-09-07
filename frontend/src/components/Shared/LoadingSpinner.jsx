import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ size = 24, label = "Chargement…", fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 text-[#5C6961]">
      <Loader2 size={size} className="animate-spin text-[#047857]" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="min-h-[50vh] flex items-center justify-center">{content}</div>;
  }
  return <div className="py-10">{content}</div>;
}
