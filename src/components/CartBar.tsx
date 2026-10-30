import React from 'react';
import { SubService } from '../types';
import { ArrowRight, Trash2 } from 'lucide-react';

interface CartBarProps {
  selectedSubServices: SubService[];
  onOpenBookingDrawer: () => void;
  onClearCart: () => void;
}

export const CartBar: React.FC<CartBarProps> = ({
  selectedSubServices,
  onOpenBookingDrawer,
  onClearCart,
}) => {
  if (selectedSubServices.length === 0) return null;

  const subtotal = selectedSubServices.reduce((sum, s) => sum + s.price, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="cart-bar" style={{ zIndex: 50 }}>
      <div className="cart-summary">
        <span className="cart-count">{selectedSubServices.length}</span>
        <span>
          <strong>{selectedSubServices.map((s) => s.name).join(', ')}</strong>
          <small>
            Subtotal {formatPrice(subtotal)} + 5% GST {formatPrice(tax)}
          </small>
        </span>
      </div>

      <div className="cart-total">
        <small>ESTIMATED TOTAL</small>
        <strong>{formatPrice(total)}</strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={onClearCart}
          title="Clear selected services"
          style={{
            padding: 10,
            background: 'transparent',
            color: '#778880',
            border: 0,
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          <Trash2 size={16} />
        </button>

        <button type="button" onClick={onOpenBookingDrawer}>
          Schedule & Book <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
