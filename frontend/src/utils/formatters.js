/**
 * Fonctions de formatage — DarImmo
 */

export function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("fr-FR").format(num);
}

export function formatPriceWithCurrency(value, transactionType) {
  const formatted = formatPrice(value);
  if (formatted === "—") return formatted;
  const suffix = transactionType === "location" ? " MAD/mois" : " MAD";
  return formatted + suffix;
}

export function formatSurface(value) {
  if (value === null || value === undefined) return "—";
  return `${formatPrice(value)} m²`;
}

export function formatDate(isoString, options = {}) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(date);
}

export function formatDateTime(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function timeAgo(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  const seconds = Math.floor((new Date() - date) / 1000);

  const intervals = [
    { label: "an", seconds: 31536000 },
    { label: "mois", seconds: 2592000 },
    { label: "jour", seconds: 86400 },
    { label: "heure", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `il y a ${count} ${interval.label}${count > 1 && interval.label !== "mois" ? "s" : ""}`;
    }
  }
  return "à l'instant";
}

export function truncateText(text, maxLength = 120) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

export function initials(firstName = "", lastName = "") {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
}
