import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { fetchSavedVendorsForUser, toggleSavedVendorInDb } from './supabase-service';

/**
 * Saved Vendors hook backed directly by Supabase
 */
export function useSavedVendors() {
  const [savedIds, setSavedIds] = useState<string[]>(['v1', 'v2']);

  useEffect(() => {
    let isMounted = true;

    async function loadSaved() {
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email;
      if (email) {
        const ids = await fetchSavedVendorsForUser(email);
        if (isMounted && ids.length > 0) {
          setSavedIds(ids);
        }
      }
    }

    loadSaved();

    const handleUpdate = (e: any) => {
      if (e.detail) setSavedIds(e.detail);
    };

    window.addEventListener('saved-vendors-changed', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('saved-vendors-changed', handleUpdate);
    };
  }, []);

  const toggleSave = async (id: string) => {
    const next = savedIds.includes(id) ? savedIds.filter(x => x !== id) : [...savedIds, id];
    setSavedIds(next);
    window.dispatchEvent(new CustomEvent('saved-vendors-changed', { detail: next }));

    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email;
    if (email) {
      await toggleSavedVendorInDb(email, id);
    }
    return next;
  };

  return {
    savedIds,
    isSaved: (id: string) => savedIds.includes(id),
    toggleSave,
  };
}
