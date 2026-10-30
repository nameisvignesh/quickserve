import React from 'react';
import { Search, ArrowRight, ShieldCheck, Star, Clock3, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectQuickService: (serviceName: string) => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  onSelectQuickService,
  onExploreClick,
}) => {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> ON-DEMAND HOME CARE, BEAUTIFULLY SIMPLE
          </div>
          <h1>
            The help you need,<br />
            <em>right when</em> you need it.
          </h1>
          <p>
            From spotless deep cleaning to a cooler room with high-power AC jet care and TV mounting — QuickServe brings verified local experts to your doorstep.
          </p>

          <div className="hero-search">
            <Search size={18} />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Try “AC service”, “Home cleaning” or “Electrician”"
            />
            <button type="button" onClick={onExploreClick}>
              Explore <ArrowRight size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', fontSize: 11, color: '#7a8c84', alignItems: 'center' }}>
            <span>Popular:</span>
            {['Home cleaning', 'AC service', 'TV installation', 'Appliance repair'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSelectQuickService(s)}
                style={{
                  background: '#f0f5f2',
                  border: '1px solid #d8e5de',
                  borderRadius: 4,
                  padding: '3px 8px',
                  color: 'var(--green)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="hero-trust">
            <span>
              <ShieldCheck size={16} /> Verified professionals
            </span>
            <span>
              <Star size={16} fill="#5b9477" /> 4.9/5 Quality rating
            </span>
          </div>
        </div>

        {/* Hero Illustration Side */}
        <div className="hero-art">
          <div className="art-orb orb-one" />
          <div className="art-orb orb-two" />

          <div className="home-card">
            <div className="home-card-top">
              <span className="mini-logo">
                <Sparkles size={16} />
              </span>
              <span>QUICKSERVE HOME CARE</span>
              <span className="online-dot" />
            </div>

            <div className="home-illustration">
              <div className="sun" />
              <div className="house-roof" />
              <div className="house-body">
                <div className="house-window" />
                <div className="house-door" />
              </div>
              <div className="plant plant-left">♧</div>
              <div className="plant plant-right">♧</div>
            </div>

            <div className="floating-rating">
              <span className="rating-stars">★★★★★</span>
              <strong>4.9/5</strong>
              <small>Customer happiness</small>
            </div>

            <div className="floating-booking">
              <span className="check-bubble">
                <CheckCircle2 size={18} />
              </span>
              <span>
                <strong>Booking confirmed</strong>
                <small>Your verified expert is on the way</small>
              </span>
            </div>
          </div>

          <div className="hero-stamp">
            <span>GOOD HELP.</span>
            <span>GOOD DAYS.</span>
            <Sparkles size={16} />
          </div>
        </div>
      </section>

      {/* 4 Benefits Strip */}
      <section className="benefits">
        <div>
          <span className="benefit-icon">
            <ShieldCheck size={20} />
          </span>
          <span>
            <strong>Vetted professionals</strong>
            <small>Background-checked & certified</small>
          </span>
        </div>
        <div>
          <span className="benefit-icon">
            <Clock3 size={20} />
          </span>
          <span>
            <strong>At your convenience</strong>
            <small>Select exact slot & same-day care</small>
          </span>
        </div>
        <div>
          <span className="benefit-icon">
            <CreditCard size={20} />
          </span>
          <span>
            <strong>Clear, upfront pricing</strong>
            <small>No surprise bills or hidden charges</small>
          </span>
        </div>
        <div>
          <span className="benefit-icon">
            <Star size={20} />
          </span>
          <span>
            <strong>30-day warranty</strong>
            <small>Care that stays with you</small>
          </span>
        </div>
      </section>
    </>
  );
};
