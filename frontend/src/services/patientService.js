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

export const getAssessments = async (params) => {
  const response = await api.get("/patients/assessments/", { params });
  return response.data;
};

export const createAssessment = async (data) => {
  const response = await api.post("/patients/assessments/", data);
  return response.data;
};

export const getConsultations = async (params) => {
  const response = await api.get("/patients/consultations/", { params });
  return response.data;
};

export const createConsultation = async (data) => {
  const response = await api.post("/patients/consultations/", data);
  return response.data;
};

export const getMedicalRecords = async (params) => {
  const response = await api.get("/patients/medical-records/", { params });
  return response.data;
};

export const createMedicalRecord = async (data) => {
  const response = await api.post("/patients/medical-records/", data);
  return response.data;
};