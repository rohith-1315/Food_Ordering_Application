import { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ErrorAlert from './ErrorAlert';
import RestaurantCard from './RestaurantCard';
import { useRestaurants } from '../hooks/useRestaurants';

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { label: 'Rating', value: 'rating' },
  { label: 'Delivery Time', value: 'popularity' },
  { label: 'Price', value: 'newest' },
];

const DELIVERY_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Under 30 min', value: '30' },
  { label: 'Under 45 min', value: '45' },
  { label: 'Under 60 min', value: '60' },
];

const estimateDeliveryTime = (restaurant) => {
  if (typeof restaurant.deliveryTime === 'number') {
    return restaurant.deliveryTime;
  }

  const ratingGap = Math.max(0, 5 - Number(restaurant.avgRating || 0));
  return Math.max(20, Math.round(22 + ratingGap * 4 + (Number(restaurant.id || 0) % 9)));
};

const estimateMinOrder = (restaurant) => {
  if (typeof restaurant.minOrder === 'number') {
    return restaurant.minOrder;
  }

  const avgPrice = Number(restaurant.avgPrice || 0);
  if (avgPrice > 0) {
    return Math.max(99, Math.round(avgPrice * 1.5));
  }

  return 199;
};

const pickBadge = (restaurant) => {
  const rating = Number(restaurant.avgRating || 0);
  const orderCount = Number(restaurant.orderCount || 0);

  if (orderCount >= 250) {
    return 'Trending';
  }

  if (rating >= 4.6) {
    return 'Top Rated';
  }

  if (orderCount < 20) {
    return 'New';
  }

  return '';
};

const pickOffer = (restaurant) => {
  const rating = Number(restaurant.avgRating || 0);
  const orderCount = Number(restaurant.orderCount || 0);

  if (rating >= 4.5) {
    return 'Free delivery';
  }

  if (orderCount > 150) {
    return '20% off';
  }

  return '';
};

/**
 * Main restaurant listing section with filters, sorting, loading states, and pagination.
 */
export default function RestaurantGrid({ query = '', cuisines = [], sortBy, onSortChange }) {
  const cuisinesKey = useMemo(() => (Array.isArray(cuisines) ? cuisines.join(',') : ''), [cuisines]);

  const [page, setPage] = useState(0);
  const [restaurants, setRestaurants] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [deliveryLimit, setDeliveryLimit] = useState('');

  const { data, loading, error } = useRestaurants({
    query,
    cuisines,
    sortBy,
    page,
    size: PAGE_SIZE,
    minPrice: minPrice === '' ? undefined : minPrice,
    maxPrice: maxPrice === '' ? undefined : maxPrice,
  });

  useEffect(() => {
    setPage(0);
    setRestaurants([]);
  }, [query, cuisinesKey, sortBy, minPrice, maxPrice]);

  useEffect(() => {
    const normalized = (data.content || []).map((restaurant) => ({
      ...restaurant,
      deliveryTime: estimateDeliveryTime(restaurant),
      minOrder: estimateMinOrder(restaurant),
      badge: pickBadge(restaurant),
      offerText: pickOffer(restaurant),
      totalReviews: Number(restaurant.totalReviews ?? restaurant.orderCount ?? 0),
    }));

    setRestaurants((prev) => {
      const merged = new Map((page === 0 ? [] : prev).map((item) => [item.id, item]));
      normalized.forEach((item) => merged.set(item.id, item));
      return Array.from(merged.values());
    });
  }, [data.content, page]);

  const filteredRestaurants = useMemo(() => {
    if (!deliveryLimit) {
      return restaurants;
    }

    return restaurants.filter((restaurant) => restaurant.deliveryTime <= Number(deliveryLimit));
  }, [restaurants, deliveryLimit]);

  const hasMore = page + 1 < Number(data.totalPages || 0);
  const isInitialLoad = loading && page === 0 && restaurants.length === 0;

  return (
    <section id="restaurant-grid" className="scroll-mt-24">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Restaurants near you</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {Number(data.totalElements || filteredRestaurants.length)} places delivering right now
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Sort by
            <select
              value={sortBy}
              onChange={(event) => onSortChange?.(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-200"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Min price
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="e.g. 120"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-200"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Max price
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="e.g. 450"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-200"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Delivery time
            <select
              value={deliveryLimit}
              onChange={(event) => setDeliveryLimit(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-200"
            >
              {DELIVERY_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && <ErrorAlert message={error.response?.data?.message || 'Failed to load restaurants.'} />}

      {isInitialLoad && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <Skeleton height={160} borderRadius={12} />
              <Skeleton className="mt-3" height={16} width="70%" />
              <Skeleton className="mt-2" height={12} width="50%" />
              <Skeleton className="mt-3" height={12} width="90%" />
            </div>
          ))}
        </div>
      )}

      {!isInitialLoad && filteredRestaurants.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-950">
          <p className="text-4xl" aria-hidden="true">
            🔎
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">No restaurants found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different cuisine or adjust your filters.</p>
        </div>
      )}

      {!isInitialLoad && filteredRestaurants.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-black dark:text-slate-200 dark:hover:border-zinc-600 dark:hover:text-slate-100"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </section>
  );
}