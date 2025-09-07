import api from './api';

export const authService = {
  login: async (username, password) => {
    if (!username || !password) {
      throw { name: 'ValidationError', details: 'Username and password are required' };
    }

    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (username, password, role = 'user') => {
    if (!username || !password) {
      throw { name: 'ValidationError', details: 'Username and password are required' };
    }
    if (password.length < 6) {
      throw { name: 'ValidationError', details: 'Password must be at least 6 characters' };
    }

    const response = await api.post('/auth/register', { username, password, role });
    return response.data;
  },

  getProfile: async () => (await api.get('/auth/profile')).data,

  updateProfile: async (profileData) => {
    if (!profileData.username) {
      throw { name: 'ValidationError', details: 'Username is required' };
    }
    return (await api.put('/auth/profile', profileData)).data;
  },

  changePassword: async (currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
      throw { name: 'ValidationError', details: 'Passwords required' };
    }
    if (newPassword.length < 6) {
      throw { name: 'ValidationError', details: 'Password too short' };
    }
    return (await api.put('/auth/change-password', { currentPassword, newPassword })).data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => !!localStorage.getItem('token'),

  getToken: () => localStorage.getItem('token'),

  getRole: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role || 'user';
  },

  getUserFromToken: () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { 
      id: payload.id, 
      username: payload.username, 
      role: payload.role, 
      exp: payload.exp, 
      iat: payload.iat,
      token // ⚡ include the raw token
    };
  } catch {
    return null;
  }
},


  isTokenExpired: () => {
    const user = authService.getUserFromToken();
    return !user || !user.exp || Date.now() >= user.exp * 1000;
  },
};
