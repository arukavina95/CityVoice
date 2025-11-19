import { create } from 'zustand';

import api from '../api/axios';

interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post<{ token: string; user: User }>('/Auth/Login', {
                username,
                password,
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Login failed',
                isLoading: false,
            });
            throw err;
        }
    },

    register: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/Auth/Register', {
                username,
                password,
            });
            set({ isLoading: false });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Registration failed',
                isLoading: false,
            });
            throw err;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
    },
})); 