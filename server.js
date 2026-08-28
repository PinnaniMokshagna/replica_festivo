import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to get Razorpay instance
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured in environment variables');
  }

  return {
    instance: new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }),
    keyId,
    keySecret,
  };
}

/**
 * STEP 1: BACKEND - Create Order
 * POST /api/create-order
 * Request Body: { amount (in paise), currency, receipt, notes }
 * Return: { order_id, amount, currency, key_id }
 */
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    // Validate amount
    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 100) {
      return res.status(400).json({
        error: 'Invalid amount. Minimum amount must be at least 100 paise (₹1.00).',
      });
    }

    let razorpayInfo;
    try {
      razorpayInfo = getRazorpayInstance();
    } catch (authErr) {
      return res.status(401).json({
        error: authErr.message || 'Razorpay authentication failed',
      });
    }

    const { instance, keyId } = razorpayInfo;

    const options = {
      amount: Math.round(parsedAmount), // amount in paise
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: notes || {},
    };

    const order = await instance.orders.create(options);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      error: error.error?.description || error.message || 'Failed to create Razorpay order',
    });
  }
});

/**
 * STEP 3: BACKEND - Verify Payment Signature
 * POST /api/verify-payment
 * Request Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
      });
    }

    let razorpayInfo;
    try {
      razorpayInfo = getRazorpayInstance();
    } catch (authErr) {
      return res.status(401).json({
        success: false,
        error: authErr.message || 'Razorpay authentication failed',
      });
    }

    const { keySecret } = razorpayInfo;

    // Generate expected signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.warn('Payment signature mismatch:', {
        expected: expectedSignature,
        received: razorpay_signature,
      });
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Invalid signature.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Razorpay Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during payment verification',
    });
  }
});

// Serve frontend build if dist folder exists
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Festivo Backend API is running.');
    }
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Festivo Server with Razorpay API listening on http://localhost:${PORT}`);
  });
}

export default app;
