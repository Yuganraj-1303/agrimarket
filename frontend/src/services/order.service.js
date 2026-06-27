import api from './api';

const placeOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

const getMyOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Admin orders
const getAllOrders = async () => {
  const response = await api.get('/orders/all');
  return response.data;
};

const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

const orderService = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};

export default orderService;
