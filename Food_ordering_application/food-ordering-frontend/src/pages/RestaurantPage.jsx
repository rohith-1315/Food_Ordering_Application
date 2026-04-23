import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createReview, getRestaurantReviews } from '../api/reviewApi';
import { getRestaurantById, getMenuByRestaurant } from '../api/restaurantApi';
import MenuItemCard from '../components/MenuItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatCurrency';

export default function RestaurantPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const { totalItems, totalAmount } = useCart();

  const loadReviews = async (restaurantId) => {
    setReviewsLoading(true);
    try {
      const response = await getRestaurantReviews(restaurantId, 0, 5);
      setReviews(response.data?.data?.content || []);
      setReviewError('');
    } catch {
      setReviewError('Failed to load reviews.');
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [restaurantRes, menuRes] = await Promise.all([
          getRestaurantById(id),
          getMenuByRestaurant(id),
        ]);
        setRestaurant(restaurantRes.data.data);
        setMenuItems(menuRes.data.data || []);
        loadReviews(id);
      } catch {
        setError('Failed to load restaurant. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading menu..." />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-8"><ErrorAlert message={error} /></div>;
  if (!restaurant) return null;

  const categories = ['All', ...new Set(menuItems.map((item) => item.category).filter(Boolean))];
  const filtered = activeCategory === 'All' ? menuItems : menuItems.filter((item) => item.category === activeCategory);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setSubmittingReview(true);
    setReviewError('');

    try {
      await createReview({
        restaurantId: Number(id),
        rating: Number(reviewRating),
        comment: reviewComment,
      });

      setReviewComment('');
      setReviewRating(5);
      await loadReviews(id);

      const refreshedRestaurant = await getRestaurantById(id);
      setRestaurant(refreshedRestaurant.data?.data || restaurant);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const grouped = filtered.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-zinc-900 dark:bg-black">
        {restaurant.imageUrl && (
          <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-48 object-cover" />
        )}
        <div className="p-5">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{restaurant.name}</h1>
          <p className="text-orange-500 font-medium text-sm mt-1">{restaurant.cuisineType}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{restaurant.address}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 dark:bg-black dark:border-zinc-800 dark:text-slate-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="mb-3 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-700 dark:border-zinc-900 dark:text-slate-200">{category}</h2>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
              />
            ))}
          </div>
        </div>
      ))}

      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-900 dark:bg-black">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Ratings and Reviews</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Avg Rating: {Number(restaurant.avgRating || 0).toFixed(1)} / 5
          </span>
        </div>

        <ErrorAlert message={reviewError} />

        {currentUser && (
          <form onSubmit={handleReviewSubmit} className="mb-5 grid gap-3 rounded-xl border border-slate-200 p-4 dark:border-zinc-900">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px,1fr]">
              <select
                value={reviewRating}
                onChange={(event) => setReviewRating(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>

              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Share your experience (optional)"
                rows={3}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {reviewsLoading ? (
          <LoadingSpinner message="Loading reviews..." />
        ) : reviews.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet. Be the first to rate this restaurant.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-slate-200 p-3 dark:border-zinc-900">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{review.userName}</p>
                  <p className="text-xs font-semibold text-orange-500">{review.rating} / 5</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{review.comment || 'No comment provided.'}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-4 py-3 shadow-lg dark:border-zinc-900 dark:bg-black">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {totalItems} item{totalItems > 1 ? 's' : ''}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">in cart</span>
            </div>
            <Link
              to="/cart"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold text-sm transition-colors"
            >
              View Cart • {formatCurrency(totalAmount)}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
