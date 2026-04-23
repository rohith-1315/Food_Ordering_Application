import axiosInstance from './axiosInstance';

export const getAllRestaurants = () => axiosInstance.get('/restaurants');
export const getRestaurantById = (id) => axiosInstance.get(`/restaurants/${id}`);
export const getMenuByRestaurant = (id) => axiosInstance.get(`/restaurants/${id}/menu`);

export const searchRestaurants = ({
	query,
	cuisines,
	minPrice,
	maxPrice,
	sortBy = 'popularity',
	page = 0,
	size = 10,
} = {}) => {
	const params = new URLSearchParams();

	if (query) params.set('query', query);
	if (Array.isArray(cuisines) && cuisines.length > 0) params.set('cuisines', cuisines.join(','));
	if (minPrice !== undefined && minPrice !== null && minPrice !== '') params.set('minPrice', minPrice);
	if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') params.set('maxPrice', maxPrice);

	params.set('sortBy', sortBy);
	params.set('page', String(page));
	params.set('size', String(size));

	return axiosInstance.get(`/restaurants/search?${params.toString()}`);
};
