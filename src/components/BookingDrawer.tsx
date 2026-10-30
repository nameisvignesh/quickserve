import React, { useState } from 'react';
import { SubService } from '../types';
import { useAuth } from '../context/AuthContext';
import { sqlDb } from '../db/sqlDatabase';
import { X, Calendar, Clock, MapPin, Check, Copy, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSubServices: SubService[];
  mainServiceName: string;
  userLocation: { title: string; text: string };
  onOpenLocationDialog: () => void;
  onBookingCreated: (ticketId: string) => void;
}

export const BookingDrawer: React.FC<BookingDrawerProps> = ({
  isOpen,
  onClose,
  selectedSubServices,
  mainServiceName,
  userLocation,
  onOpenLocationDialog,
  onBookingCreated,
}) => {
  const { user, registerCustomer } = useAuth();

  const [dateMode, setDateMode] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });

  const [timeSlot, setTimeSlot] = useState('3:30 – 4:00 PM');
  const [address, setAddress] = useState(userLocation.text !== 'Use GPS or enter an address' ? userLocation.text : '');
  const [area, setArea] = useState('Koregaon Park, Pune');
  const [pincode, setPincode] = useState('411001');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 ');
  const [notes, setNotes] = useState('');

  const [createdTicket, setCreatedTicket] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = selectedSubServices.reduce((sum, s) => sum + s.price, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const scheduledDateLabel =
    dateMode === 'today'
      ? 'Today'
      : dateMode === 'tomorrow'
      ? 'Tomorrow'
      : new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(
          new Date(`${customDate}T12:00:00`)
        );

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const handleConfirm = () => {
    setError('');

    if (selectedSubServices.length === 0) {
      setError('Please choose at least one service before booking.');
      return;
    }

    if (!address.trim()) {
      setError('Please provide your complete home/flat address.');
      return;
    }

    const cleanPhone = customerPhone.replace(/[\s-]/g, '');
    if (!cleanPhone.startsWith('+91') || cleanPhone.length < 13) {
      setError('Please enter a valid Indian phone number (+91 followed by 10 digits).');
      return;
    }

    const name = customerName.trim() || user?.name || 'QuickServe Customer';
    const email = customerEmail.trim() || user?.email || 'customer@quickserve.in';

    setIsSubmitting(true);

    try {
      if (!user) {
        registerCustomer(name, email, customerPhone);
      }

      const booking = sqlDb.createBooking({
        customerName: name,
        customerEmail: email,
        customerPhone,
        mainServiceName,
        items: selectedSubServices.map((s) => ({
          subServiceId: s.id,
          name: s.name,
          price: s.price,
          duration: s.duration,
        })),
        address,
        area,
        pincode,
        scheduledDate: scheduledDateLabel,
        scheduledTime: timeSlot,
        notes,
        paymentMode: 'demo',
      });

      setCreatedTicket(booking.ticketId);
      onBookingCreated(booking.ticketId);
    } catch (err: any) {
      setError(err?.message || 'Failed to create booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (createdTicket) {
      navigator.clipboard.writeText(createdTicket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div
        className="modal-backdrop open"
        onClick={() => {
          if (!createdTicket) onClose();
        }}
      />
      <div className="booking-drawer open" style={{ zIndex: 70 }}>
        <div className="drawer-header">
          <div>
            <span className="drawer-kicker">QUICKSERVE HOME SERVICE</span>
            <h2 style={{ margin: '6px 0 0', fontSize: 26, fontFamily: 'Manrope, sans-serif' }}>
              {createdTicket ? 'Booking Confirmed!' : `Book ${mainServiceName}`}
            </h2>
          </div>
          <button
            className="close-drawer"
            onClick={onClose}
            aria-label="Close booking drawer"
            style={{ border: 0, cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {createdTicket ? (
          /* Success Screen */
          <div style={{ paddingTop: 30, textAlign: 'center' }}>
            <div className="success-icon" style={{ width: 64, height: 64, fontSize: 28, margin: '0 auto 20px' }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 22, fontFamily: 'Manrope, sans-serif', color: 'var(--green)' }}>
              Ticket Raised Successfully
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#6d7c84', lineHeight: 1.6 }}>
              A certified QuickServe expert will arrive at your address on <strong>{scheduledDateLabel}</strong> between{' '}
              <strong>{timeSlot}</strong>.
            </p>

            <div className="ticket-id-card" style={{ margin: '24px 0' }}>
              <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, letterSpacing: '1px' }}>
                YOUR SERVICE TICKET ID
              </span>
              <strong style={{ fontSize: 18, color: 'var(--green-dark)', display: 'block', margin: '6px 0 10px' }}>
                {createdTicket}
              </strong>
              <button
                type="button"
                className="copy-ticket-button"
                onClick={handleCopyTicket}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied to clipboard' : 'Copy Ticket ID'}
              </button>
            </div>

            <div style={{ background: '#f5faf7', border: '1px solid #d4e8dc', borderRadius: 8, padding: 14, textAlign: 'left', fontSize: 11, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#778880' }}>Service:</span>
                <strong>{mainServiceName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#778880' }}>Items:</span>
                <span>{selectedSubServices.map((s) => s.name).join(', ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#778880' }}>Address:</span>
                <span>{address}, {area}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e0ece4', paddingTop: 6, fontWeight: 700 }}>
                <span>Total Payable:</span>
                <span style={{ color: 'var(--green)' }}>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={onClose}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Done & View Schedule
            </button>
          </div>
        ) : (
          /* Form Screen */
          <div>
            {/* Selected Sub-Services Pill Container */}
            <label className="field-label" style={{ marginTop: 20 }}>
              Chosen Services ({selectedSubServices.length})
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 15 }}>
              {selectedSubServices.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: '#f2f8f4',
                    border: '1px solid #d8ebd0',
                    fontSize: 11,
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#1d4439' }}>
                    {sub.icon} {sub.name}
                  </span>
                  <strong style={{ color: 'var(--green)' }}>{formatPrice(sub.price)}</strong>
                </div>
              ))}
            </div>

            {/* Date Selection */}
            <label className="field-label">Preferred Date</label>
            <div className="time-options" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                type="button"
                className={`time-option ${dateMode === 'today' ? 'selected' : ''}`}
                onClick={() => setDateMode('today')}
              >
                <strong>Today</strong>
                <span>Instant / Next slot</span>
              </button>
              <button
                type="button"
                className={`time-option ${dateMode === 'tomorrow' ? 'selected' : ''}`}
                onClick={() => setDateMode('tomorrow')}
              >
                <strong>Tomorrow</strong>
                <span>Planned morning</span>
              </button>
              <button
                type="button"
                className={`time-option ${dateMode === 'custom' ? 'selected' : ''}`}
                onClick={() => setDateMode('custom')}
              >
                <strong>Pick a date</strong>
                <span>Calendar</span>
              </button>
            </div>

            {dateMode === 'custom' && (
              <div style={{ marginTop: 10 }}>
                <input
                  type="date"
                  value={customDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setCustomDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #d4dfd9',
                    fontSize: 12,
                  }}
                />
              </div>
            )}

            {/* Time Slot Selection */}
            <label className="field-label">Preferred Time Slot</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                '8:00 – 8:30 AM',
                '9:30 – 10:00 AM',
                '11:00 – 11:30 AM',
                '1:30 – 2:00 PM',
                '3:30 – 4:00 PM',
                '5:30 – 6:00 PM',
              ].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`time-chip ${timeSlot === slot ? 'selected' : ''}`}
                  onClick={() => setTimeSlot(slot)}
                  style={{
                    padding: '8px 4px',
                    textAlign: 'center',
                    borderRadius: 4,
                    border: timeSlot === slot ? '1px solid var(--green)' : '1px solid #dfe6e2',
                    background: timeSlot === slot ? '#eaf7ee' : '#fff',
                    color: timeSlot === slot ? 'var(--green-dark)' : '#556660',
                    fontSize: 10,
                    fontWeight: timeSlot === slot ? 700 : 500,
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>

            {/* Customer & Address Details */}
            <label className="field-label">Service Address in India</label>
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat / house no., building name, street"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #d4dfd9',
                fontSize: 11,
                marginBottom: 8,
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Area / Locality (e.g. Velachery, Pune, Chennai)"
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #d4dfd9',
                  fontSize: 11,
                }}
              />
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Pincode (e.g. 411001)"
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #d4dfd9',
                  fontSize: 11,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button
                type="button"
                onClick={onOpenLocationDialog}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 0',
                  fontSize: 10,
                  color: 'var(--green)',
                  background: 'transparent',
                  border: 0,
                  borderBottom: '1px solid var(--green)',
                  fontWeight: 700,
                }}
              >
                <MapPin size={12} /> Auto-fill from GPS / Saved location
              </button>
            </div>

            {/* Phone Number */}
            <label className="field-label">Mobile Number for Expert Updates</label>
            <input
              required
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+91 98765 43210"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #d4dfd9',
                fontSize: 11,
                marginBottom: 8,
              }}
            />

            {/* Notes */}
            <label className="field-label">Special instructions (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please call before arrival, split AC unit is in 2nd floor bedroom"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d4dfd9',
                fontSize: 11,
              }}
            />

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                  padding: '10px 12px',
                  borderRadius: 6,
                  background: '#ffeded',
                  color: '#a83232',
                  fontSize: 11,
                  margin: '12px 0',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Bill Summary */}
            <div className="price-summary" style={{ marginTop: 20 }}>
              <div>
                <span>Selected services ({selectedSubServices.length})</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div>
                <span>Estimated GST & platform care (5%)</span>
                <strong>{formatPrice(tax)}</strong>
              </div>
              <div className="price-total">
                <span>Total Payable</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <button
              type="button"
              className="confirm-button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              style={{ marginTop: 16 }}
            >
              <span>{isSubmitting ? 'Raising Ticket…' : 'Confirm & Create Ticket'}</span>
              <span>→</span>
            </button>

            <p className="drawer-note" style={{ marginTop: 12 }}>
              Free cancellation up to 2 hours before your slot · 30-day QuickServe warranty.
            </p>
          </div>
        )}
      </div>
    </>
  );
};
