import { create } from "zustand";
import axios from "axios";
import api from "@/lib/axios";
import { endpoints } from "@/lib/endpoint";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; // NestJS backend URL

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  registerError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    companyName: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getCompanyId: () => string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  registerError: null,
  // Login Function
  login: async (email, password) => {
    try {
      const res = await api.post(
        `${endpoints.auth.login}`,
        { email, password },
        { withCredentials: true }
      );

      if (res.status !== 201) {
        throw new Error("Login failed");
      }

      // Automatically fetch user info after login
      await useAuthStore.getState().checkAuth();
      console.log("hello")
      return true;
    } catch (error) {
      return false;
    }
  },

  register: async (companyName, email, password) => {
    try {
      await api.post(`${endpoints.auth.signup}`, {
        companyName,
        email,
        password,
      });

      // Automatically fetch user info after login
      // await useAuthStore.getState().checkAuth();

      return true;
    } catch (error: any) {
      console.log(error)
      set({ registerError: error.response.data.message });
      return false;
    }
  },

  // Logout Function
  logout: async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });

      // Clear auth state after logout
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  // Check if user is authenticated
  checkAuth: async () => {
    try {
      const response = await api.get(`${endpoints.users.me}`, {
        withCredentials: true,
      });

      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },

  getCompanyId: () => get().user?.companyId ?? null,
}));
