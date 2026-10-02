import api from "./api";

export const getSessions = async (params) => {
  const response = await api.get("/scheduling/sessions/", { params });
  return response.data;
};

export const updateSession = async (id, data) => {
  const response = await api.patch(`/scheduling/sessions/${id}/`, data);
  return response.data;
};

export const cancelSession = async (id) => {
  const response = await api.patch(`/scheduling/sessions/${id}/`, {
    status: "CANCELLED",
  });
  return response.data;
};

export const findAvailableSlots = async (params) => {
  const response = await api.get("/scheduling/find-slots/", { params });
  return response.data;
};

export const bookSession = async (data) => {
  const response = await api.post("/scheduling/book-session/", data);
  return response.data;
};

export const getRooms = async () => {
  const response = await api.get("/scheduling/rooms/");
  return response.data;
};

export const createRoom = async (data) => {
  const response = await api.post("/scheduling/rooms/", data);
  return response.data;
};

export const updateRoom = async (id, data) => {
  const response = await api.patch(`/scheduling/rooms/${id}/`, data);
  return response.data;
};

export const deleteRoom = async (id) => {
  const response = await api.delete(`/scheduling/rooms/${id}/`);
  return response.data;
};

export const getRoomAvailability = async (params) => {
  const response = await api.get("/scheduling/room-availability/", { params });
  return response.data;
};

export const createRoomAvailability = async (data) => {
  const response = await api.post("/scheduling/room-availability/", data);
  return response.data;
};

export const deleteRoomAvailability = async (id) => {
  const response = await api.delete(`/scheduling/room-availability/${id}/`);
  return response.data;
};

export const getTherapistAvailability = async (params) => {
  const response = await api.get("/scheduling/availability/", { params });
  return response.data;
};

export const createTherapistAvailability = async (data) => {
  const response = await api.post("/scheduling/availability/", data);
  return response.data;
};

export const deleteTherapistAvailability = async (id) => {
  const response = await api.delete(`/scheduling/availability/${id}/`);
  return response.data;
};

export const getProgress = async (params) => {
  const response = await api.get("/scheduling/progress/", { params });
  return response.data;
};

export const recordProgress = async (data) => {
  const response = await api.post("/scheduling/progress/", data);
  return response.data;
};
