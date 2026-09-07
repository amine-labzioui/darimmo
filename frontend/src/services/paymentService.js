/**
 * Service Paiements — DarImmo
 */

import api from "./api";

export const paymentService = {
  /**
   * Liste des formules de boost
   */
  async getBoostPlans() {
    const { data } = await api.get("/payments/boost-plans/");
    return data;
  },

  /**
   * Historique des paiements
   */
  async getTransactions() {
    const { data } = await api.get("/payments/transactions/");
    return data;
  },

  /**
   * Création d'un checkout
   */
  async createCheckout({
    annonceId,
    boostPlanId,
    provider = "cmi",
  }) {
    const { data } = await api.post("/payments/checkout/", {
      annonce_id: annonceId,
      boost_plan_id: boostPlanId,
      provider,
    });

    return data;
  },
};