import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAddress, getAddresses } from '../api/addressApi';
import { validateCoupon } from '../api/couponApi';
import { getFavorites, saveFavorite } from '../api/favoriteApi';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useRazorpay } from '../hooks/useRazorpay';
import { formatCurrency } from '../utils/formatCurrency';

const PREAPPLY_COUPON_KEY = 'preAppliedCoupon';

const initialAddressForm = {
  label: 'Home',
  street: '',
  city: '',
  zipcode: '',
  phone: '',
  isDefault: false,
};

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount,
    loading: cartLoading,
    populateFromFavorite,
  } = useCart();
  const { currentUser } = useAuth();
  const { initiatePayment } = useRazorpay();
  const navigate = useNavigate();

  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [creatingAddress, setCreatingAddress] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoriteLabel, setFavoriteLabel] = useState('');
  const [savingFavorite, setSavingFavorite] = useState(false);

  const finalAmount = useMemo(
    () => Number(appliedCoupon?.finalAmount ?? totalAmount ?? 0),
    [appliedCoupon, totalAmount]
  );

  const discountAmount = useMemo(
    () => Number(appliedCoupon?.discount ?? 0),
    [appliedCoupon]
  );

  const loadCheckoutData = async () => {
    if (!currentUser) {
      return;
    }

    setAddressesLoading(true);
    setFavoritesLoading(true);

    const [addressResult, favoriteResult] = await Promise.allSettled([getAddresses(), getFavorites()]);

    if (addressResult.status === 'fulfilled') {
      const addressList = addressResult.value.data?.data || [];
      setAddresses(addressList);

      const defaultAddress = addressList.find((entry) => entry.isDefault);
      const selected = defaultAddress?.id ?? addressList[0]?.id ?? '';
      setSelectedAddressId(selected ? String(selected) : '');
    }

    if (favoriteResult.status === 'fulfilled') {
      setFavorites(favoriteResult.value.data?.data || []);
    }

    setAddressesLoading(false);
    setFavoritesLoading(false);
  };

  useEffect(() => {
    loadCheckoutData();
  }, [currentUser]);

  useEffect(() => {
    const pendingCoupon = window.localStorage.getItem(PREAPPLY_COUPON_KEY);
    if (!pendingCoupon || couponCode) {
      return;
    }

    setCouponCode(pendingCoupon);
    window.localStorage.removeItem(PREAPPLY_COUPON_KEY);
  }, [couponCode]);

  useEffect(() => {
    setAppliedCoupon(null);
  }, [cartItems, totalAmount]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Enter a coupon code first.');
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    setError('');
    setCouponLoading(true);

    try {
      const response = await validateCoupon({
        code: couponCode.trim(),
        amount: totalAmount,
        restaurantId: cartItems[0].restaurantId,
      });

      setAppliedCoupon({
        ...response.data.data,
        code: couponCode.trim().toUpperCase(),
      });
    } catch (err) {
      setAppliedCoupon(null);
      setError(err.response?.data?.message || 'Failed to apply coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (cartItems.length === 0) {
      return;
    }

    setSavingFavorite(true);
    setError('');

    try {
      const menuItemIds = cartItems.flatMap((item) =>
        Array.from({ length: item.quantity }, () => item.id)
      );

      await saveFavorite({
        restaurantId: cartItems[0].restaurantId,
        label: favoriteLabel.trim() || 'Quick Reorder',
        menuItemIds,
      });

      setFavoriteLabel('');
      const favoritesResponse = await getFavorites();
      setFavorites(favoritesResponse.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save favorite.');
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleLoadFavorite = async (favoriteId) => {
    setError('');
    try {
      await populateFromFavorite(favoriteId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load favorite into cart.');
    }
  };

  const handleCreateAddress = async (event) => {
    event.preventDefault();
    setCreatingAddress(true);
    setError('');

    try {
      await createAddress(addressForm);
      setAddressForm(initialAddressForm);
      await loadCheckoutData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setCreatingAddress(false);
    }
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      return;
    }

    setError('');
    setProcessingPayment(true);

    await initiatePayment({
      totalAmount: finalAmount,
      cartItems,
      restaurantId: cartItems[0].restaurantId,
      userName: currentUser?.name || '',
      userEmail: currentUser?.email || '',
      couponCode: appliedCoupon?.valid ? appliedCoupon.code : undefined,
      addressId: selectedAddressId ? Number(selectedAddressId) : undefined,
      onSuccess: (order) => {
        clearCart().finally(() => {
          setProcessingPayment(false);
          navigate(`/order-confirmation/${order.id}`);
        });
      },
      onFailure: (message) => {
        setError(message);
        setProcessingPayment(false);
      },
    });
  };

  if (cartLoading) {
    return <LoadingSpinner message="Loading cart..." />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">Cart</p>
        <h2 className="mb-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">Your cart is empty</h2>
        <p className="mb-6 text-slate-500 dark:text-slate-400">Add some delicious food to get started</p>
        <Link to="/" className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 font-medium">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">Your Cart</h1>

      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-black">
        {cartItems.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className={`flex items-center gap-4 p-4 ${idx !== cartItems.length - 1 ? 'border-b border-slate-200 dark:border-zinc-900' : ''}`}
          >
            <div className="flex-1">
              <p className="font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
              <p className="mt-0.5 text-sm font-semibold text-orange-500">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    await updateQuantity(item.id, item.quantity - 1);
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to update quantity.');
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900"
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">{item.quantity}</span>
              <button
                onClick={async () => {
                  try {
                    await updateQuantity(item.id, item.quantity + 1);
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to update quantity.');
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900"
              >
                +
              </button>
            </div>
            <p className="w-20 text-right text-sm font-semibold text-slate-800 dark:text-slate-100">
              {formatCurrency(item.price * item.quantity)}
            </p>
            <button
              onClick={async () => {
                try {
                  await removeItem(item.id);
                } catch (err) {
                  setError(err.response?.data?.message || 'Failed to remove item.');
                }
              }}
              className="text-red-400 hover:text-red-600 text-sm ml-2"
            >
              X
            </button>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-900 dark:bg-black">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Subtotal</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(totalAmount)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Coupon discount</span>
            <span className="font-medium text-green-600">- {formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Delivery fee</span>
          <span className="font-medium text-green-600">FREE</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-zinc-900">
          <span className="font-semibold text-slate-800 dark:text-slate-100">Total</span>
          <span className="text-xl font-bold text-orange-500">{formatCurrency(finalAmount)}</span>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-900 dark:bg-black">
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Apply Coupon</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            placeholder="Enter coupon code"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={couponLoading}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-200 dark:text-black dark:hover:bg-white"
          >
            {couponLoading ? 'Applying...' : 'Apply'}
          </button>
        </div>

        {appliedCoupon?.valid && (
          <p className="mt-2 text-sm text-green-600">
            Coupon {appliedCoupon.code} applied. You save {formatCurrency(appliedCoupon.discount)}.
          </p>
        )}
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-900 dark:bg-black">
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Delivery Address</p>

        {addressesLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading addresses...</p>
        ) : addresses.length > 0 ? (
          <select
            value={selectedAddressId}
            onChange={(event) => setSelectedAddressId(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100"
          >
            {addresses.map((address) => (
              <option key={address.id} value={String(address.id)}>
                {address.label}: {address.street}, {address.city} - {address.zipcode}
              </option>
            ))}
          </select>
        ) : (
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            No saved address found. Add one below.
          </p>
        )}

        <form onSubmit={handleCreateAddress} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            type="text"
            value={addressForm.label}
            onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
            placeholder="Label (Home/Office)"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100"
            required
          />
          <input
            type="text"
            value={addressForm.phone}
            onChange={(event) => setAddressForm((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder="Phone (10 digits)"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100"
            required
          />
          <input
            type="text"
            value={addressForm.street}
            onChange={(event) => setAddressForm((prev) => ({ ...prev, street: event.target.value }))}
            placeholder="Street"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100 sm:col-span-2"
            required
          />
          <input
            type="text"
            value={addressForm.city}
            onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
            placeholder="City"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100"
            required
          />
          <input
            type="text"
            value={addressForm.zipcode}
            onChange={(event) => setAddressForm((prev) => ({ ...prev, zipcode: event.target.value }))}
            placeholder="Zipcode (6 digits)"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100"
            required
          />

          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={addressForm.isDefault}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
            />
            Set as default address
          </label>

          <button
            type="submit"
            disabled={creatingAddress}
            className="sm:col-span-2 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-slate-200 dark:hover:bg-zinc-900"
          >
            {creatingAddress ? 'Saving Address...' : 'Save Address'}
          </button>
        </form>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-900 dark:bg-black">
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Favorites (Quick Reorder)</p>

        <div className="mb-3 flex gap-2">
          <input
            type="text"
            value={favoriteLabel}
            onChange={(event) => setFavoriteLabel(event.target.value)}
            placeholder="Favorite label (optional)"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100"
          />
          <button
            onClick={handleSaveFavorite}
            disabled={savingFavorite}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-slate-200 dark:hover:bg-zinc-900"
          >
            {savingFavorite ? 'Saving...' : 'Save Current Cart'}
          </button>
        </div>

        {favoritesLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading favorites...</p>
        ) : favorites.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No favorites yet.</p>
        ) : (
          <div className="space-y-2">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{favorite.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{favorite.restaurantName}</p>
                </div>
                <button
                  onClick={() => handleLoadFavorite(favorite.id)}
                  className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ErrorAlert message={error} />

      <div className="flex flex-col gap-3 mt-4">
        {processingPayment ? (
          <LoadingSpinner message="Processing payment..." />
        ) : (
          <button
            onClick={handlePayment}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl text-base transition-colors"
          >
            Pay {formatCurrency(finalAmount)} with Razorpay
          </button>
        )}
        <button
          onClick={async () => {
            try {
              await clearCart();
            } catch (err) {
              setError(err.response?.data?.message || 'Failed to clear cart.');
            }
          }}
          className="w-full rounded-xl border border-slate-300 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
