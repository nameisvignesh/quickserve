import React from 'react';
import { Service, SubService } from '../types';
import { X, Check, Clock3, Star, Sparkles, ArrowRight, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

interface SubServicesModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  selectedSubServices: SubService[];
  onToggleSubService: (sub: SubService) => void;
  onProceedToBooking: () => void;
}

export const SubServicesModal: React.FC<SubServicesModalProps> = ({
  service,
  isOpen,
  onClose,
  selectedSubServices,
  onToggleSubService,
  onProceedToBooking,
}) => {
  if (!isOpen || !service) return null;

  const subServices = service.subServices || [];
  const selectedIds = new Set(selectedSubServices.map((s) => s.id));
  const currentServiceSelected = selectedSubServices.filter((s) => s.serviceId === service.id);

  const subtotal = currentServiceSelected.reduce((sum, s) => sum + s.price, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 60 }}>
      <div
        className="modal subservices-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(780px, 94vw)',
          maxHeight: 'calc(100vh - 40px)',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 16,
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, #102d26 0%, #174238 100%)',
            color: '#fff',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'rgba(255,255,255,.14)',
              color: '#fff',
              border: 0,
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#88c9ae', fontWeight: 800 }}>
            <span>{service.category}</span>
            <span>•</span>
            <span>All Services Inside</span>
          </div>

          <h2 style={{ color: '#fff', margin: '8px 0 6px', fontSize: 'clamp(22px, 3vw, 28px)', fontFamily: 'Manrope, sans-serif' }}>
            {service.name} Catalog
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#c5d8cf', maxWidth: '85%' }}>
            {service.description} Choose individual services or bundle them for your home.
          </p>

          <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 11, color: '#e0ece6' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={14} fill="#ffcf56" color="#ffcf56" /> {service.rating} ({service.reviewCount}+ reviews)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock3 size={14} /> {service.durationRange}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={14} color="#79d9ae" /> 30-day service warranty
            </span>
          </div>
        </div>

        {/* Sub-services List */}
        <div
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: '#f9f9f6',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', letterSpacing: 0.5 }}>
              AVAILABLE OPTIONS ({subServices.length})
            </span>
            <span style={{ fontSize: 11, color: '#7a8c84' }}>
              Select one or more to add to your service ticket
            </span>
          </div>

          {subServices.map((sub) => {
            const isAdded = selectedIds.has(sub.id);
            return (
              <div
                key={sub.id}
                style={{
                  background: '#fff',
                  border: isAdded ? '2px solid var(--green)' : '1px solid #e2e7e2',
                  borderRadius: 12,
                  padding: '18px 20px',
                  display: 'flex',
                  gap: 16,
                  transition: 'all .2s ease',
                  boxShadow: isAdded ? '0 4px 16px rgba(18,60,53,.08)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: isAdded ? '#e4f3eb' : '#f0f3ee',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {sub.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#16312a' }}>
                      {sub.name}
                    </h3>
                    {sub.popular && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          background: '#fff0bb',
                          color: '#8f610e',
                          padding: '2px 7px',
                          borderRadius: 4,
                        }}
                      >
                        POPULAR
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '5px 0 10px', fontSize: 12, color: '#667770', lineHeight: 1.5 }}>
                    {sub.description}
                  </p>

                  {/* Included bullets */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px 12px', margin: '8px 0 12px' }}>
                    {sub.includes.map((inc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#4a5d56' }}>
                        <Check size={12} color="#1d8b67" style={{ flexShrink: 0 }} />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f3ee', paddingTop: 10, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <strong style={{ fontSize: 17, fontFamily: 'Manrope, sans-serif', color: 'var(--green)', fontWeight: 800 }}>
                        {formatPrice(sub.price)}
                      </strong>
                      <span style={{ fontSize: 11, color: '#889891', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock3 size={13} /> {sub.duration}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleSubService(sub)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 6,
                        border: isAdded ? '1px solid var(--green)' : '1px solid #c2d8cc',
                        background: isAdded ? 'var(--green)' : '#f2f8f4',
                        color: isAdded ? '#fff' : 'var(--green)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all .15s ease',
                      }}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 size={14} /> Added
                        </>
                      ) : (
                        <>
                          <Plus size={14} /> Add to booking
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Summary and Action */}
        <div
          style={{
            padding: '16px 28px',
            background: '#fff',
            borderTop: '1px solid #e7ebe8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#7a8c84' }}>
              {currentServiceSelected.length} {currentServiceSelected.length === 1 ? 'service' : 'services'} selected from {service.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 20, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: 'var(--green)' }}>
                {formatPrice(total)}
              </span>
              {currentServiceSelected.length > 0 && (
                <span style={{ fontSize: 10, color: '#889891' }}>
                  (incl. ₹{tax} 5% GST)
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                borderRadius: 6,
                border: '1px solid #d4dfd9',
                background: '#fff',
                color: '#556660',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Keep Exploring
            </button>

            <button
              type="button"
              disabled={currentServiceSelected.length === 0}
              onClick={() => {
                onClose();
                onProceedToBooking();
              }}
              className="primary-btn"
              style={{
                opacity: currentServiceSelected.length === 0 ? 0.6 : 1,
                cursor: currentServiceSelected.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Schedule & Book <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
