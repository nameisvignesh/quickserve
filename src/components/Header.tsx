import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, MapPin, Search, ChevronDown, User, LogOut, Briefcase, ShieldCheck, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeView: 'home' | 'bookings' | 'employee' | 'admin';
  onChangeView: (view: 'home' | 'bookings' | 'employee' | 'admin') => void;
  location: { title: string; text: string };
  onOpenLocationDialog: () => void;
  onOpenAuthModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onChangeView,
  location,
  onOpenLocationDialog,
  onOpenAuthModal,
  searchQuery,
  onSearchChange,
}) => {
  const { user, isAuthenticated, isAdmin, isEmployee, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Top Banner */}
      <div className="top-strip">
        <span>
          <ShieldCheck size={14} /> Trusted on-demand home services · Indian cities network
        </span>
        <span className="top-right">
          Transparent pricing · Verified professionals · 30-day warranty
        </span>
      </div>

      {/* Main Header */}
      <header className="header">
        {/* Brand */}
        <a
          className="brand"
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onChangeView('home');
          }}
        >
          <span className="brand-mark">
            <Sparkles size={22} />
          </span>
          <span>
            quick<span>serve</span>
            <small>HOME SERVICES, SIMPLIFIED</small>
          </span>
        </a>

        {/* Location Picker */}
        <button
          className="location-picker"
          type="button"
          onClick={onOpenLocationDialog}
          aria-label="Change location"
        >
          <MapPin size={18} />
          <span>
            <small>SERVICE LOCATION</small>
            <strong>{location.title}</strong>
          </span>
          <ChevronDown size={14} />
        </button>

        {/* Search Bar */}
        <div className="header-search">
          <Search size={16} />
          <input
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (activeView !== 'home') onChangeView('home');
            }}
            placeholder="Search cleaning, AC, repair, electrician..."
          />
          <kbd>⌘ K</kbd>
        </div>

        {/* Navigation */}
        <nav className={`nav ${mobileOpen ? 'open' : ''}`}>
          <button
            type="button"
            className={activeView === 'home' ? 'nav-active' : ''}
            onClick={() => {
              onChangeView('home');
              setMobileOpen(false);
            }}
          >
            Explore
          </button>
          <button
            type="button"
            className={activeView === 'bookings' ? 'nav-active' : ''}
            onClick={() => {
              onChangeView('bookings');
              setMobileOpen(false);
            }}
          >
            My Bookings
          </button>
          <button
            type="button"
            className={activeView === 'employee' ? 'nav-active' : ''}
            onClick={() => {
              onChangeView('employee');
              setMobileOpen(false);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Briefcase size={13} /> Professional Portal
          </button>
          <button
            type="button"
            className={activeView === 'admin' ? 'nav-active' : ''}
            onClick={() => {
              onChangeView('admin');
              setMobileOpen(false);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ShieldCheck size={13} /> Admin
          </button>
        </nav>

        {/* Auth / Account Controls */}
        <div className="header-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="account-btn"
                type="button"
                onClick={logout}
                title="Click to sign out"
              >
                <span className="avatar">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="account-name">
                  {user?.name?.split(' ')[0]}
                </span>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              className="signin-btn"
              type="button"
              onClick={onOpenAuthModal}
            >
              <User size={16} /> Sign In
            </button>
          )}

          <button
            className="menu-btn"
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
    </>
  );
};
