const CUISINES = [
  { label: 'All', emoji: '🍽', value: '' },
  { label: 'Indian', emoji: '🍛', value: 'Indian' },
  { label: 'Burgers', emoji: '🍔', value: 'Burgers' },
  { label: 'Pizza', emoji: '🍕', value: 'Pizza' },
  { label: 'Sushi', emoji: '🍣', value: 'Sushi' },
  { label: 'Chinese', emoji: '🍜', value: 'Chinese' },
  { label: 'Mexican', emoji: '🌮', value: 'Mexican' },
  { label: 'Italian', emoji: '🍝', value: 'Italian' },
  { label: 'Healthy', emoji: '🥗', value: 'Healthy' },
  { label: 'Desserts', emoji: '🍰', value: 'Desserts' },
];

/**
 * Horizontal cuisine pill selector with multi-select behavior.
 */
export default function CuisineFilterBar({ selected = [], onFilterChange }) {
  const isActive = (value) => {
    if (value === '') {
      return selected.length === 0;
    }

    return selected.includes(value);
  };

  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filter by cuisine</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Tap to narrow results</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CUISINES.map((cuisine) => (
          <button
            key={cuisine.label}
            type="button"
            onClick={() => onFilterChange?.(cuisine.value)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isActive(cuisine.value)
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-slate-100'
            }`}
          >
            <span aria-hidden="true">{cuisine.emoji}</span>
            <span>{cuisine.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}