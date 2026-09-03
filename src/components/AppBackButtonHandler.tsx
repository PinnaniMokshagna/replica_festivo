import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export default function AppBackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPressRef = useRef<number>(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let handle: { remove: () => Promise<void> } | null = null;

    const registerBackHandler = async () => {
      handle = await CapApp.addListener('backButton', () => {
        // If the user is on the root or home page, exit app
        if (location.pathname === '/' || location.pathname === '') {
          CapApp.exitApp();
        } else {
          // Navigate to the previous page inside the app
          navigate(-1);
        }
      });
    };

    registerBackHandler();

    return () => {
      if (handle) {
        handle.remove();
      }
    };
  }, [location.pathname, navigate]);

  return null;
}
