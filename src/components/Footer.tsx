import React from 'react';
import { Sparkles } from 'lucide-react';

interface FooterProps {
  onChangeView: (view: 'home' | 'bookings' | 'employee' | 'admin') => void;
  onShowToast: (msg: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onChangeView, onShowToast }) => {
  return (
    <footer>
      <div className="footer-main">
        <div className="brand footer-brand">
          <span className="brand-mark">
            <Sparkles size={22} />
          </span>
          <span>
            quick<span>serve</span>
            <small>HOME SERVICES, SIMPLIFIED</small>
          </span>
        </div>

        <p>Reliable help for the place that matters most · Operating across Pune, Chennai, Bengaluru, Mumbai & Delhi NCR.</p>

        <div className="footer-links">
          <button
            type="button"
            onClick={() => {
              onChangeView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Explore services
          </button>
          <button type="button" onClick={() => onChangeView('bookings')}>
            My bookings
          </button>
          <button type="button" onClick={() => onChangeView('employee')}>
            Professional Portal (/employee)
          </button>
          <button type="button" onClick={() => onChangeView('admin')}>
            Admin (/admin)
          </button>
          <button
            type="button"
            onClick={() => onShowToast('24/7 QuickServe Customer Support: support@quickserve.in | Helpline: 1800-2026-SERVE')}
          >
            Support & Help
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 QuickServe Technologies India Pvt. Ltd. All rights reserved.</span>
        <span>Secure SQL Relational Data Architecture · Clerk Auth Integration</span>
      </div>
    </footer>
  );
};
