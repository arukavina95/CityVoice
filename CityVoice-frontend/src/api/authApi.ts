import api from './axios';

export const authApi = {
  register: async (data: { username: string; email: string; password: string }) => {
    return api.post('/Auth/Register', data);
  },
  // Dodaj ostale auth funkcije po potrebi (login, refresh, itd.)
};