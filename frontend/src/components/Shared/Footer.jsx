import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";
import { CITIES } from "../../utils/constants";

const ZelligeStar = ({ className = "" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <path
      d="M50 4 L61 32 L92 28 L70 50 L92 72 L61 68 L50 96 L39 68 L8 72 L30 50 L8 28 L39 32 Z"
      fill="currentColor"
    />
  </svg>
);

const SOCIAL_ICONS = {
  facebook: (
    <path d="M14 9h3V6h-3c-1.66 0-3 1.34-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.55.45-1 1-1z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.3" cy="6.7" r="1.1" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path
        d="M7.5 9.5h2.4v8H7.5v-8zM8.7 6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zM12.3 9.5h2.3v1.1h.03c.32-.6 1.1-1.25 2.27-1.25 2.43 0 2.88 1.6 2.88 3.68v4.47h-2.4v-3.96c0-.95-.02-2.16-1.32-2.16-1.33 0-1.53 1.04-1.53 2.1v4.02h-2.4v-8z"
        fill="#0E2A22"
      />
    </>
  ),
};

const SocialIcon = ({ name, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    {SOCIAL_ICONS[name]}
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#0E2A22] text-[#D8DED9]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-md bg-[#047857] flex items-center justify-center">
                <ZelligeStar className="w-5 h-5 text-[#F5F0E8]" />
              </span>
              <span
                className="text-xl text-white"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
              >
                DarImmo
              </span>
            </div>
            <p className="text-[14px] text-[#A8B3AB] leading-relaxed">
              La plateforme immobilière de référence au Maroc — achat,
              location et conseils, propulsés par l'intelligence artificielle.
            </p>
          </div>

          <div>
            <h4 className="text-white text-[14.5px] font-medium mb-4">Explorer</h4>
            <ul className="space-y-2.5 text-[14px] text-[#A8B3AB]">
              <li><Link to="/recherche?transaction_type=vente" className="hover:text-white transition-colors">Acheter</Link></li>
              <li><Link to="/recherche?transaction_type=location" className="hover:text-white transition-colors">Louer</Link></li>
              <li><Link to="/agences" className="hover:text-white transition-colors">Agences partenaires</Link></li>
              <li><Link to="/assistant-ia" className="hover:text-white transition-colors">Assistant IA</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[14.5px] font-medium mb-4">Villes</h4>
            <ul className="space-y-2.5 text-[14px] text-[#A8B3AB]">
              {CITIES.slice(0, 4).map((c) => (
                <li key={c}>
                  <Link to={`/recherche?city=${encodeURIComponent(c)}`} className="hover:text-white transition-colors">
                    Immobilier à {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[14.5px] font-medium mb-4">Contact</h4>
            <ul className="space-y-2.5 text-[14px] text-[#A8B3AB]">
              <li className="flex items-center gap-2">
                <Phone size={14} /> +212 5 22 00 00 00
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} /> contact@darimmo.ma
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-5">
              {["facebook", "instagram", "linkedin"].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <SocialIcon name={name} size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#8C9F94]">
          <p>© 2026 DarImmo. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">CGU</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
