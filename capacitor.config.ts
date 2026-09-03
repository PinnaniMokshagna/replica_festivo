import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.festivo.app',
  appName: 'Festivo',
  webDir: 'dist',
  android: {
    allowMixedContent: true, // allow loading Razorpay checkout.js inside WebView
    backgroundColor: '#0f1a10', // Festivo brand dark background
  },
};

export default config;
