import { useEffect, useState } from 'react';
import { cancelOrder, getOrderHistory } from '../api/orderApi';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await getOrderHistory();
      setOrders(res.data.data || []);
    } catch {
      setError('Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (id) => {
    const shouldCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!shouldCancel) {
      return;
    }

    try {
      await cancelOrder(id);
      await loadOrders();
    } catch {
      setError('Failed to cancel order. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-slate-100">My Orders</h1>
      <ErrorAlert message={error} />

      {!error && orders.length === 0 && (
        <p className="rounded-lg border border-orange-100 bg-orange-50 p-4 text-orange-700 dark:border-orange-900/40 dark:bg-orange-900/20 dark:text-orange-300">
          No orders yet. Start ordering!
        </p>
      )}

      {!error && orders.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-black">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-slate-50 text-left text-sm text-slate-600 dark:bg-black dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Restaurant</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-200 text-sm dark:border-zinc-900">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">#{order.id}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{order.restaurantName}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'PENDING' ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(order.id)}
                          className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/20"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">Not allowed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
