import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useTheme } from '../hooks/useTheme';

/**
 * Sticky global navbar with homepage search, auth actions, and responsive mobile menu.
 */
export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const searchFromRoute = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('query') || '';
  }, [location.search]);

  useEffect(() => {
    setQuery(searchFromRoute);
  }, [searchFromRoute]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      navigate('/');
    } else {
      navigate(`/?query=${encodeURIComponent(trimmed)}`);
    }

    setMobileSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activePath = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-slate-100 bg-white transition-shadow dark:border-zinc-800 dark:bg-black ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex h-16 items-center gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              🍽
            </span>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">FoodApp</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden max-w-md flex-1 sm:flex">
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search restaurants or cuisine..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-zinc-800 dark:bg-black dark:text-slate-200 dark:focus:bg-black dark:focus:ring-zinc-800"
              />
            </div>
          </form>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            {currentUser ? (
              <>
                <Link
                  to="/orders"
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activePath('/orders')
                      ? 'bg-blue-50 text-blue-700 dark:bg-zinc-900 dark:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-zinc-900 dark:hover:text-slate-100'
                  }`}
                >
                  My Orders
                </Link>
                <Link
                  to="/cart"
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activePath('/cart')
                      ? 'bg-blue-50 text-blue-700 dark:bg-zinc-900 dark:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-zinc-900 dark:hover:text-slate-100'
                  }`}
                >
                  Cart
                  {totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
                      {totalItems}
                    </span>
                  )}
                </Link>

                <span
                  title={currentUser.name}
                  className="max-w-[190px] truncate rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-zinc-900 dark:text-slate-200"
                >
                  Hi, {currentUser.name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/15"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:border-zinc-700 dark:text-slate-200 dark:hover:bg-zinc-900"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              title="Toggle light and dark mode"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:text-slate-200 dark:hover:bg-zinc-900"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-700 dark:border-zinc-700 dark:text-slate-200"
              aria-label="Toggle search"
            >
              🔍
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              title="Toggle light and dark mode"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-700 dark:border-zinc-700 dark:text-slate-200"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-zinc-700 dark:text-slate-200"
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <form onSubmit={handleSearch} className="border-t border-slate-100 py-3 dark:border-zinc-800 sm:hidden">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search restaurants or cuisine..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-zinc-800 dark:bg-black dark:text-slate-200 dark:focus:bg-black dark:focus:ring-zinc-800"
            />
          </form>
        )}

        {mobileOpen && (
          <div className="space-y-2 border-t border-slate-100 py-3 dark:border-zinc-800 md:hidden">
            {currentUser ? (
              <>
                <Link
                  to="/orders"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-900"
                >
                  My Orders
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-900"
                >
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">{totalItems}</span>
                  )}
                </Link>
                <div className="truncate rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-zinc-900 dark:text-slate-200">Hi, {currentUser.name}</div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/15"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-900"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
