import api from './api';

const getAllProducts = async (categoryId = null, search = '') => {
  const params = {};
  if (categoryId) params.categoryId = categoryId;
  if (search) params.search = search;
  const response = await api.get('/products', { params });
  return response.data;
};

const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

const productService = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

export default productService;
