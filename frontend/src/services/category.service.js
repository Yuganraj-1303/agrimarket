import api from './api';

const getAllCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

const categoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

export default categoryService;
