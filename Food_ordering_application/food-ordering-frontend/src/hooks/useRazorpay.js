import { createPaymentOrder, verifyAndPlaceOrder } from '../api/orderApi';

export function useRazorpay() {
  const initiatePayment = async ({
    totalAmount,
    cartItems,
    restaurantId,
    userName,
    userEmail,
    couponCode,
    addressId,
    onSuccess,
    onFailure,
  }) => {
    try {
      const res = await createPaymentOrder(totalAmount);
      const { razorpayOrderId, amount, currency, keyId } = res.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || keyId,
        amount: Math.round(Number(amount) * 100),
        currency,
        name: 'FoodApp',
        description: 'Food Order Payment',
        order_id: razorpayOrderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: { color: '#F97316' },
        handler: async (paymentResponse) => {
          try {
            const orderPayload = {
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              orderRequest: {
                restaurantId,
                items: cartItems.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
                ...(couponCode ? { couponCode } : {}),
                ...(addressId ? { addressId } : {}),
              },
            };

            const orderRes = await verifyAndPlaceOrder(orderPayload);
            onSuccess(orderRes.data.data);
          } catch {
            onFailure('Payment verified but order placement failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => onFailure('Payment cancelled by user.'),
        },
      };

      if (!window.Razorpay) {
        onFailure('Razorpay SDK not loaded. Please refresh and try again.');
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      onFailure(err.response?.data?.message || 'Payment initiation failed.');
    }
  };

  return { initiatePayment };
}