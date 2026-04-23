import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatCurrency';

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, totalAmount } = useCart();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" className="w-full bg-black/40" onClick={onClose} aria-label="Close cart drawer" />
      <aside className="h-full w-full max-w-sm border-l border-slate-200 bg-white p-4 shadow-xl dark:border-zinc-900 dark:bg-black">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Your Cart</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Close
          </button>
        </div>

        <div className="space-y-3">
          {cartItems.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No items in cart yet.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-zinc-900">
                <p className="font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                <p className="text-sm font-semibold text-orange-500">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-zinc-900">
          <p className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Total: {formatCurrency(totalAmount)}</p>
          <Link
            to="/cart"
            onClick={onClose}
            className="inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Go to Cart
          </Link>
        </div>
      </aside>
    </div>
  );
}
