import api from './api';

const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/cart/add', { productId, quantity });
  return response.data;
};

const updateQuantity = async (itemId, quantity) => {
  const response = await api.put(`/cart/update/${itemId}`, { quantity });
  return response.data;
};

const removeFromCart = async (itemId) => {
  const response = await api.delete(`/cart/remove/${itemId}`);
  return response.data;
};

const clearCart = async () => {
  const response = await api.delete('/cart/clear');
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart
};

export default cartService;
