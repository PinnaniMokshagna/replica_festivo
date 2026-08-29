import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import Razorpay from 'razorpay';
import crypto from 'crypto';

function razorpayApiPlugin() {
  return {
    name: 'razorpay-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/create-order' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const env = loadEnv('development', process.cwd(), '');
              const keyId = env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
              const keySecret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

              if (!keyId || !keySecret) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Razorpay credentials not configured in environment variables' }));
              }

              const parsedAmount = Number(data.amount);
              if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 100) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Invalid amount. Minimum amount must be at least 100 paise (₹1.00).' }));
              }

              const instance = new Razorpay({
                key_id: keyId,
                key_secret: keySecret,
              });

              const options = {
                amount: Math.round(parsedAmount),
                currency: data.currency || 'INR',
                receipt: data.receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                notes: data.notes || {},
              };

              const order = await instance.orders.create(options);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: keyId,
              }));
            } catch (err: any) {
              console.error('Vite Dev Razorpay Create Order Error:', err);
              res.statusCode = err.statusCode || 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                error: err.error?.description || err.message || 'Failed to create Razorpay order',
              }));
            }
          });
          return;
        }

        if (req.url === '/api/verify-payment' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

              if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  success: false,
                  error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
                }));
              }

              const env = loadEnv('development', process.cwd(), '');
              const keySecret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

              if (!keySecret) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  success: false,
                  error: 'Razorpay secret key not found in environment',
                }));
              }

              const expectedSignature = crypto
                .createHmac('sha256', keySecret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');

              const isSignatureValid = expectedSignature === razorpay_signature;

              if (!isSignatureValid) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  success: false,
                  error: 'Payment verification failed: Invalid signature.',
                }));
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                success: true,
                message: 'Payment verified successfully.',
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
              }));
            } catch (err: any) {
              console.error('Vite Dev Razorpay Verify Payment Error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                success: false,
                error: err.message || 'Internal server error during payment verification',
              }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), razorpayApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Required for Capacitor: assets must use relative paths so the
    // Android WebView can resolve them from the bundled file system.
    base: './',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
