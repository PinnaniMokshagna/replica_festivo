import {
  supabase,
  type Vendor,
  type VendorPackage,
  type Booking,
  type SavedVendor,
  type Review,
  type VendorCalendarEvent,
  type VendorPortfolioItem,
  type VendorDeal,
  type VendorDocument,
  type ChatMessage,
} from './supabase';
import { MOCK_VENDORS } from './vendors';

// ============================================================================
// 1. VENDORS & DIRECTORY
// ============================================================================

export async function fetchAllVendors(): Promise<Vendor[]> {
  try {
    const { data: dbVendors, error } = await supabase
      .from('vendors')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.warn('Supabase fetchAllVendors error:', error);
      return MOCK_VENDORS;
    }

    if (!dbVendors || dbVendors.length === 0) {
      return MOCK_VENDORS;
    }

    // Also fetch all custom packages and attach to corresponding vendors
    const { data: allPackages } = await supabase
      .from('vendor_packages')
      .select('*');

    const mapped = dbVendors.map(v => {
      const pkgs = (allPackages || []).filter(
        p => p.vendor_slug === v.slug || p.vendor_email === v.email || p.vendor_id === v.id
      );
      return {
        ...v,
        custom_packages: pkgs.length > 0 ? pkgs : v.custom_packages || [],
      };
    });

    return mapped;
  } catch (e) {
    console.warn('fetchAllVendors failed:', e);
    return MOCK_VENDORS;
  }
}

export async function fetchVendorBySlug(slug: string): Promise<Vendor | null> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      // Vendor not yet in directory — try fetching packages by slug anyway
      const { data: pkgsBySlug } = await supabase
        .from('vendor_packages')
        .select('*')
        .eq('vendor_slug', slug)
        .order('created_at', { ascending: false });

      const mock = MOCK_VENDORS.find(v => v.slug === slug || v.id === slug);
      if (mock) {
        return {
          ...mock,
          custom_packages: pkgsBySlug && pkgsBySlug.length > 0 ? pkgsBySlug : (mock.custom_packages || []),
        };
      }
      return null;
    }

    // Try to get vendor email from vendor_applications if not on vendors row
    let vendorEmail = data.email || '';
    if (!vendorEmail) {
      const { data: appData } = await supabase
        .from('vendor_applications')
        .select('email')
        .eq('business_name', data.name)
        .maybeSingle();
      vendorEmail = appData?.email || '';
    }

    // Fetch packages: try all possible identifiers
    const orClause = [
      `vendor_slug.eq.${slug}`,
      `vendor_id.eq.${data.id}`,
      ...(vendorEmail ? [`vendor_email.eq.${vendorEmail}`] : []),
    ].join(',');

    const { data: pkgs } = await supabase
      .from('vendor_packages')
      .select('*')
      .or(orClause)
      .order('created_at', { ascending: false });

    return {
      ...data,
      custom_packages: pkgs && pkgs.length > 0 ? pkgs : (data.custom_packages || []),
    };
  } catch (e) {
    console.warn('fetchVendorBySlug failed:', e);
    return MOCK_VENDORS.find(v => v.slug === slug || v.id === slug) || null;
  }
}

export async function upsertVendor(vendorData: Partial<Vendor>): Promise<{ data: any; error: any }> {
  try {
    return await supabase.from('vendors').upsert(vendorData, { onConflict: 'slug' }).select().single();
  } catch (e) {
    return { data: null, error: e };
  }
}

// ============================================================================
// 2. VENDOR PACKAGES
// ============================================================================

