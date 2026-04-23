import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatCurrency';

export default function MenuItemCard({ item, restaurantId, restaurantName }) {
  const { addItem } = useCart();

  const handleAdd = async () => {
    try {
      await addItem({ ...item, restaurantId, restaurantName });
    } catch (error) {
      window.alert(error.message || 'Unable to add item to cart.');
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-900 dark:bg-black">
      <div className="flex-1">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</h4>
        {item.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>}
        <p className="mt-2 font-bold text-orange-500">{formatCurrency(item.price)}</p>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!item.available}
        className="ml-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-700"
      >
        {item.available ? 'Add' : 'Unavailable'}
      </button>
    </div>
  );
}
