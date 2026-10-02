import api from "./api";

export const getMyProfile = async () => {
  const response = await api.get("/patients/me/");
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await api.put("/patients/me/", profileData);
  return response.data;
};

export const getMySessions = async () => {
  const response = await api.get("/scheduling/sessions/");
  return response.data;
};