export async function fetchPackagesForVendor(vendorSlug?: string, vendorEmail?: string): Promise<VendorPackage[]> {
  try {
    let query = supabase.from('vendor_packages').select('*');
    if (vendorSlug && vendorEmail) {
      query = query.or(`vendor_slug.eq.${vendorSlug},vendor_email.eq.${vendorEmail}`);
    } else if (vendorSlug) {
      query = query.eq('vendor_slug', vendorSlug);
    } else if (vendorEmail) {
      query = query.eq('vendor_email', vendorEmail);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('fetchPackagesForVendor error:', e);
    return [];
  }
}

export async function createVendorPackage(pkg: Omit<VendorPackage, 'id'>): Promise<{ data: any; error: any }> {
  try {
    return await supabase.from('vendor_packages').insert(pkg).select().single();
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updateVendorPackage(id: string, updates: Partial<VendorPackage>): Promise<{ error: any }> {
  try {
    return await supabase.from('vendor_packages').update(updates).eq('id', id);
  } catch (e) {
    return { error: e };
  }
}

export async function deleteVendorPackage(id: string): Promise<{ error: any }> {
  try {
    return await supabase.from('vendor_packages').delete().eq('id', id);
  } catch (e) {
    return { error: e };
  }
}

// ============================================================================
// 3. BOOKINGS
// ============================================================================

export async function fetchBookingsForCustomer(customerEmail: string): Promise<Booking[]> {
  try {
    const cleanEmail = customerEmail.trim().toLowerCase();
    const { data, error } = await supabase
      .from('bookings')
      .select('*, vendor:vendors(*)')
      .ilike('customer_email', cleanEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(b => ({
      ...b,
      vendor: Array.isArray(b.vendor) ? b.vendor[0] : b.vendor,
    }));
  } catch (e) {
    console.warn('fetchBookingsForCustomer error:', e);
    return [];
  }
}

export async function fetchBookingsForVendor(vendorEmailOrSlug: string): Promise<Booking[]> {
  try {
    // Get vendor id first if possible
    const { data: vData } = await supabase
      .from('vendors')
      .select('id, email, slug')
      .or(`slug.eq.${vendorEmailOrSlug},email.eq.${vendorEmailOrSlug}`)
      .maybeSingle();

    let query = supabase.from('bookings').select('*, vendor:vendors(*)');
    if (vData?.id) {
      query = query.eq('vendor_id', vData.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('fetchBookingsForVendor error:', e);
    return [];
  }
}

export async function fetchBookingByRef(bookingRef: string): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, vendor:vendors(*)')
      .eq('booking_ref', bookingRef.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) return null;
    return {
      ...data,
      vendor: Array.isArray(data.vendor) ? data.vendor[0] : data.vendor,
    };
  } catch (e) {
    console.warn('fetchBookingByRef error:', e);
    return null;
  }
}

export async function createBookingInDb(bookingData: Partial<Booking>): Promise<{ data: any; error: any }> {
  try {
    return await supabase.from('bookings').insert(bookingData).select().single();
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updateBookingStatusInDb(id: string, status: Booking['status']): Promise<{ error: any }> {
  try {
    return await supabase.from('bookings').update({ status }).eq('id', id);
  } catch (e) {
    return { error: e };
  }
}

// ============================================================================
// 4. SAVED VENDORS (CUSTOMER FAVORITES)
// ============================================================================

export async function fetchSavedVendorsForUser(userEmail: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('saved_vendors')
      .select('vendor_id')
      .eq('user_email', userEmail.toLowerCase().trim());

    if (error) throw error;
    return (data || []).map(row => row.vendor_id);
  } catch (e) {
    console.warn('fetchSavedVendorsForUser error:', e);
    return [];
  }
}

export async function toggleSavedVendorInDb(userEmail: string, vendorId: string): Promise<boolean> {
  try {
    const cleanEmail = userEmail.toLowerCase().trim();
    const { data: existing } = await supabase
      .from('saved_vendors')
      .select('id')
      .eq('user_email', cleanEmail)
      .eq('vendor_id', vendorId)
      .maybeSingle();

    if (existing) {
      await supabase.from('saved_vendors').delete().eq('id', existing.id);
      return false; // Removed
    } else {
      await supabase.from('saved_vendors').insert({
        user_email: cleanEmail,
        vendor_id: vendorId,
      });
      return true; // Added
    }
  } catch (e) {
    console.warn('toggleSavedVendorInDb error:', e);
    return false;
  }
}

// ============================================================================
// 5. REVIEWS
// ============================================================================

export async function fetchReviewsForVendor(vendorSlugOrId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .or(`vendor_slug.eq.${vendorSlugOrId},vendor_id.eq.${vendorSlugOrId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('fetchReviewsForVendor error:', e);
    return [];
  }
}

export async function createReviewInDb(review: Omit<Review, 'id'>): Promise<{ data: any; error: any }> {
  try {
    return await supabase.from('reviews').insert(review).select().single();
  } catch (e) {
    return { data: null, error: e };
  }
}

// ============================================================================
// 6. VENDOR KYC DOCUMENTS
// ============================================================================

export async function fetchVendorDocuments(vendorEmail: string): Promise<VendorDocument[]> {
  try {
    const { data, error } = await supabase
      .from('vendor_documents')
      .select('*')
      .eq('vendor_email', vendorEmail.toLowerCase().trim())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('fetchVendorDocuments error:', e);
    return [];
  }
}

export async function saveVendorDocument(doc: Omit<VendorDocument, 'id'>): Promise<{ data: any; error: any }> {
  try {
    return await supabase.from('vendor_documents').insert(doc).select().single();
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updateVendorDocumentStatus(id: string, status: VendorDocument['status'], remarks?: string): Promise<{ error: any }> {
  try {
    return await supabase.from('vendor_documents').update({ status, remarks, updated_at: new Date().toISOString() }).eq('id', id);
  } catch (e) {
    return { error: e };
  }
}

// ============================================================================
// 7. CALENDAR, PORTFOLIO & DEALS
// ============================================================================

export async function fetchVendorCalendar(vendorEmail: string): Promise<VendorCalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .from('vendor_calendar_events')
      .select('*')
      .eq('vendor_email', vendorEmail.toLowerCase().trim())
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('fetchVendorCalendar error:', e);
    return [];
  }
}

export async function addVendorCalendarEvent(ev: Omit<VendorCalendarEvent, 'id'>): Promise<{ data: any; error: any }> {
  try {
    return await supabase.from('vendor_calendar_events').insert(ev).select().single();
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function deleteVendorCalendarEvent(id: string): Promise<{ error: any }> {
  try {
    return await supabase.from('vendor_calendar_events').delete().eq('id', id);
  } catch (e) {
    return { error: e };
  }
}

export async function fetchVendorPortfolio(vendorEmail: string): Promise<VendorPortfolioItem[]> {
  try {
    const { data, error } = await supabase
      .from('vendor_portfolio')
      .select('*')
      .eq('vendor_email', vendorEmail.toLowerCase().trim())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('fetchVendorPortfolio error:', e);
    return [];
  }
}

export async function addVendorPortfolioItem(item: Omit<VendorPortfolioItem, 'id'>): Promise<{ data: any; error: any }> {
  try {
    return await supabase.from('vendor_portfolio').insert(item).select().single();
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function deleteVendorPortfolioItem(id: string): Promise<{ error: any }> {
  try {
    return await supabase.from('vendor_portfolio').delete().eq('id', id);
  } catch (e) {
    return { error: e };
  }
}

export async function fetchVendorDeals(vendorEmail: string): Promise<VendorDeal[]> {
  try {
    const { data, error } = await supabase
      .from('vendor_deals')
      .select('*')
      .eq('vendor_email', vendorEmail.toLowerCase().trim())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('fetchVendorDeals error:', e);
    return [];
  }
}

export async function addVendorDeal(deal: Omit<VendorDeal, 'id'>): Promise<{ data: any; error: any }> {
  try {
    return await supabase.from('vendor_deals').insert(deal).select().single();
  } catch (e) {
    return { data: null, error: e };
  }
}

// ============================================================================
// 8. CHAT & SUPPORT
// ============================================================================

export async function fetchChatMessages(vendorNameOrEmail: string, customerEmail: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('customer_email', customerEmail.toLowerCase().trim())
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('fetchChatMessages error:', e);
    return [];
  }
}

export async function sendChatMessage(msg: Omit<ChatMessage, 'id'>): Promise<{ data: any; error: any }> {
  try {
    return await supabase.from('chat_messages').insert(msg).select().single();
  } catch (e) {
    return { data: null, error: e };
  }
}
