import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="text-center">
        <p
          className="text-7xl text-[#047857] mb-2"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          404
        </p>
        <h1
          className="text-xl text-[#1C2520] mb-2"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Page introuvable
        </h1>
        <p className="text-[#5C6961] text-[15px] mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#047857] text-white text-[14.5px] font-medium hover:bg-[#035f46] transition-colors"
        >
          <Home size={16} /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
