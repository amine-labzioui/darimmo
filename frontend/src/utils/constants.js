/**
 * Constantes globales — DarImmo
 */

export const CITIES = ["Casablanca", "Marrakech", "Rabat", "Tanger", "Fès", "Agadir"];

// Villes proposées dans les filtres. `value` = orthographe stockée en base
// (la même que celle envoyée par l'agent de recherche n8n), `label` = texte affiché.
export const CITY_OPTIONS = [
  { value: "Casablanca", label: "Casablanca" },
  { value: "Marrakesh", label: "Marrakech" },
  { value: "Rabat", label: "Rabat" },
  { value: "Tanger", label: "Tanger" },
  { value: "Fès", label: "Fès" },
  { value: "Agadir", label: "Agadir" },
];

const CITY_ALIASES = {
  marrakech: "Marrakesh",
  marrakesh: "Marrakesh",
  casablanca: "Casablanca",
  casa: "Casablanca",
  rabat: "Rabat",
  agadir: "Agadir",
  tanger: "Tanger",
  tangier: "Tanger",
  fes: "Fès",
  "fès": "Fès",
  fez: "Fès",
};

// Ramène une ville saisie ou reçue (URL, carte) à son orthographe canonique.
// Une ville inconnue est renvoyée telle quelle.
export function normalizeCity(rawCity) {
  if (!rawCity) return rawCity;
  return CITY_ALIASES[rawCity.trim().toLowerCase()] || rawCity;
}

export const PROPERTY_TYPES = [
  { value: "villa", label: "Villa" },
  { value: "appartement", label: "Appartement" },
  { value: "riad", label: "Riad" },
  { value: "maison", label: "Maison" },
  { value: "terrain", label: "Terrain" },
];

// Libellé d'un type de bien ("appartement" → "Appartement").
export function getPropertyTypeLabel(value) {
  return PROPERTY_TYPES.find((t) => t.value === value)?.label || value;
}

export const TRANSACTION_TYPES = [
  { value: "vente", label: "À Vendre" },
  { value: "location", label: "À Louer" },
];

// badgeClass : classes Tailwind écrites en entier (Tailwind ne génère pas les
// classes construites dynamiquement, ex. `bg-${color}-100`).
export const ANNONCE_STATUS = {
  draft: { label: "Brouillon", color: "gray", badgeClass: "bg-gray-100 text-gray-700" },
  pending: { label: "En attente de validation", color: "amber", badgeClass: "bg-amber-100 text-amber-700" },
  published: { label: "Publiée", color: "primary", badgeClass: "bg-primary-100 text-primary-700" },
  sold: { label: "Vendue", color: "terracotta", badgeClass: "bg-terracotta-500/10 text-terracotta-600" },
  rented: { label: "Louée", color: "terracotta", badgeClass: "bg-terracotta-500/10 text-terracotta-600" },
  archived: { label: "Archivée", color: "gray", badgeClass: "bg-gray-100 text-gray-700" },
};

export const PRICE_RANGES = [
  { label: "Moins de 1M MAD", min: 0, max: 1000000 },
  { label: "1M – 3M MAD", min: 1000000, max: 3000000 },
  { label: "3M – 6M MAD", min: 3000000, max: 6000000 },
  { label: "6M+ MAD", min: 6000000, max: null },
];

export const USER_ROLES = {
  client: "Client",
  agence: "Agence immobilière",
  admin: "Administrateur",
};

export const VISIT_STATUS = {
  pending: { label: "En attente", color: "amber" },
  confirmed: { label: "Confirmée", color: "primary" },
  cancelled: { label: "Annulée", color: "red" },
  completed: { label: "Effectuée", color: "gray" },
};
