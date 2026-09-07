import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "../../hooks/useForm";
import { validateAnnonceForm } from "../../utils/validators";
import { annonceService } from "../../services/annonceService";
import { useNotification } from "../../hooks/useNotification";
import { CITIES, PROPERTY_TYPES, TRANSACTION_TYPES } from "../../utils/constants";

export default function CreateAnnonce() {
  const navigate = useNavigate();
  const { pushToast } = useNotification();
  const [images, setImages] = useState([]);
  const [serverError, setServerError] = useState("");

  const { values, errors, submitting, handleChange, handleSubmit } = useForm(
    {
      title: "", description: "", property_type: "villa", transaction_type: "vente",
      city: "", neighborhood: "", address: "", price: "", surface: "",
      bedrooms: 1, bathrooms: 1, has_parking: false, has_pool: false,
      has_garden: false, is_furnished: false,
    },
    validateAnnonceForm
  );

  const onSubmit = handleSubmit(async (data) => {
    setServerError("");
    const formData = new FormData();
    
    // إرسال جميع حقول النموذج
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // التعديل الجوهري: إرسال الصور كـ Array
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append("uploaded_images", images[i]);
      }
    }

    try {
      const annonce = await annonceService.create(formData);
      pushToast({ type: "success", title: "Annonce créée avec succès" });
      navigate(`/tableau-de-bord/annonces/${annonce.id}/modifier`);
    } catch (err) {
      console.error("Détail de l'erreur backend:", err.response?.data);
      setServerError(
        err?.response?.data?.message || 
        (typeof err?.response?.data === 'string' ? err.response.data : "Une erreur est survenue lors de la création.")
      );
    }
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-[#1C2520] mb-1" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
        Publier une nouvelle annonce
      </h1>
      <p className="text-[#5C6961] text-sm mb-7">
        Remplissez les informations de votre bien. Vous pourrez la publier après validation.
      </p>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-[#E6DFD0] p-7 space-y-6">
        {serverError && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        {/* بقية حقول النموذج تبقى كما هي */}
        <Field label="Titre de l'annonce" error={errors.title}>
          <input name="title" value={values.title} onChange={handleChange} placeholder="Ex : Villa moderne avec piscine à Marrakech" className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]" />
        </Field>

        <Field label="Description" error={errors.description}>
          <textarea name="description" value={values.description} onChange={handleChange} rows={5} placeholder="Décrivez le bien en détail..." className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857] resize-none" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Type de bien">
            <select name="property_type" value={values.property_type} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857] bg-white">
              {PROPERTY_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="Transaction">
            <select name="transaction_type" value={values.transaction_type} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857] bg-white">
              {TRANSACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Field label="Ville" error={errors.city}>
              <select name="city" value={values.city} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857] bg-white">
                <option value="">Sélectionner</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Quartier">
              <input name="neighborhood" value={values.neighborhood} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]" />
            </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Field label="Prix (MAD)" error={errors.price}>
                <input type="number" name="price" value={values.price} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]" />
            </Field>
            <Field label="Surface (m²)" error={errors.surface}>
                <input type="number" name="surface" value={values.surface} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]" />
            </Field>
        </div>

        <Field label="Photos du bien">
          <input
            type="file" multiple accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="w-full text-[13.5px] text-[#5C6961] file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-[#ECFDF5] file:text-[#047857] file:text-[13px] file:font-medium"
          />
          {images.length > 0 && (
            <p className="text-[12.5px] text-[#5C6961] mt-1.5">{images.length} fichier(s) sélectionné(s)</p>
          )}
        </Field>

        <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#047857] text-white text-[14.5px] font-medium hover:bg-[#035f46] transition-colors disabled:opacity-60">
          <Save size={17} />
          {submitting ? "Création en cours…" : "Créer l'annonce"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#3F4A43] mb-1.5">{label}</label>
      {children}
      {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}