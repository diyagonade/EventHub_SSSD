import api from "./axios";

export const listEvents = () => api.get("/events");
export const getEvent = (id) => api.get(`/events/${id}`);
export const getMyEvents = () => api.get("/events/my");
export const createEvent = (data) => api.post("/events", data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
