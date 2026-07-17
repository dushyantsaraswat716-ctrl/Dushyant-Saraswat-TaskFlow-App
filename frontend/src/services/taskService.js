import api from "./api";

export const getTasks = (params = {}) => api.get("/task", { params }).then((res) => res.data);
export const getTask = (id) => api.get(`/task/${id}`).then((res) => res.data);
export const createTask = (data) => api.post("/task", data).then((res) => res.data);
export const updateTask = (id, data) => api.put(`/task/${id}`, data).then((res) => res.data);
export const deleteTask = (id) => api.delete(`/task/${id}`).then((res) => res.data);
export const toggleTask = (id) => api.patch(`/task/${id}/toggle`).then((res) => res.data);
export const getStats = () => api.get("/task/stats").then((res) => res.data);