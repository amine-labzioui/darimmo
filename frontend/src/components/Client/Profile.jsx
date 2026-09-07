import { useState } from "react";
import { Save, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import { useNotification } from "../../hooks/useNotification";
import { CITIES } from "../../utils/constants";
import { initials } from "../../utils/formatters";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { pushToast } = useNotification();

  const [values, setValues] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    city: user?.city || "",
    company_name: user?.company_name || "",
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await authService.updateProfile(values);
      updateUser(updated);
      pushToast({ type: "success", title: "Profil mis à jour" });
    } catch {
      pushToast({ type: "error", title: "Impossible de mettre à jour le profil" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1
        className="text-2xl text-[#1C2520] mb-7"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        Mon profil
      </h1>

      <div className="flex items-center gap-4 mb-7">
        <div className="w-16 h-16 rounded-full bg-[#047857] text-white text-xl font-medium flex items-center justify-center">
          {initials(user?.first_name, user?.last_name) || <User size={24} />}
        </div>
        <div>
          <p className="text-[16px] font-medium text-[#1C2520]">{user?.email}</p>
          <p className="text-[13px] text-[#5C6961]">{user?.role === "agence" ? "Agence immobilière" : "Client"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E6DFD0] p-7 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom" name="first_name" value={values.first_name} onChange={handleChange} />
          <Field label="Nom" name="last_name" value={values.last_name} onChange={handleChange} />
        </div>

        <Field label="Téléphone" name="phone" value={values.phone} onChange={handleChange} />

        <div>
          <label className="block text-[13px] font-medium text-[#3F4A43] mb-1.5">Ville</label>
          <select
            name="city" value={values.city} onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857] bg-white"
          >
            <option value="">Sélectionner</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {user?.role === "agence" && (
          <Field label="Nom de l'agence" name="company_name" value={values.company_name} onChange={handleChange} />
        )}

        <button
          type="submit" disabled={submitting}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#047857] text-white text-[14.5px] font-medium hover:bg-[#035f46] transition-colors disabled:opacity-60"
        >
          <Save size={17} />
          {submitting ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#3F4A43] mb-1.5">{label}</label>
      <input
        name={name} value={value} onChange={onChange}
        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]"
      />
    </div>
  );
}
