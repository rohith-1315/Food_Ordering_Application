import axiosInstance from './axiosInstance';

export const createReview = (data) => axiosInstance.post('/reviews', data);

export const getRestaurantReviews = (restaurantId, page = 0, size = 10) =>
  axiosInstance.get(`/restaurants/${restaurantId}/reviews`, {
    params: {
      page,
      size,
    },
  });

export const getMyReviews = (page = 0, size = 10) =>
  axiosInstance.get('/reviews/my', {
    params: {
      page,
      size,
    },
  });

export const updateReview = (id, data) => axiosInstance.put(`/reviews/${id}`, data);
