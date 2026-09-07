/**
 * Fonctions de validation de formulaires — DarImmo
 */

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
  // Numéros marocains : +212XXXXXXXXX ou 0XXXXXXXXX
  return /^(\+212|0)[5-7]\d{8}$/.test(phone.replace(/\s/g, ""));
}

export function isStrongPassword(password) {
  return password && password.length >= 8;
}

export function validateRegisterForm(data) {
  const errors = {};

  if (!data.username || data.username.trim().length < 3) {
    errors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères.";
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = "Adresse e-mail invalide.";
  }
  if (!data.password || !isStrongPassword(data.password)) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (data.password !== data.password_confirm) {
    errors.password_confirm = "Les mots de passe ne correspondent pas.";
  }
  if (!data.role) {
    errors.role = "Veuillez sélectionner un type de compte.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateAnnonceForm(data) {
  const errors = {};

  if (!data.title || data.title.trim().length < 5) {
    errors.title = "Le titre doit contenir au moins 5 caractères.";
  }
  if (!data.description || data.description.trim().length < 20) {
    errors.description = "La description doit contenir au moins 20 caractères.";
  }
  if (!data.city) {
    errors.city = "Veuillez sélectionner une ville.";
  }
  if (!data.property_type) {
    errors.property_type = "Veuillez sélectionner un type de bien.";
  }
  if (!data.price || Number(data.price) <= 0) {
    errors.price = "Veuillez indiquer un prix valide.";
  }
  if (!data.surface || Number(data.surface) <= 0) {
    errors.surface = "Veuillez indiquer une surface valide.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
