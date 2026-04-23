import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../api/orderApi';
import ErrorAlert from '../components/ErrorAlert';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import OrderStatusBadge from '../components/OrderStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useOrderTracking } from '../hooks/useOrderTracking';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { status: trackedStatus, loading: trackingLoading, error: trackingError } = useOrderTracking(id);

  useEffect(() => {
    getOrderById(id)
      .then((res) => setOrder(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const activeStatus = trackedStatus?.currentStatus || order?.status;
  const timeline = trackedStatus?.timeline || [];
  const estimatedDeliveryTime = trackedStatus?.estimatedDeliveryTime || order?.estimatedDeliveryTime;

  if (loading) return <LoadingSpinner message="Loading order..." />;

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Order Confirmed!</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">A confirmation email has been sent to your inbox.</p>
      </div>

      {order && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-black">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Order #{order.id}</p>
              <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">{order.restaurantName}</p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{formatDate(order.createdAt)}</p>
            </div>
            <OrderStatusBadge status={activeStatus} />
          </div>

          <div className="mb-4 border-t border-slate-200 pt-4 dark:border-zinc-900">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1.5">
                <span className="text-slate-700 dark:text-slate-300">
                  {item.menuItemName} × {item.quantity}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {Number(order.discountAmount || 0) > 0 && (
            <div className="mb-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm dark:border-zinc-900">
              <span className="text-slate-500 dark:text-slate-400">
                Coupon {order.couponCode || ''}
              </span>
              <span className="font-medium text-green-600">
                - {formatCurrency(order.discountAmount)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-zinc-900">
            <span className="font-semibold text-slate-800 dark:text-slate-100">Total Paid</span>
            <span className="text-xl font-bold text-orange-500">{formatCurrency(order.totalAmount)}</span>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-3 dark:border-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Live Tracking</p>
              {trackingLoading && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Refreshing...</p>
              )}
            </div>

            {estimatedDeliveryTime && (
              <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                Estimated delivery: {formatDate(estimatedDeliveryTime)}
              </p>
            )}

            {timeline.length > 0 ? (
              <div className="space-y-1.5">
                {timeline.map((entry, idx) => (
                  <div key={`${entry.status}-${entry.timestamp}-${idx}`} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{entry.status}</span>
                    <span className="text-slate-500 dark:text-slate-400">{formatDate(entry.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">Timeline will appear once status updates are available.</p>
            )}
          </div>
        </div>
      )}

      <ErrorAlert message={trackingError} />

      <div className="flex gap-3 mt-6">
        <Link
          to="/orders"
          className="flex-1 rounded-xl border border-slate-300 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900"
        >
          View All Orders
        </Link>
        <Link
          to="/"
          className="flex-1 text-center bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 text-sm"
        >
          Order More Food
        </Link>
      </div>
    </div>
  );
}
