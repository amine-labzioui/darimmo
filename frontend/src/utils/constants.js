/**
 * Constantes globales — DarImmo
 */

export const CITIES = ["Casablanca", "Marrakech", "Rabat", "Tanger", "Fès", "Agadir"];

export const PROPERTY_TYPES = [
  { value: "villa", label: "Villa" },
  { value: "appartement", label: "Appartement" },
  { value: "riad", label: "Riad" },
  { value: "maison", label: "Maison" },
  { value: "terrain", label: "Terrain" },
];

export const TRANSACTION_TYPES = [
  { value: "vente", label: "À Vendre" },
  { value: "location", label: "À Louer" },
];

export const ANNONCE_STATUS = {
  draft: { label: "Brouillon", color: "gray" },
  pending: { label: "En attente de validation", color: "amber" },
  published: { label: "Publiée", color: "primary" },
  sold: { label: "Vendue", color: "terracotta" },
  rented: { label: "Louée", color: "terracotta" },
  archived: { label: "Archivée", color: "gray" },
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
