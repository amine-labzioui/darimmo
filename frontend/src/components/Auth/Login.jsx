import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.non_field_errors?.[0] ||
          err?.response?.data?.detail ||
          "Email ou mot de passe incorrect."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1
            className="text-2xl text-[#1C2520]"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
          >
            Bon retour parmi nous
          </h1>
          <p className="text-[#5C6961] text-sm mt-1">
            Connectez-vous pour accéder à votre espace DarImmo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E6DFD0] p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-[#3F4A43] mb-1.5">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9189]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E6DFD0] text-sm outline-none focus:border-[#047857]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#3F4A43] mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9189]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 rounded-lg border border-[#E6DFD0] text-sm outline-none focus:border-[#047857]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9189]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#047857] text-white text-sm font-medium hover:bg-[#035f46] transition-colors disabled:opacity-60"
          >
            <LogIn size={16} />
            {submitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-[#5C6961] mt-5">
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="text-[#047857] font-medium hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
