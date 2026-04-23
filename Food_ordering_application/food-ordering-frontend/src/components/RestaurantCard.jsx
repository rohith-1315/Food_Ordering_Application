import { useNavigate } from 'react-router-dom';

/**
 * Clickable restaurant card used by homepage listing with badges and key delivery metadata.
 */
export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const rating = Number(restaurant.avgRating || 0);
  const reviewCount = Number(restaurant.totalReviews || 0);

  return (
    <button
      type="button"
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      className="w-full cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="relative h-40 bg-slate-100 dark:bg-zinc-900">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl" aria-hidden="true">
            🍽
          </div>
        )}

        {restaurant.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
            {restaurant.badge}
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{restaurant.name}</h3>
        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{restaurant.cuisineType || 'Cuisine not specified'}</p>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>⭐ {rating > 0 ? rating.toFixed(1) : 'New'} · {reviewCount} reviews</span>
          <span>{restaurant.deliveryTime} min</span>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500">₹{restaurant.minOrder} min order</span>
          {restaurant.offerText && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/15 dark:text-green-300">
              {restaurant.offerText}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
