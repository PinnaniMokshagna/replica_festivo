interface RazorpayOptions {
  amount: number;
  bookingRef: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function initializeRazorpayCheckout(options: RazorpayOptions): boolean {
  if (typeof window === 'undefined') return false;

  const key = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demoKey123';

  if (window.Razorpay) {
    try {
      const rzp = new window.Razorpay({
        key,
        amount: options.amount * 100, // convert ₹ to paise
        currency: 'INR',
        name: 'Festivo Event Booking',
        description: `Payment for ${options.serviceName} (${options.bookingRef})`,
        prefill: {
          name: options.customerName,
          email: options.customerEmail,
          contact: options.customerPhone || '',
        },
        theme: {
          color: '#2d4a33',
        },
        handler: (response: any) => {
          options.onSuccess(response.razorpay_payment_id || `rzp_${Date.now()}`);
        },
        modal: {
          ondismiss: () => {
            if (options.onFailure) options.onFailure('Payment modal closed');
          },
        },
      });
      rzp.open();
      return true;
    } catch (e) {
      console.warn('Razorpay open failed, executing fallback:', e);
      return false;
    }
  }

  return false;
}
