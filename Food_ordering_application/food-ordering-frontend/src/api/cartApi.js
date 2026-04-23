import axiosInstance from './axiosInstance';

export const getCart = () => axiosInstance.get('/cart');
export const addCartItem = (data) => axiosInstance.post('/cart/items', data);
export const updateCartItem = (itemId, data) => axiosInstance.put(`/cart/items/${itemId}`, data);
export const removeCartItem = (itemId) => axiosInstance.delete(`/cart/items/${itemId}`);
export const clearCartRequest = () => axiosInstance.delete('/cart');
export const mergeCart = (data) => axiosInstance.post('/cart/merge', data);
export const populateFavoriteInCart = (favoriteId) => axiosInstance.post(`/cart/populate-favorite/${favoriteId}`);
