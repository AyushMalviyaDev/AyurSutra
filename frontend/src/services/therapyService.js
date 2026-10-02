import api from "./api";

export const getTherapies = async () => {
  const response = await api.get("/therapies/");
  return response.data;
};

export const getPatientTherapies = async (params) => {
  const response = await api.get("/therapies/patient-therapies/", { params });
  return response.data;
};

export const prescribeTherapy = async (data) => {
  const response = await api.post("/therapies/patient-therapies/", data);
  return response.data;
};

export const updatePatientTherapy = async (id, data) => {
  const response = await api.patch(`/therapies/patient-therapies/${id}/`, data);
  return response.data;
};
