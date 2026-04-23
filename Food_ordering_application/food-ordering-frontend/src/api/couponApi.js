import axiosInstance from './axiosInstance';

export const validateCoupon = ({ code, amount, restaurantId }) =>
  axiosInstance.post('/coupons/validate', null, {
    params: {
      code,
      amount,
      restaurantId,
    },
  });
