import React, { useMemo } from 'react';
import { Service, SubService } from '../types';
import { Clock3, Star, ArrowRight, CheckCircle2, Plus, Sparkles, Layers } from 'lucide-react';

interface ServicesSectionProps {
  services: Service[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onOpenSubServicesModal: (service: Service) => void;
  selectedSubServices: SubService[];
  onToggleSubService: (sub: SubService) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onOpenSubServicesModal,
  selectedSubServices,
  onToggleSubService,
}) => {
  const categories = useMemo(() => {
    return ['All services', ...new Set(services.map((s) => s.category))];
  }, [services]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return services.filter((s) => {
      const matchCat = selectedCategory === 'All services' || s.category === selectedCategory;
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.subServices?.some((sub) => sub.name.toLowerCase().includes(q) || sub.description.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [services, selectedCategory, searchQuery]);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <section className="services-section" id="services">
      <div className="section-heading">
        <div>
          <div className="eyebrow">A LITTLE HELP GOES A LONG WAY</div>
          <h2>What can we help with?</h2>
          <p>
            Click any service to view all specialized sub-services, detailed inclusions, and customized packages.
          </p>
        </div>
        <span className="service-count">{filtered.length} categories</span>
      </div>

      {/* Category Pills */}
      <div className="category-pills">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={`pill ${selectedCategory === c ? 'active' : ''}`}
            onClick={() => onSelectCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Service Cards Grid */}
      <div className="service-grid">
        {filtered.map((s) => {
          const subCount = s.subServices?.length || 0;
          const chosenInThis = selectedSubServices.filter((sub) => sub.serviceId === s.id);

          return (
            <article
              key={s.id}
              className={`service-card ${chosenInThis.length > 0 ? 'chosen' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onOpenSubServicesModal(s)}
            >
              {/* Card visual / illustration */}
              <div className="service-visual">
                <span className="service-emoji">{s.icon}</span>
                <span className="service-tag">{s.badge || s.category}</span>
                {chosenInThis.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'var(--green)',
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 12,
                    }}
                  >
                    {chosenInThis.length} added
                  </span>
                )}
              </div>

              {/* Service Info */}
              <div className="service-info">
                <h3>{s.name}</h3>
                <p>{s.description}</p>

                <div className="service-meta">
                  <span>
                    <Clock3 size={13} /> {s.durationRange}
                  </span>
                  <span className="rating">
                    <Star size={12} fill="currentColor" /> {s.rating}
                  </span>
                </div>

                <div className="service-bottom">
                  <div>
                    <strong style={{ display: 'block', fontSize: 15 }}>
                      From {formatPrice(s.startingPrice)}
                    </strong>
                    <small style={{ color: 'var(--green)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Layers size={11} /> {subCount} services inside
                    </small>
                  </div>

                  <button
                    type="button"
                    className="add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSubServicesModal(s);
                    }}
                    style={{ background: 'var(--green)', color: '#fff', borderColor: 'var(--green)' }}
                  >
                    View Services <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state" style={{ marginTop: 24 }}>
          <h3>No services found</h3>
          <p>Try searching for different keywords or clear the category filter.</p>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => onSelectCategory('All services')}
          >
            Show All Services
          </button>
        </div>
      )}

      {/* Bottom CTA Card */}
      <section className="bottom-cta" style={{ marginTop: 56 }}>
        <div className="cta-icon">
          <Sparkles size={24} />
        </div>
        <div>
          <h3>Your home deserves thoughtful care.</h3>
          <p>Pick a service, customize with exact options, and our verified professional handles the rest.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            const first = services[0];
            if (first) onOpenSubServicesModal(first);
          }}
        >
          Explore Catalog <ArrowRight size={15} />
        </button>
      </section>
    </section>
  );
};
