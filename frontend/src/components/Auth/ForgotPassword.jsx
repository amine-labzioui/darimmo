import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    // NB: endpoint de réinitialisation à brancher côté backend (hors périmètre actuel)
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 600);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/connexion" className="flex items-center gap-1.5 text-[13.5px] text-[#5C6961] hover:text-[#047857] mb-6">
          <ArrowLeft size={15} /> Retour à la connexion
        </Link>

        <div className="bg-white rounded-2xl border border-[#E6DFD0] p-7">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-4">
                <Send size={22} className="text-[#047857]" />
              </div>
              <h2
                className="text-lg text-[#1C2520] mb-2"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
              >
                E-mail envoyé
              </h2>
              <p className="text-[#5C6961] text-sm">
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de
                réinitialisation sous quelques minutes.
              </p>
            </div>
          ) : (
            <>
              <h1
                className="text-xl text-[#1C2520] mb-2"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
              >
                Mot de passe oublié
              </h1>
              <p className="text-[#5C6961] text-sm mb-6">
                Entrez votre adresse e-mail, nous vous enverrons un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-[#3F4A43] mb-1.5">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9189]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#047857] text-white text-[14.5px] font-medium hover:bg-[#035f46] transition-colors disabled:opacity-60"
                >
                  {submitting ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
