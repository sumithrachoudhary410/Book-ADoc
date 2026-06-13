import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token and bypass headers to every request if available
API.interceptors.request.use((config) => {
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const getNotifications = () => API.get('/auth/notifications');
export const markNotificationsRead = () => API.post('/auth/notifications/mark-read');

// Doctors
export const getDoctors = (params) => API.get('/doctors', { params });
export const getDoctorById = (id) => API.get(`/doctors/${id}`);
export const applyAsDoctor = (data) => API.post('/doctors/apply', data);
export const getDoctorProfile = () => API.get('/doctors/profile/me');
export const updateDoctorProfile = (data) => API.put('/doctors/profile/me', data);
export const getSpecializations = () => API.get('/doctors/specializations');

// Appointments
export const bookAppointment = (data) => API.post('/appointments', data);
export const getPatientAppointments = () => API.get('/appointments/patient');
export const getDoctorAppointments = () => API.get('/appointments/doctor');
export const updateAppointmentStatus = (id, status) => API.put(`/appointments/${id}/status`, { status });
export const uploadDocument = (id, formData) =>
  API.post(`/appointments/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const submitFeedback = (id, data) => API.post(`/appointments/${id}/rate`, data);

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAllUsers = () => API.get('/admin/users');
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle`);
export const getAllDoctors = () => API.get('/admin/doctors');
export const updateDoctorStatus = (id, status) => API.put(`/admin/doctors/${id}/status`, { status });
