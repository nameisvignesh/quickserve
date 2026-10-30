import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { sqlDb } from './db/sqlDatabase';
import { Service, SubService } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { SubServicesModal } from './components/SubServicesModal';
import { BookingDrawer } from './components/BookingDrawer';
import { CartBar } from './components/CartBar';
import { LocationDialog } from './components/LocationDialog';
import { AuthModal } from './components/AuthModal';
import { EmployeePortal } from './components/EmployeePortal';
import { AdminPortal } from './components/AdminPortal';
import { MyBookings } from './components/MyBookings';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

export function App() {
  const { user, isAdmin, isEmployee } = useAuth();

  // Navigation route state: home, bookings, employee, admin
  const [activeView, setActiveView] = useState<'home' | 'bookings' | 'employee' | 'admin'>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/admin') || hash.includes('admin')) return 'admin';
    if (path.includes('/employee') || hash.includes('employee')) return 'employee';
    if (path.includes('/bookings') || hash.includes('bookings')) return 'bookings';
    return 'home';
  });

  // Services from SQL Database
  const [services, setServices] = useState<Service[]>(() => sqlDb.getServices());
  const [selectedCategory, setSelectedCategory] = useState<string>('All services');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sub-services and booking selection
  const [selectedSubServices, setSelectedSubServices] = useState<SubService[]>([]);
  const [modalService, setModalService] = useState<Service | null>(null);

  // Dialogs and Drawers
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved location
  const [userLocation, setUserLocation] = useState<{ title: string; text: string }>(() => {
    try {
      const stored = localStorage.getItem('quickserve_user_loc');
      return stored ? JSON.parse(stored) : { title: 'Pune, Maharashtra', text: 'Koregaon Park, Pune · 411001' };
    } catch {
      return { title: 'Pune, Maharashtra', text: 'Koregaon Park, Pune · 411001' };
    }
  });

  // Keep services updated with SQL changes
  useEffect(() => {
    const unsubscribe = sqlDb.subscribe(() => {
      setServices(sqlDb.getServices());
    });
    return unsubscribe;
  }, []);

  // Listen to browser forward/back buttons or popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('admin')) setActiveView('admin');
      else if (path.includes('/employee') || hash.includes('employee')) setActiveView('employee');
      else if (path.includes('/bookings') || hash.includes('bookings')) setActiveView('bookings');
      else setActiveView('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeView = (view: 'home' | 'bookings' | 'employee' | 'admin') => {
    setActiveView(view);
    const targetPath = view === 'home' ? '/' : `/${view}`;
    window.history.pushState(null, '', targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSaveLocation = (title: string, text: string) => {
    const loc = { title, text };
    setUserLocation(loc);
    localStorage.setItem('quickserve_user_loc', JSON.stringify(loc));
    showToast(`Service location set to ${title}`);
  };

  const handleToggleSubService = (sub: SubService) => {
    setSelectedSubServices((prev) => {
      const exists = prev.some((s) => s.id === sub.id);
      if (exists) {
        showToast(`Removed ${sub.name}`);
        return prev.filter((s) => s.id !== sub.id);
      } else {
        showToast(`Added ${sub.name} to booking`);
        return [...prev, sub];
      }
    });
  };

  const handleOpenSubServicesModal = (service: Service) => {
    setModalService(service);
  };

  const handleProceedToBooking = () => {
    setIsBookingDrawerOpen(true);
  };

  const handleQuickSelectService = (serviceName: string) => {
    const found = services.find((s) => s.name.toLowerCase() === serviceName.toLowerCase());
    if (found) {
      setModalService(found);
    }
  };

  // Determine main service name for booking drawer
  const mainServiceName =
    selectedSubServices.length > 0
      ? services.find((s) => s.id === selectedSubServices[0].serviceId)?.name || 'Home Service'
      : modalService?.name || 'Home Service';

  return (
    <div className="app-shell">
      {/* Global Header */}
      <Header
        activeView={activeView}
        onChangeView={changeView}
        location={userLocation}
        onOpenLocationDialog={() => setIsLocationDialogOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* View 1: Main Customer Home Experience */}
      {activeView === 'home' && (
        <main>
          <Hero
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectQuickService={handleQuickSelectService}
            onExploreClick={() => {
              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <ServicesSection
            services={services}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onOpenSubServicesModal={handleOpenSubServicesModal}
            selectedSubServices={selectedSubServices}
            onToggleSubService={handleToggleSubService}
          />
        </main>
      )}

      {/* View 2: Customer Bookings Page */}
      {activeView === 'bookings' && (
        <MyBookings
          onExploreServices={() => changeView('home')}
          onShowToast={showToast}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* View 3: Employee Page (/employee) */}
      {activeView === 'employee' && (
        <EmployeePortal onShowToast={showToast} />
      )}

      {/* View 4: Admin Page (/admin) */}
      {activeView === 'admin' && (
        <AdminPortal onShowToast={showToast} />
      )}

      {/* Global Footer */}
      <Footer onChangeView={changeView} onShowToast={showToast} />

      {/* Cart Summary Bar on Customer View */}
      {activeView === 'home' && (
        <CartBar
          selectedSubServices={selectedSubServices}
          onOpenBookingDrawer={() => setIsBookingDrawerOpen(true)}
          onClearCart={() => {
            setSelectedSubServices([]);
            showToast('Cleared selected services.');
          }}
        />
      )}

      {/* Sub-Services Explorer Modal (Key requirement in recording.mp4) */}
      <SubServicesModal
        service={modalService}
        isOpen={!!modalService}
        onClose={() => setModalService(null)}
        selectedSubServices={selectedSubServices}
        onToggleSubService={handleToggleSubService}
        onProceedToBooking={handleProceedToBooking}
      />

      {/* Scheduling & Indian Address Booking Drawer */}
      <BookingDrawer
        isOpen={isBookingDrawerOpen}
        onClose={() => setIsBookingDrawerOpen(false)}
        selectedSubServices={selectedSubServices}
        mainServiceName={mainServiceName}
        userLocation={userLocation}
        onOpenLocationDialog={() => setIsLocationDialogOpen(true)}
        onBookingCreated={(ticketId) => {
          showToast(`Service ticket ${ticketId} confirmed!`);
          setSelectedSubServices([]);
        }}
      />

      {/* Location Dialog */}
      <LocationDialog
        isOpen={isLocationDialogOpen}
        onClose={() => setIsLocationDialogOpen(false)}
        currentLocation={userLocation}
        onSaveLocation={handleSaveLocation}
        onShowToast={showToast}
      />

      {/* Clerk-styled Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          showToast('Authentication successful!');
        }}
      />

      {/* Global Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
