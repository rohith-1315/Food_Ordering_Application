import { Link } from 'react-router-dom';

/**
 * Footer with brand positioning, quick links, and conversion CTA.
 */
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white transition-colors dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">FoodApp</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Fresh food, fast delivery</p>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/" className="transition hover:text-blue-700 dark:hover:text-blue-300">
              About
            </Link>
            <Link to="/" className="transition hover:text-blue-700 dark:hover:text-blue-300">
              Contact
            </Link>
            <Link to="/" className="transition hover:text-blue-700 dark:hover:text-blue-300">
              Privacy Policy
            </Link>
          </nav>

          <div>
            <Link
              to="/register"
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              Sign up free
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
