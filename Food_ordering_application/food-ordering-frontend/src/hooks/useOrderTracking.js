import { useEffect, useState } from 'react';
import { getOrderStatus } from '../api/orderApi';

const TERMINAL_STATUSES = new Set(['DELIVERED', 'CANCELLED']);

export function useOrderTracking(orderId) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;
    let timeoutId;

    const poll = async () => {
      if (!cancelled) {
        setLoading(true);
      }

      try {
        const response = await getOrderStatus(orderId, true);
        const payload = response.data?.data || null;

        if (!cancelled) {
          setStatus(payload);
          setError('');
        }

        if (!payload || TERMINAL_STATUSES.has(payload.currentStatus)) {
          return;
        }

        timeoutId = window.setTimeout(poll, 5000);
      } catch {
        if (!cancelled) {
          setError('Unable to fetch live status right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [orderId]);

  return { status, loading, error };
}
