import axiosInstance from './axiosInstance';

export const placeOrder = (data) => axiosInstance.post('/orders', data);
export const cancelOrder = (id) => axiosInstance.put(`/orders/${id}/cancel`);
export const getOrderHistory = () => axiosInstance.get('/orders/my');
export const getOrderById = (id) => axiosInstance.get(`/orders/${id}`);
export const getOrderStatus = (id, includeTimeline = true) =>
  axiosInstance.get(`/orders/${id}/status`, { params: { includeTimeline } });
export const createPaymentOrder = (amount) => axiosInstance.post('/payment/create-order', { amount });
export const verifyAndPlaceOrder = (data) => axiosInstance.post('/payment/verify-and-place', data);
