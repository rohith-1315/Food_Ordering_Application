const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  PREPARING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  DELIVERED: 'bg-slate-100 text-slate-700 dark:bg-zinc-900 dark:text-slate-300',
};

export default function OrderStatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || 'bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-slate-300'}`}
    >
      {status}
    </span>
  );
}
