import api from "./api";

export const adminService = {
  getStats() {
    return api.get("/admin-dashboard/stats/").then((r) => r.data);
  },

  getVisitRequests() {
    return api.get("/admin-dashboard/visit-requests/").then((r) => r.data);
  },

  acceptVisit(id, message = "") {
    return api.post(`/admin-dashboard/visit-requests/${id}/accept/`, {
      message,
    });
  },

  refuseVisit(id, message = "") {
    return api.post(`/admin-dashboard/visit-requests/${id}/refuse/`, {
      message,
    });
  },

  rescheduleVisit(id, proposed_date, message = "") {
    return api.post(`/admin-dashboard/visit-requests/${id}/reschedule/`, {
      proposed_date,
      message,
    });
  },
};