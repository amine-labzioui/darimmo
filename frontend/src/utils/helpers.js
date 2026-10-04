/**
 * Fonctions utilitaires diverses — DarImmo
 */

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function buildQueryString(params) {
  const cleaned = Object.entries(params).filter(
    ([, value]) => value !== "" && value !== null && value !== undefined
  );
  return new URLSearchParams(cleaned).toString();
}

export function getOrCreateSessionId() {
  const key = "darimmo_ai_session_id";
  let sessionId = sessionStorage_safe_get(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage_safe_set(key, sessionId);
  }
  return sessionId;
}

// NB: l'environnement Artifacts interdit localStorage/sessionStorage, mais
// cette app frontend est un projet React standalone (Vite), donc sessionStorage
// fonctionne normalement ici. Petits wrappers défensifs au cas où.
function sessionStorage_safe_get(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function sessionStorage_safe_set(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* no-op */
  }
}

export function debounce(fn, delay = 400) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Boost réellement actif : annonce boostée et date de fin non dépassée (ou absente).
export function isBoostActive(annonce) {
  if (!annonce?.is_boosted) return false;
  if (!annonce.boosted_until) return true;
  return new Date(annonce.boosted_until) > new Date();
}

// Phrase affichée à la place des plans de boost quand l'annonce n'est pas publiée.
// Retourne null si le boost est possible (annonce publiée, ou annonce non chargée).
export function getBoostUnavailableMessage(annonce) {
  if (!annonce || annonce.status === "published") return null;
  if (annonce.status === "draft" || annonce.status === "pending") {
    return "Le boost sera disponible après la publication de l'annonce.";
  }
  return "Le boost est réservé aux annonces publiées.";
}

export function getMainImageUrl(annonce, fallback = "/placeholder-property.svg") {
  return annonce?.main_image || fallback;
}
