import api from "./axios";

export const registerForEvent = (eventId) =>
  api.post("/registrations", { eventId });
export const cancelRegistration = (eventId) =>
  api.delete(`/registrations/${eventId}`);
export const getMyRegistrations = () => api.get("/registrations/my");
