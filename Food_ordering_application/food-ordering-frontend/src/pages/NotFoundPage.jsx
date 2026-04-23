import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-4 text-8xl">Food</p>
      <h1 className="mb-2 text-3xl font-bold text-slate-800 dark:text-slate-100">Page Not Found</h1>
      <p className="mb-6 text-slate-500 dark:text-slate-400">Looks like this page went missing.</p>
      <Link to="/" className="rounded-lg bg-orange-500 px-6 py-3 text-white hover:bg-orange-600">
        Back to Home
      </Link>
    </div>
  );
}
