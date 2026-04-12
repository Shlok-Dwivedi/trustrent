import { create } from 'zustand';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Set up default axios config to try pulling JWT from storage immediately
const token = localStorage.getItem('trustrent_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,

  sendOTP: async (mobile) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE}/auth/send-otp`, { mobile });
      const devOtp = response.data?.data?.otp;
      if (devOtp) {
        console.log(`%c[DEV OTP]: ${devOtp}`, 'background: #222; color: #bada55; font-size: 1.2rem; padding: 5px;');
        console.info("TIP: You can also use the 'Magic OTP' 123456 to bypass any number.");
      }
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to send OTP' });
      return false;
    }
  },

  verifyOTP: async (mobile, otp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE}/auth/verify-otp`, { mobile, otp });
      const { token, user: userData, is_new } = response.data.data;
      
      // Save globally
      localStorage.setItem('trustrent_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({ user: userData, isAuthenticated: true, isLoading: false });
      return { success: true, is_new, user: userData };
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.error || 'Invalid OTP' });
      return { success: false };
    }
  },

  setupProfile: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE}/auth/setup-profile`, payload);
      set({ user: response.data.data.user, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to update profile' });
      return false;
    }
  },

  adminLogin: async (secret) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE}/auth/admin-login`, { secret });
      const { token, user } = response.data.data;
      
      localStorage.setItem('trustrent_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.error || 'Invalid Admin Credentials' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('trustrent_token');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('trustrent_token');
    if (!token) {
        set({ isAuthenticated: false, user: null });
        return;
    }
    try {
      const res = await axios.get(`${API_BASE}/auth/me`);
      set({ user: res.data.data.user, isAuthenticated: true });
    } catch (err) {
      localStorage.removeItem('trustrent_token');
      delete axios.defaults.headers.common['Authorization'];
      set({ user: null, isAuthenticated: false });
    }
  }
}));
