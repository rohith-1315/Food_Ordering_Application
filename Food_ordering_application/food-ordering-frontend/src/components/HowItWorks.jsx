const STEPS = [
  {
    id: 1,
    icon: '🍽',
    title: 'Choose a restaurant',
    description: 'Browse 500+ options and filter by your favorite cuisine.',
  },
  {
    id: 2,
    icon: '💳',
    title: 'Add to cart and pay',
    description: 'Checkout quickly with secure Razorpay payment flow.',
  },
  {
    id: 3,
    icon: '🛵',
    title: 'Track live delivery',
    description: 'Follow updates in real time from kitchen to doorstep.',
  },
];

/**
 * Explains the core ordering flow in three simple conversion-focused steps.
 */
export default function HowItWorks() {
  return (
    <section className="mt-14 bg-slate-50 py-14 dark:bg-black">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">How it works</h2>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {step.id}
              </div>
              <p className="text-3xl" aria-hidden="true">
                {step.icon}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}