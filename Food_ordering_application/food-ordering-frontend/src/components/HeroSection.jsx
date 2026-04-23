import { useEffect, useState } from 'react';
import { getAllRestaurants } from '../api/restaurantApi';

/**
 * Prominent homepage hero with trust metrics and CTAs to jump to restaurant results.
 */
export default function HeroSection() {
  const [restaurantCount, setRestaurantCount] = useState(500);

  useEffect(() => {
    let isMounted = true;

    getAllRestaurants()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const count = Array.isArray(response.data?.data) ? response.data.data.length : 0;
        if (count > 0) {
          setRestaurantCount(count);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToRestaurants = () => {
    const target = document.getElementById('restaurant-grid');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="w-full bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 dark:from-black dark:via-black dark:to-black">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:py-16">
        <div>
          <p className="inline-flex items-center rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-orange-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-orange-300">
            Fast delivery in your city
          </p>

          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl dark:text-slate-100">
            Hungry? Food&apos;s
            <br />
            30 min away.
          </h1>

          <p className="mt-4 text-base text-slate-600 md:text-lg dark:text-slate-300">
            {restaurantCount}+ restaurants, quick delivery, and live tracking from kitchen to your door.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={scrollToRestaurants}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Order now
            </button>
            <button
              type="button"
              onClick={scrollToRestaurants}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-200 dark:hover:border-zinc-600 dark:hover:text-slate-100"
            >
              Browse menus
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white/80 p-3 shadow-sm backdrop-blur dark:bg-zinc-950 dark:ring-1 dark:ring-zinc-800">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{restaurantCount}+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Restaurants</p>
            </div>
            <div className="rounded-xl bg-white/80 p-3 shadow-sm backdrop-blur dark:bg-zinc-950 dark:ring-1 dark:ring-zinc-800">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">30 min</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Avg delivery</p>
            </div>
            <div className="rounded-xl bg-white/80 p-3 shadow-sm backdrop-blur dark:bg-zinc-950 dark:ring-1 dark:ring-zinc-800">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Live</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tracking</p>
            </div>
            <div className="rounded-xl bg-white/80 p-3 shadow-sm backdrop-blur dark:bg-zinc-950 dark:ring-1 dark:ring-zinc-800">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Secure pay</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-200/60 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-200/60 blur-2xl dark:bg-zinc-800/30" />

          <div className="relative space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-orange-50 p-4 dark:bg-zinc-900">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Today&apos;s pick</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">Paneer Tikka Bowl</p>
              </div>
              <span className="text-4xl" role="img" aria-label="food bowl">
                🍲
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-100 p-4 dark:border-zinc-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Hot Deals</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Up to 40% off selected kitchens</p>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4 dark:border-zinc-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Fresh Menus</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Updated every day from local chefs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}