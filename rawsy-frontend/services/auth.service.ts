import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: 'manufacturer' | 'supplier';
  companyName?: string;
}

interface LoginData {
  emailOrPhone: string;
  password: string;
}

interface AuthResponse {
  user: any;
  token: string;
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    const { user, token } = response.data;

    if (token) {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
    }

    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    const { user, token } = response.data;

    if (token) {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
    }

    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
  },

  getCurrentUser: async (): Promise<any> => {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('authToken');
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },

  updateStoredUser: async (user: any): Promise<void> => {
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  },

  clearAuth: async (): Promise<void> => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  },
};
