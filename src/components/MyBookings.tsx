import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sqlDb } from '../db/sqlDatabase';
import { Booking } from '../types';
import { ClipboardList, Calendar, MapPin, Clock, Copy, Check, ArrowRight, UserCheck, Sparkles } from 'lucide-react';

interface MyBookingsProps {
  onExploreServices: () => void;
  onShowToast: (msg: string) => void;
  onOpenAuthModal: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  onExploreServices,
  onShowToast,
  onOpenAuthModal,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bookings = sqlDb.getBookings();
  const userBookings = isAuthenticated && user
    ? bookings.filter(
        (b) =>
          b.customerEmail.toLowerCase() === user.email.toLowerCase() ||
          b.customerId === user.id
      )
    : bookings.slice(0, 3); // Preview demo bookings when not signed in

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const handleCopyTicket = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    setCopiedId(ticket);
    onShowToast(`Ticket ${ticket} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelBooking = (id: string) => {
    sqlDb.updateBookingStatus(id, 'cancelled');
    onShowToast('Booking cancelled.');
  };

  return (
    <main className="bookings-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 80px' }}>
      <div className="section-heading" style={{ marginBottom: 24 }}>
        <div>
          <div className="eyebrow">YOUR QUICKSERVE ACCOUNT</div>
          <h2>My Service Bookings</h2>
          <p>
            Track assigned experts, arrival times, and service ticket status.
          </p>
        </div>

        <button className="secondary-btn" type="button" onClick={onExploreServices}>
          Explore Services <ArrowRight size={14} />
        </button>
      </div>

      {!isAuthenticated && (
        <div style={{ background: '#f5faf7', border: '1px solid #c7e6d4', borderRadius: 8, padding: '12px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#2a5542' }}>
            Showing recent home bookings on this device. Sign in with Clerk to sync bookings across devices.
          </span>
          <button
            type="button"
            className="primary-btn"
            onClick={onOpenAuthModal}
            style={{ padding: '7px 14px', fontSize: 11 }}
          >
            Sign in
          </button>
        </div>
      )}

      {userBookings.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={36} color="var(--green)" />
          <h3>No service bookings found</h3>
          <p>Once you schedule a service, your ticket and real-time updates will show up here.</p>
          <button className="primary-btn" type="button" onClick={onExploreServices}>
            Find a Service
          </button>
        </div>
      ) : (
        <div className="booking-list" style={{ display: 'grid', gap: 14 }}>
          {userBookings.map((b) => (
            <article
              key={b.id}
              className="booking-row"
              style={{
                background: '#fff',
                border: '1px solid #e1e7e2',
                borderRadius: 12,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                flexWrap: 'wrap',
              }}
            >
              <div
                className="booking-symbol"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#e7f0e6',
                  color: '#47795d',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 22,
                }}
              >
                ✦
              </div>

              <div className="booking-detail" style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <strong style={{ fontSize: 16, fontFamily: 'Manrope, sans-serif', color: 'var(--green)' }}>
                    {b.mainServiceName}
                  </strong>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background:
                        b.status === 'completed'
                          ? '#dcfce7'
                          : b.status === 'in_progress'
                          ? '#fef3c7'
                          : b.status === 'cancelled'
                          ? '#fee2e2'
                          : '#e0f2fe',
                      color:
                        b.status === 'completed'
                          ? '#15803d'
                          : b.status === 'in_progress'
                          ? '#b45309'
                          : b.status === 'cancelled'
                          ? '#b91c1c'
                          : '#0369a1',
                      textTransform: 'uppercase',
                    }}
                  >
                    {b.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: '#556660', margin: '4px 0' }}>
                  {b.items.map((i) => i.name).join(', ')}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 11, color: '#7a8c84', marginTop: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={13} /> {b.scheduledDate} at {b.scheduledTime}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} /> {b.address}, {b.area}
                  </span>
                  {b.assignedEmployeeName && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontWeight: 700 }}>
                      <UserCheck size={13} /> Pro: {b.assignedEmployeeName}
                    </span>
                  )}
                </div>

                {/* Ticket ID & Copy */}
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#889891', letterSpacing: 0.5 }}>TICKET:</span>
                  <code style={{ fontSize: 11, background: '#f0faf3', padding: '2px 6px', borderRadius: 4, color: 'var(--green-dark)', fontWeight: 700 }}>
                    {b.ticketId}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyTicket(b.ticketId)}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: 'var(--green)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {copiedId === b.ticketId ? <Check size={12} /> : <Copy size={12} />}
                    {copiedId === b.ticketId ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="booking-amount" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <strong style={{ fontSize: 18, color: 'var(--green)', fontFamily: 'Manrope, sans-serif' }}>
                  {formatPrice(b.total)}
                </strong>
                <small style={{ color: '#889891', fontSize: 10 }}>
                  Payment: {b.paymentStatus.replace('_', ' ')}
                </small>

                {b.status !== 'cancelled' && b.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleCancelBooking(b.id)}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: '#b91c1c',
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};
