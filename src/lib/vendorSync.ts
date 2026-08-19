/**
 * vendorSync.ts
 * Syncs an active vendor's profile + packages directly into Supabase database
 * so they immediately appear across all customer-facing directory and booking pages.
 */

import { supabase } from './supabase';

export interface SyncedVendorPackage {
  id?: string;
  name: string;
  category: string;
  packageType?: string;
  price: string;
  shortDescription?: string;
  detailedDescription?: string;
  coverImage?: string;
  galleryImages?: string[];
  services?: string[];
  popular?: boolean;
}

export async function syncVendorToCustomerDirectory(packages: SyncedVendorPackage[], vendorProfile?: any) {
  try {
    let profile = vendorProfile;

    if (!profile) {
      // Try Supabase Auth first
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        profile = {
          id: user.id,
          email: user.email,
          fullName: p?.full_name || user.email?.split('@')[0] || 'Vendor',
          businessName: p?.full_name || 'Festivo Partner',
          category: '',
          location: p?.city ? `${p.city}, India` : '',
        };
      }
    }

    // Fallback: read from localStorage (custom login stores profile here)
    if (!profile) {
      try {
        const saved = localStorage.getItem('vendor_user_profile');
        if (saved) {
          const p = JSON.parse(saved);
          if (p?.email) profile = p;
        }
      } catch (_) {}
    }

    if (!profile) return;

    const vName = (profile.businessName || profile.fullName || '').trim();
    if (!vName) return;

    const vEmail = (profile.email || '').toLowerCase().trim();
    const vSlug = (
      profile.username ||
      profile.slug ||
      vName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    ).toLowerCase().replace(/^-+|-+$/g, '') || 'vendor';

    const vLocation = profile.location || 'India';
    const vBio = profile.bio || `Professional event services by ${vName}.`;
    const vCategory = (packages.length > 0 ? packages[0].category : profile.category) || 'Event Provider';

    // Get lowest price package for starting price calculation
    const sortedByPrice = [...packages].sort((a, b) => {
      const pa = parseInt(String(a.price).replace(/[^0-9]/g, '')) || 0;
      const pb = parseInt(String(b.price).replace(/[^0-9]/g, '')) || 0;
      return pa - pb;
    });
    const lowestPkg = sortedByPrice[0];
    const priceAmount = lowestPkg
      ? parseInt(String(lowestPkg.price).replace(/[^0-9]/g, '')) || 5000
      : 5000;
    const coverImage = lowestPkg?.coverImage ||
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800';

    const pkgCategories = Array.from(new Set(packages.map(p => p.category).filter(Boolean)));
    const allTags = Array.from(new Set([...pkgCategories, 'Verified', 'Festivo Partner']));

    // 1. Upsert Vendor Record in Supabase
    const { data: upsertedVendor, error: vendorErr } = await supabase
      .from('vendors')
      .upsert(
        {
          name: vName,
          slug: vSlug,
          category: vCategory,
          location: vLocation,
          price_amount: priceAmount,
          price_label: lowestPkg?.name || 'Starting Package',
          price_unit: '₹',
          rating: 4.9,
          reviews: 1,
          image: coverImage,
          gallery: packages.map(p => p.coverImage).filter(Boolean) as string[],
          tags: allTags,
          description: vBio,
          verified: true,
          badge: 'Verified Partner',
          badge_color: 'bg-sage-600',
          email: vEmail,
          phone: profile.phone || '',
        },
        { onConflict: 'slug' }
      )
      .select()
      .single();

    if (vendorErr) {
      console.warn('Supabase vendor sync error:', vendorErr);
    }

    const vendorId = upsertedVendor?.id;

    // 2. Sync all packages to vendor_packages table
    if (packages.length > 0) {
      // Upsert packages
      const packageRows = packages.map(p => ({
        vendor_id: vendorId,
        vendor_email: vEmail,
        vendor_slug: vSlug,
        name: p.name,
        category: p.category || vCategory,
        package_type: p.packageType || 'Standard',
        price: p.price,
        short_description: p.shortDescription || '',
        detailed_description: p.detailedDescription || '',
        cover_image: p.coverImage || coverImage,
        gallery_images: p.galleryImages || [],
        services: p.services || [],
        popular: p.popular || false,
      }));

      await supabase
        .from('vendor_packages')
        .delete()
        .or(`vendor_slug.eq.${vSlug},vendor_email.eq.${vEmail}`);

      await supabase.from('vendor_packages').insert(packageRows);
    }
  } catch (e) {
    console.warn('syncVendorToCustomerDirectory failed:', e);
  }
}
