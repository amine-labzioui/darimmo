import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, Building2, UserPlus } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import { validateRegisterForm } from "../../utils/validators";
import { CITIES } from "../../utils/constants";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const { values, errors, submitting, handleChange, setFieldValue, handleSubmit } = useForm(
    {
      username: "", email: "", password: "", password_confirm: "",
      first_name: "", last_name: "", phone: "", city: "",
      role: "client", company_name: "",
    },
    validateRegisterForm
  );

  const onSubmit = handleSubmit(async (data) => {
    setServerError("");
    try {
      await register(data);
      navigate("/tableau-de-bord");
    } catch (err) {
      const apiErrors = err?.response?.data;
      if (apiErrors && typeof apiErrors === "object") {
        const firstKey = Object.keys(apiErrors)[0];
        setServerError(Array.isArray(apiErrors[firstKey]) ? apiErrors[firstKey][0] : String(apiErrors[firstKey]));
      } else {
        setServerError("Une erreur est survenue lors de l'inscription.");
      }
    }
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1
            className="text-2xl text-[#1C2520]"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
          >
            Créer votre compte DarImmo
          </h1>
          <p className="text-[#5C6961] text-sm mt-2">
            Rejoignez la plateforme immobilière du Maroc
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-[#E6DFD0] p-7 space-y-5">
          {serverError && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          {/* Type de compte */}
          <div>
            <label className="block text-[13px] font-medium text-[#3F4A43] mb-2">
              Type de compte
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "client", label: "Client", desc: "Je cherche un bien" },
                { value: "agence", label: "Agence", desc: "Je publie des annonces" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFieldValue("role", opt.value)}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                    values.role === opt.value
                      ? "border-[#047857] bg-[#ECFDF5]"
                      : "border-[#E6DFD0] hover:border-[#047857]/40"
                  }`}
                >
                  <p className="text-[14px] font-medium text-[#1C2520]">{opt.label}</p>
                  <p className="text-[12px] text-[#5C6961]">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField label="Prénom" name="first_name" value={values.first_name} onChange={handleChange} icon={User} />
            <TextField label="Nom" name="last_name" value={values.last_name} onChange={handleChange} icon={User} />
          </div>

          <TextField
            label="Nom d'utilisateur"
            name="username"
            value={values.username}
            onChange={handleChange}
            icon={User}
            error={errors.username}
            required
          />

          <TextField
            label="Adresse e-mail"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            icon={Mail}
            error={errors.email}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <TextField label="Téléphone" name="phone" value={values.phone} onChange={handleChange} icon={Phone} />
            <div>
              <label className="block text-[13px] font-medium text-[#3F4A43] mb-1.5">Ville</label>
              <select
                name="city"
                value={values.city}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857] bg-white"
              >
                <option value="">Sélectionner</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {values.role === "agence" && (
            <TextField
              label="Nom de l'agence"
              name="company_name"
              value={values.company_name}
              onChange={handleChange}
              icon={Building2}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Mot de passe"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              icon={Lock}
              error={errors.password}
              required
            />
            <TextField
              label="Confirmer"
              name="password_confirm"
              type="password"
              value={values.password_confirm}
              onChange={handleChange}
              icon={Lock}
              error={errors.password_confirm}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#047857] text-white text-[14.5px] font-medium hover:bg-[#035f46] transition-colors disabled:opacity-60"
          >
            <UserPlus size={17} />
            {submitting ? "Création du compte…" : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-[14px] text-[#5C6961] mt-6">
          Déjà un compte ?{" "}
          <Link to="/connexion" className="text-[#047857] font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

function TextField({ label, name, type = "text", value, onChange, icon: Icon, error, required }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#3F4A43] mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9189]" />}
        <input
          type={type}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className={`w-full ${Icon ? "pl-10" : "pl-3.5"} pr-4 py-2.5 rounded-xl border text-[14.5px] outline-none ${
            error ? "border-red-400" : "border-[#E6DFD0] focus:border-[#047857]"
          }`}
        />
      </div>
      {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
