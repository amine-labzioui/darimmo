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

export function getMainImageUrl(annonce, fallback = "/placeholder-property.jpg") {
  return annonce?.main_image || fallback;
}
