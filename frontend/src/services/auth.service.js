import api from './api';

const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const register = async (username, email, password, name, phone, address, role) => {
  const response = await api.post('/auth/register', {
    username,
    email,
    password,
    name,
    phone,
    address,
    role
  });
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  return response.data;
};

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getProfile,
  updateProfile
};

export default authService;
