import React, { useState } from 'react';
import { X, MapPin, Navigation, ArrowRight } from 'lucide-react';

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: { title: string; text: string };
  onSaveLocation: (title: string, text: string) => void;
  onShowToast: (msg: string) => void;
}

export const LocationDialog: React.FC<LocationDialogProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSaveLocation,
  onShowToast,
}) => {
  const [manualInput, setManualInput] = useState(currentLocation.text);
  const [gpsLoading, setGpsLoading] = useState(false);

  if (!isOpen) return null;

  const popularCities = [
    { name: 'Chennai, Tamil Nadu', area: 'Velachery, Chennai · 600042' },
    { name: 'Pune, Maharashtra', area: 'Koregaon Park, Pune · 411001' },
    { name: 'Bengaluru, Karnataka', area: 'Indiranagar, Bengaluru · 560038' },
    { name: 'Mumbai, Maharashtra', area: 'Bandra West, Mumbai · 400050' },
    { name: 'Hyderabad, Telangana', area: 'Hitec City, Hyderabad · 500081' },
    { name: 'Delhi NCR', area: 'Gurugram Sector 43 · 122002' },
  ];

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      onShowToast('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    onShowToast('Requesting GPS device location…');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        onSaveLocation('Current GPS Location', `Lat ${lat}, Long ${lng}`);
        onShowToast('GPS location fixed and saved.');
        onClose();
      },
      (err) => {
        setGpsLoading(false);
        onShowToast('Location permission denied or unavailable. Enter manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleManualSave = () => {
    if (!manualInput.trim()) {
      onShowToast('Please enter an area, street or pincode.');
      return;
    }
    const title = manualInput.split(',')[0].trim();
    onSaveLocation(title, manualInput.trim());
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 90 }}>
      <div
        className="modal location-dialog open"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, padding: 24 }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eaf4ee', color: 'var(--green)', display: 'grid', placeItems: 'center' }}>
            <MapPin size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>
              Select Service Location
            </h3>
            <small style={{ color: '#7a8c84' }}>Find experts nearby in your locality</small>
          </div>
        </div>

        {/* GPS Button */}
        <button
          type="button"
          className="detect-btn"
          disabled={gpsLoading}
          onClick={handleUseGps}
          style={{ width: '100%', padding: '12px', fontSize: 12, marginBottom: 16 }}
        >
          <Navigation size={15} />
          <span>{gpsLoading ? 'Detecting satellite location…' : 'Use Current Device Location'}</span>
        </button>

        <div className="or-line" style={{ margin: '14px 0' }}>
          OR ENTER LOCALITY / PINCODE
        </div>

        <input
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="e.g. Koregaon Park, Pune or 411001"
          style={{ width: '100%', marginBottom: 12 }}
        />

        <button
          type="button"
          className="primary-btn"
          onClick={handleManualSave}
          style={{ width: '100%', padding: '11px', fontSize: 12 }}
        >
          Confirm Location <ArrowRight size={15} />
        </button>

        {/* Popular Cities list */}
        <div style={{ marginTop: 20 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#889891', letterSpacing: '0.8px', display: 'block', marginBottom: 8 }}>
            POPULAR CITIES
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {popularCities.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  onSaveLocation(c.name.split(',')[0], c.area);
                  onClose();
                }}
                style={{
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: '1px solid #e1e7e2',
                  background: '#f8faf9',
                  textAlign: 'left',
                  fontSize: 11,
                  color: '#34463f',
                  cursor: 'pointer',
                }}
              >
                <strong>{c.name.split(',')[0]}</strong>
                <small style={{ display: 'block', color: '#889891', fontSize: 9 }}>{c.name.split(',')[1]}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
