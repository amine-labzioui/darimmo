import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Trash2, CheckCircle2, ImagePlus } from "lucide-react";
import { useForm } from "../../hooks/useForm";
import { validateAnnonceForm } from "../../utils/validators";
import { annonceService } from "../../services/annonceService";
import { useNotification } from "../../hooks/useNotification";
import { useAuth } from "../../hooks/useAuth";
import { CITY_OPTIONS, normalizeCity, PROPERTY_TYPES, TRANSACTION_TYPES, ANNONCE_STATUS } from "../../utils/constants";
import MapPicker from "../Shared/MapPicker";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { paymentService } from "../../services/paymentService";
import BoostAnnonceCard from "./sections/BoostAnnonceCard";

export default function EditAnnonce() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useNotification();
  const { isAgence } = useAuth();
  const dashboardBase = isAgence ? "/agence" : "/client";

  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [mapPosition, setMapPosition] = useState(null);
  const reverseTimeout = useRef(null);
  const [newImages, setNewImages] = useState([]);
  const [boostPlans, setBoostPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const { values, errors, submitting, handleChange, handleSubmit, setValues } = useForm(
    {
      title: "", description: "", property_type: "villa", transaction_type: "vente",
      city: "", neighborhood: "", address: "", latitude: "", longitude: "", price: "", surface: "",
      bedrooms: 1, bathrooms: 1, has_parking: false, has_pool: false,
      has_garden: false, is_furnished: false,
    },
    validateAnnonceForm
  );
   
  useEffect(() => {
    annonceService
      .getById(id)
      .then((data) => {
        setAnnonce(data);
        setValues({
          title: data.title,
          description: data.description,
          property_type: data.property_type,
          transaction_type: data.transaction_type,
          city: data.city,
          neighborhood: data.neighborhood || "",
          address: data.address || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
          price: data.price,
          surface: data.surface,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          has_parking: data.has_parking,
          has_pool: data.has_pool,
          has_garden: data.has_garden,
          is_furnished: data.is_furnished,
        });

        if (data.latitude && data.longitude) {
          setMapPosition({
            lat: Number(data.latitude),
            lng: Number(data.longitude),
          });
        }
      })
      .catch(() => setServerError("Impossible de charger cette annonce."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 2. useEffect pour charger les plans de boost
  useEffect(() => {
    paymentService
      .getBoostPlans()
      .then((response) => {
        // Kants2kdo bli dima ghadi n7eto tableau (array)
        if (Array.isArray(response)) {
          setBoostPlans(response);
        } else {
          // Ila l'backend msayft l'données weste 'data' aw 'results'
          setBoostPlans(response?.data || response?.results || []);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement boost plans:", err);
        setBoostPlans([]); // Ila w9e3 mochkil n7eto tableau khawi bach may-crashich
      })
      .finally(() => setLoadingPlans(false));
  }, []);

  async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );

    const data = await response.json();

    const address = data.address || {};

    // La ville renvoyée par la carte n'est acceptée que si elle fait partie de la liste.
    const mapCity = normalizeCity(address.city || address.town || address.village);
    const isListedCity = CITY_OPTIONS.some((c) => c.value === mapCity);

    setValues((prev) => ({
      ...prev,

      latitude: Number(lat).toFixed(7),
      longitude: Number(lng).toFixed(7),

      address: data.display_name || "",

      city: isListedCity ? mapCity : prev.city,

      neighborhood:
        address.suburb ||
        address.neighbourhood ||
        address.quarter ||
        prev.neighborhood,
    }));

  } catch (err) {
    console.error(err);
  }
}

  const onSubmit = handleSubmit(async (data) => {
    setServerError("");
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    newImages.forEach((file) => formData.append("uploaded_images", file));

    try {
      await annonceService.update(id, formData);
      pushToast({ type: "success", title: "Annonce mise à jour" });
      setNewImages([]);
    } catch (err) {
       console.error(err);
  console.error(err.response?.data);

  setServerError(
    JSON.stringify(err.response?.data || err.message));
    }
  });

  async function handlePublish() {
    try {
      await annonceService.publier(id);
      pushToast({ type: "success", title: "Annonce publiée" });
      const updated = await annonceService.getById(id);
      setAnnonce(updated);
    } catch {
      pushToast({ type: "error", title: "Impossible de publier l'annonce" });
    }
  }
  async function handleBoost(planId) {
  try {
    const data = await paymentService.createCheckout({
      annonceId: id,
      boostPlanId: planId,
      provider: "cmi",
    });

    window.location.href = data.checkout_url;

  } catch (err) {
    console.error(err);
    pushToast({
      type: "error",
      title: "Impossible de lancer le paiement",
    });
  }
}

  async function handleDelete() {
    if (!confirm("Supprimer définitivement cette annonce ?")) return;
    try {
      await annonceService.remove(id);
      pushToast({ type: "success", title: "Annonce supprimée" });
      navigate(`${dashboardBase}/annonces`);
    } catch {
      pushToast({ type: "error", title: "Impossible de supprimer l'annonce" });
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Chargement de l'annonce…" />;
  if (!annonce) return <p className="text-[#5C6961]">{serverError}</p>;

  const statusInfo = ANNONCE_STATUS[annonce.status];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1
          className="text-2xl text-[#1C2520]"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Modifier l'annonce
        </h1>
        <span className={`px-3 py-1 rounded-full text-[12.5px] font-medium ${statusInfo?.badgeClass || ""}`}>
          {statusInfo?.label}
        </span>
      </div>
      <p className="text-[#5C6961] text-sm mb-7">{annonce.views_count} vue(s) au total</p>

      {annonce.status !== "published" && (
        <button
          onClick={handlePublish}
          className="flex items-center gap-2 mb-6 px-5 py-2.5 rounded-xl bg-[#ECFDF5] text-[#047857] text-[14px] font-medium hover:bg-[#d1fae5] transition-colors"
        >
          <CheckCircle2 size={17} /> Publier cette annonce
        </button>
      )}
      <BoostAnnonceCard
  boostPlans={boostPlans}
  loadingPlans={loadingPlans}
  annonce={annonce}
  onBoost={handleBoost}
/>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-[#E6DFD0] p-7 space-y-6">
        {serverError && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        <Field label="Titre" error={errors.title}>
          <input name="title" value={values.title} onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]" />
        </Field>

        <Field label="Description" error={errors.description}>
          <textarea name="description" value={values.description} onChange={handleChange} rows={5}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857] resize-none" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Type de bien">
            <select name="property_type" value={values.property_type} onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857] bg-white">
              {PROPERTY_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="Transaction">
            <select name="transaction_type" value={values.transaction_type} onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857] bg-white">
              {TRANSACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">

  <Field label="Adresse">

    <input
      name="address"
      value={values.address}
      onChange={handleChange}
      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] outline-none focus:border-[#047857]"
    />

  </Field>

  <div></div>

</div>
<div className="space-y-3">

  <label className="block text-[13px] font-medium text-[#3F4A43]">
    Localisation sur la carte
  </label>

  <MapPicker
  position={mapPosition}
  setPosition={(pos) => {
    setMapPosition(pos);

    if (reverseTimeout.current) {
      clearTimeout(reverseTimeout.current);
    }

    reverseTimeout.current = setTimeout(() => {
      reverseGeocode(pos.lat, pos.lng);
    }, 500);
  }}
/>

  <div className="grid grid-cols-2 gap-4">

    <input
      value={values.latitude}
      readOnly
      className="px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] bg-gray-50 text-[14px]"
      placeholder="Latitude"
    />

    <input
      value={values.longitude}
      readOnly
      className="px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] bg-gray-50 text-[14px]"
      placeholder="Longitude"
    />

  </div>

  <p className="text-xs text-[#6B7280]">
    Cliquez sur la carte pour choisir l'emplacement exact du bien.
  </p>

</div>
<div className="grid grid-cols-2 gap-4">

  <Field label="Latitude">

    <input
      name="latitude"
      value={values.latitude}
      onChange={handleChange}
      placeholder="31.6295"
      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] outline-none focus:border-[#047857]"
    />

  </Field>

  <Field label="Longitude">

    <input
      name="longitude"
      value={values.longitude}
      onChange={handleChange}
      placeholder="-7.9811"
      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] outline-none focus:border-[#047857]"
    />

  </Field>

</div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Prix (MAD)" error={errors.price}>
            <input type="number" name="price" value={values.price} onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]" />
          </Field>
          <Field label="Surface (m²)" error={errors.surface}>
            <input type="number" name="surface" value={values.surface} onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Chambres">
            <input type="number" min="0" name="bedrooms" value={values.bedrooms} onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]" />
          </Field>
          <Field label="Salles de bain">
            <input type="number" min="0" name="bathrooms" value={values.bathrooms} onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] text-[14.5px] outline-none focus:border-[#047857]" />
          </Field>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "has_parking", label: "Parking" },
            { name: "has_pool", label: "Piscine" },
            { name: "has_garden", label: "Jardin" },
            { name: "is_furnished", label: "Meublé" },
          ].map((opt) => (
            <label key={opt.name} className="flex items-center gap-2 cursor-pointer text-[13.5px] text-[#3F4A43]">
              <input type="checkbox" name={opt.name} checked={values[opt.name]} onChange={handleChange}
                className="w-4 h-4 rounded border-[#E6DFD0] text-[#047857]" />
              {opt.label}
            </label>
          ))}
        </div>

        {annonce.images?.length > 0 && (
          <div>
            <label className="block text-[13px] font-medium text-[#3F4A43] mb-2">Photos actuelles</label>
            <div className="grid grid-cols-4 gap-2">
              {annonce.images.map((img) => (
                <img key={img.id} src={img.image} alt="" className="w-full h-20 object-cover rounded-lg" />
              ))}
            </div>
          </div>
        )}

        <Field label="Ajouter des photos">
          <input
            type="file" multiple accept="image/*"
            onChange={(e) => setNewImages(Array.from(e.target.files))}
            className="w-full text-[13.5px] text-[#5C6961] file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-[#ECFDF5] file:text-[#047857] file:text-[13px] file:font-medium"
          />
        </Field>

        <div className="flex gap-3">
          <button
            type="submit" disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#047857] text-white text-[14.5px] font-medium hover:bg-[#035f46] transition-colors disabled:opacity-60"
          >
            <Save size={17} />
            {submitting ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
          <button
            type="button" onClick={handleDelete}
            className="px-5 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={17} />
          </button>
        </div>
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
