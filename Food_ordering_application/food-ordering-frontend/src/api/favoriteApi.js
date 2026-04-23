import axiosInstance from './axiosInstance';

export const getFavorites = () => axiosInstance.get('/favorites');
export const saveFavorite = (data) => axiosInstance.post('/favorites', data);
