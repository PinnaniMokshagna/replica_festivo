import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.festivo.app',
  appName: 'Festivo',
  webDir: 'dist',
  server: {
    // When running on a real device / emulator, API calls (fetch('/api/...'))
    // would fail because there is no local server. We route them to your
    // deployed Render backend instead.
    url: 'https://festivo-replica-3nh6.onrender.com',
    cleartext: true, // allow HTTP in dev; Render is HTTPS so this is just a safety net
  },
  android: {
    allowMixedContent: true, // allow loading Razorpay checkout.js (HTTPS) inside WebView
    backgroundColor: '#0f1a10', // Festivo dark background
  },
};

export default config;
