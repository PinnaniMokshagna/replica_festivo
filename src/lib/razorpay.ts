export interface RazorpayOptions {
  amount: number; // in Rupees (e.g. 500 for ₹500)
  bookingRef: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  onSuccess: (paymentId: string, details?: { orderId: string; signature: string }) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

export interface RazorpayVerificationResponse {
  success: boolean;
  message?: string;
  error?: string;
  order_id?: string;
  payment_id?: string;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Ensures the Razorpay checkout.js script is loaded
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * STEP 1: Calls backend to create Razorpay Order
 */
export async function createRazorpayOrder(amountInRupees: number, receipt: string, notes?: Record<string, string>) {
  const amountInPaise = Math.round(amountInRupees * 100);

  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Order creation failed' }));
    throw new Error(errData.error || `Server responded with status ${response.status}`);
  }

  return await response.json(); // { order_id, amount, currency, key_id }
}

/**
 * STEP 3: Calls backend to verify Razorpay Payment Signature
 */
export async function verifyRazorpayPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<RazorpayVerificationResponse> {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const result = await response.json().catch(() => ({ success: false, error: 'Verification failed' }));
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Payment signature verification failed');
  }

  return result;
}

/**
 * STEP 2: Main Checkout Orchestrator
 * 1. Creates order via backend
 * 2. Launches Razorpay Standard Checkout modal
 * 3. Handles success/dismissal/failure
 * 4. Verifies signature on backend upon payment success
 */
export async function initializeRazorpayCheckout(options: RazorpayOptions): Promise<boolean> {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
    }

    // Step 1: Create Order on Backend
    const orderData = await createRazorpayOrder(
      options.amount,
      options.bookingRef,
      {
        serviceName: options.serviceName,
        customerName: options.customerName,
        customerEmail: options.customerEmail,
      }
    );

    const key = orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;

    // Step 2: Open Checkout Modal with Order ID
    const rzpOptions = {
      key: key,
      amount: orderData.amount, // in paise
      currency: orderData.currency || 'INR',
      name: 'Festivo Event Booking',
      description: `Payment for ${options.serviceName} (${options.bookingRef})`,
      order_id: orderData.order_id,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone || '',
      },
      theme: {
        color: '#2d4a33', // Festivo brand sage color
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // Step 3: Verify Payment Signature on Backend
          await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          // Signature verified successfully
          options.onSuccess(response.razorpay_payment_id, {
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
        } catch (verifyError: any) {
          console.error('Payment verification error:', verifyError);
          if (options.onFailure) {
            options.onFailure(verifyError.message || 'Payment signature verification failed.');
          }
        }
      },
      modal: {
        ondismiss: () => {
          if (options.onDismiss) {
            options.onDismiss();
          } else if (options.onFailure) {
            options.onFailure('Payment checkout closed by user');
          }
        },
      },
    };

    const rzp = new window.Razorpay(rzpOptions);

    rzp.on('payment.failed', (response: any) => {
      console.error('Razorpay Payment Failed Event:', response.error);
      if (options.onFailure) {
        options.onFailure(response.error?.description || response.error?.reason || 'Payment failed');
      }
    });

    rzp.open();
    return true;
  } catch (error: any) {
    console.error('Razorpay initialization error:', error);
    if (options.onFailure) {
      options.onFailure(error.message || 'Failed to initialize payment');
    }
    return false;
  }
}
