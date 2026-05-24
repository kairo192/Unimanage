import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAN_IP, API_PORT } from '../config';

const API_BASE = `http://${LAN_IP}:${API_PORT}/api`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('Error reading token:', e);
  }
  return config;
});

export const loginStudent = async (identifier, password) => {
  const body = { password };
  if (identifier.includes('@')) {
    body.email = identifier;
  } else {
    body.student_number = identifier;
  }
  const res = await api.post('/auth/student-login', body);
  return res.data;
};

export const getMyTickets = async () => {
  const res = await api.get('/tickets');
  return res.data;
};

export const createTicket = async (type, description, image_url) => {
  const body = { type, description };
  if (image_url) body.image_url = image_url;
  const res = await api.post('/tickets', body);
  return res.data;
};

export const deleteTicket = async (id) => {
  const res = await api.delete(`/tickets/${id}`);
  return res.data;
};

export const uploadTicketImage = async (imageUri) => {
  if (!imageUri || typeof imageUri !== 'string') {
    throw new Error('Invalid image URI');
  }
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const ext = filename.split('.').pop().toLowerCase();
  formData.append('image', {
    uri: imageUri,
    type: `image/${ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpeg'}`,
    name: filename,
  });
  const token = await AsyncStorage.getItem('token');
  const res = await axios.post(`${API_BASE}/tickets/image-upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    timeout: 30000,
  });
  return res.data;
};

export const changePassword = async (current_password, new_password) => {
  const res = await api.put('/auth/student-password', { current_password, new_password });
  return res.data;
};

export default api;
