import { FileText, Printer } from 'lucide-react';
import type { Booking, Vendor } from '../lib/supabase';

type BookingWithVendor = Booking & { vendor?: Vendor };

export interface TaxInvoiceReceiptModalProps {
  booking: BookingWithVendor;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

/**
 * 🧾 TaxInvoiceReceiptModal - Standalone Reusable Tax Invoice & GST Receipt Component
 * Duplicated & saved for future reference and reuse across the platform.
 */
export default function TaxInvoiceReceiptModal({
  booking,
  onClose,
  userName,
  userEmail
}: TaxInvoiceReceiptModalProps) {
  const subtotal = Math.round(booking.total_amount / 1.18);
  const cgst = Math.round((booking.total_amount * 0.09) / 1.18);
  const sgst = Math.round((booking.total_amount * 0.09) / 1.18);

  return (
    <div className="fixed inset-0 z-50 bg-dark-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-sage-200 my-auto animate-scale-up">
        {/* Action Header Bar */}
        <div className="bg-sage-950 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-400" />
            <span className="font-bold text-sm tracking-wide uppercase">Official Tax Invoice & Receipt</span>
          </div>
          <div className="flex items-center gap-3">
            {/* 🖨️ Print / Save PDF Trigger */}
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-gradient-brand text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Document Body */}
        <div className="p-8 space-y-6 bg-white text-dark-900" id="official-tax-receipt">
          {/* Company Branding & Invoice Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-sage-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
                  ✨
                </div>
                <h2 className="font-display text-2xl font-bold text-sage-950">Arshithgroup Pvt. Ltd.</h2>
              </div>
              <p className="text-dark-500 text-xs">Festivo Digital Platform • Banglore, Karnataka, India</p>
              <p className="text-dark-400 text-[11px] font-mono mt-0.5">GSTIN: 29AAAAA0000A1Z5 • Email: Arshithgroup@info.com</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-full uppercase tracking-wider mb-1">
                ✓ OFFICIAL PAID RECEIPT
              </span>
              <p className="font-mono text-xs text-dark-500">Invoice #: INV-{booking.booking_ref}</p>
              <p className="font-mono text-xs text-dark-500">
                Date: {new Date(booking.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Billed To & Payment Meta */}
          <div className="grid grid-cols-2 gap-6 bg-sage-50/70 p-4 rounded-2xl border border-sage-100">
            <div>
              <p className="text-[10px] font-extrabold text-sage-800 uppercase tracking-wider mb-1">Billed To (Customer)</p>
              <p className="font-bold text-sm text-sage-950">{booking.customer_name || userName || 'Customer'}</p>
              <p className="text-xs text-dark-600">{booking.customer_email || userEmail}</p>
              <p className="text-xs text-dark-600">{booking.customer_phone || '+91 8618471424'}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-sage-800 uppercase tracking-wider mb-1">Payment Details</p>
              <p className="text-xs text-dark-700"><span className="font-bold">Gateway:</span> Razorpay Express Checkout</p>
              <p className="text-xs text-dark-700 font-mono"><span className="font-bold font-sans">Payment ID:</span> {booking.payment_intent_id || 'pay_RZP_Live9981'}</p>
              <p className="text-xs text-dark-700"><span className="font-bold">Event Type:</span> {booking.event_type}</p>
            </div>
          </div>

          {/* Invoice Itemized Charges Table */}
          <div className="overflow-hidden border border-sage-200 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sage-900 text-white text-xs font-bold">
                  <th className="p-3">Vendor / Service Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100 text-xs">
                <tr>
                  <td className="p-3">
                    <p className="font-bold text-sage-950 text-sm">{booking.vendor?.name || 'Event Booking Service'}</p>
                    <p className="text-dark-500 text-[11px]">{booking.special_requests || 'Confirmed service reservation & venue access'}</p>
                  </td>
                  <td className="p-3 font-semibold text-sage-800">{booking.vendor?.category || 'Service'}</td>
                  <td className="p-3 text-right font-bold text-sm">₹{subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 text-dark-500">CGST (9%)</td>
                  <td className="p-3 text-dark-500">Tax</td>
                  <td className="p-3 text-right font-medium">₹{cgst.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 text-dark-500">SGST (9%)</td>
                  <td className="p-3 text-dark-500">Tax</td>
                  <td className="p-3 text-right font-medium">₹{sgst.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-sage-100/80 font-bold text-sage-950 text-sm">
                  <td colSpan={2} className="p-3 text-right">Total Paid Amount:</td>
                  <td className="p-3 text-right font-['Times_New_Roman',serif] text-lg text-sage-900">
                    ₹{booking.total_amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Terms & Authorization Stamp */}
          <div className="flex items-center justify-between pt-4 border-t border-sage-100">
            <div>
              <p className="text-[10px] text-dark-400 font-medium max-w-xs">
                This is a computer-generated tax invoice issued by Arshithgroup Pvt. Ltd. No signature required.
              </p>
            </div>
            <div className="text-right">
              <div className="w-24 h-10 border border-sage-300 rounded-lg flex items-center justify-center bg-sage-50 text-[10px] font-bold text-sage-800">
                [ AUTH STAMP ]
              </div>
              <p className="text-[10px] text-dark-500 font-bold mt-1">Authorized Signatory</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
