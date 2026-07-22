import api from "./api";

export const registerUser = (data) => api.post("/auth/register", data).then((res) => res.data);
export const loginUser = (data) => api.post("/auth/login", data).then((res) => res.data);
export const fetchMe = () => api.get("/auth/me").then((res) => res.data);
export const updateProfile = (data) => api.put("/auth/profile", data).then((res) => res.data);
export const uploadAvatar = (formData) =>
  api.post("/auth/avatar", formData, { headers: { "Content-Type": undefined } }).then((res) => res.data);
export const changePassword = (data) => api.put("/auth/change-password", data).then((res) => res.data);
export const forgotPassword = (data) => api.post("/auth/forgot-password", data).then((res) => res.data);
export const resetPassword = (token, data) => api.post(`/auth/reset-password/${token}`, data).then((res) => res.data);
export const googleLogin = (credential) => api.post("/auth/google", { credential }).then((res) => res.data);