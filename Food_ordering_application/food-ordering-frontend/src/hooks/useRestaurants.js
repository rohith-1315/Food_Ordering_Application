import { useEffect, useMemo, useState } from 'react';
import { searchRestaurants } from '../api/restaurantApi';

/**
 * Fetches paginated restaurant search results for homepage filters.
 */
export function useRestaurants({ query, cuisines, sortBy, page, size = 9, minPrice, maxPrice }) {
  const cuisinesKey = useMemo(
    () => (Array.isArray(cuisines) ? cuisines.filter(Boolean).join(',') : ''),
    [cuisines]
  );

  const [data, setData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    setLoading(true);
    setError(null);

    searchRestaurants({
      query: query?.trim() || undefined,
      cuisines: cuisinesKey ? cuisinesKey.split(',') : undefined,
      minPrice,
      maxPrice,
      sortBy: sortBy || 'rating',
      page: page || 0,
      size,
    })
      .then((response) => {
        if (!isActive) {
          return;
        }

        const payload = response.data?.data || {};

        setData({
          content: Array.isArray(payload.content) ? payload.content : [],
          totalElements: Number(payload.totalElements || 0),
          totalPages: Number(payload.totalPages || 0),
          currentPage: Number(payload.currentPage ?? page ?? 0),
        });
      })
      .catch((err) => {
        if (!isActive) {
          return;
        }

        setError(err);
        setData((prev) => ({
          ...prev,
          content: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
        }));
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [query, cuisinesKey, sortBy, page, size, minPrice, maxPrice]);

  return { data, loading, error };
}