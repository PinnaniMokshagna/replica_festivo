import { useState, useEffect } from 'react';

/**
 * Helper to manage saved vendor IDs in localStorage for instant syncing across the app
 */

export function getSavedVendorIds(): string[] {
  try {
    const data = localStorage.getItem('festivo_saved_vendor_ids');
    if (data) return JSON.parse(data);
    // Default sample saved vendors (v1 Royal Pavilion, v2 Spice Craft)
    const defaults = ['v1', 'v2'];
    localStorage.setItem('festivo_saved_vendor_ids', JSON.stringify(defaults));
    return defaults;
  } catch {
    return ['v1', 'v2'];
  }
}

export function isVendorSaved(id: string): boolean {
  return getSavedVendorIds().includes(id);
}

export function toggleSaveVendor(id: string): string[] {
  const current = getSavedVendorIds();
  const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
  try {
    localStorage.setItem('festivo_saved_vendor_ids', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('saved-vendors-changed', { detail: updated }));
  } catch (e) {
    console.error('Failed to update saved vendors', e);
  }
  return updated;
}

/**
 * React hook that subscribes to real-time changes of saved vendors
 */
export function useSavedVendors() {
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedVendorIds());

  useEffect(() => {
    const handleUpdate = () => {
      setSavedIds(getSavedVendorIds());
    };
    window.addEventListener('saved-vendors-changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('saved-vendors-changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    savedIds,
    isSaved: (id: string) => savedIds.includes(id),
    toggleSave: (id: string) => {
      const next = toggleSaveVendor(id);
      setSavedIds(next);
      return next;
    }
  };
}
