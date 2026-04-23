import axiosInstance from './axiosInstance';

export const registerUser = (data) => axiosInstance.post('/auth/register', data);
export const loginUser = (data) => axiosInstance.post('/auth/login', data);
export const googleLoginUser = (data) => axiosInstance.post('/auth/google', data);
export const refreshAccessToken = (refreshToken) => axiosInstance.post('/auth/refresh', { refreshToken });
export const logoutUser = (refreshToken) => axiosInstance.post('/auth/logout', { refreshToken });
