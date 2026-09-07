import { useState } from "react";
import { Lock, Save } from "lucide-react";
import { authService } from "../../services/authService";
import { useNotification } from "../../hooks/useNotification";

export default function ChangePassword() {
  const { pushToast } = useNotification();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setSubmitting(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      pushToast({ type: "success", title: "Mot de passe modifié avec succès" });
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setError(err?.response?.data?.old_password?.[0] || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1
        className="text-2xl text-[#1C2520] mb-7"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        Changer mon mot de passe
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E6DFD0] p-7 space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <PasswordField label="Mot de passe actuel" value={oldPassword} onChange={setOldPassword} />
        <PasswordField label="Nouveau mot de passe" value={newPassword} onChange={setNewPassword} />
        <PasswordField label="Confirmer le nouveau mot de passe" value={confirmPassword} onChange={setConfirmPassword} />

        <button
          type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#047857] text-white text-[14.5px] font-medium hover:bg-[#035f46] transition-colors disabled:opacity-60"
        >
          <Save size={17} />
          {submitting ? "Modification…" : "Modifier le mot de passe"}
        </button>
      </form>
    </div>
  );
}

function PasswordField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#3F4A43] mb-1.5">{label}</label>
      <div className="relative">
        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9189]" />
        <input
          type="password" required value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]"
        />
      </div>
    </div>
  );
}
