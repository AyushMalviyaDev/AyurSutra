import api from "./api";

export const getPatientProfile = async () => {
  const response = await api.get("/patient/profile/");
  return response.data;
};

export const getPatientTherapies = async () => {
  const response = await api.get("/patient/therapies/");
  return response.data;
};

export const getPatientSchedule = async () => {
  const response = await api.get("/patient/schedule/");
  return response.data;
};

export const submitSelfAssessment = async (data) => {
  const response = await api.post("/patient/self-assessment/", data);
  return response.data;
};