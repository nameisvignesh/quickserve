import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sqlDb } from '../db/sqlDatabase';
import { Booking, Employee } from '../types';
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  Calendar,
  IndianRupee,
  UserCheck,
  Lock,
  ArrowRight,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface EmployeePortalProps {
  onShowToast: (msg: string) => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({ onShowToast }) => {
  const { user, employeeProfile, login, registerEmployee, logout, isEmployee, refreshUserData } = useAuth();

  const [activeTab, setActiveTab] = useState<'available' | 'assigned' | 'completed'>('available');
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState('AC service, Appliance repair');
  const [experience, setExperience] = useState(3);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Read live data from SQL Database
  const allBookings = sqlDb.getBookings();
  const availableBookings = sqlDb.getAvailableBookings();
  const myAssignedBookings = employeeProfile
    ? allBookings.filter(
        (b) =>
          b.assignedEmployeeId === employeeProfile.id &&
          (b.status === 'assigned' || b.status === 'in_progress')
      )
    : [];
  const myCompletedBookings = employeeProfile
    ? allBookings.filter((b) => b.assignedEmployeeId === employeeProfile.id && b.status === 'completed')
    : [];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanedPhone = phone.replace(/[\s-]/g, '');
    if (!cleanedPhone.startsWith('+91') || cleanedPhone.length < 13) {
      setError('Please enter a valid 10-digit Indian mobile number (+91 XXXXX XXXXX).');
      setLoading(false);
      return;
    }

    try {
      const res = await registerEmployee({
        name,
        email,
        phone,
        skills,
        experienceYears: Number(experience),
        password,
      });

      if (!res.success) {
        setError(res.message || 'Registration failed.');
      } else if (res.employee) {
        setSuccessInfo({
          id: res.employee.id,
          name: res.employee.name,
          email: res.employee.email,
        });
        onShowToast('Employee registration submitted. Awaiting admin verification.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error creating account.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(loginEmail, loginPassword, 'employee');
      if (!res.success) {
        setError(res.message || 'Login failed.');
      } else {
        onShowToast('Welcome back to the Service Professional Portal!');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = (bookingId: string) => {
    if (!employeeProfile) return;
    sqlDb.assignBooking(bookingId, employeeProfile.id, employeeProfile.name);
    onShowToast(`Service request accepted and added to your schedule!`);
    refreshUserData();
  };

  const handleUpdateStatus = (bookingId: string, status: Booking['status']) => {
    sqlDb.updateBookingStatus(bookingId, status);
    onShowToast(`Booking marked as ${status.replace('_', ' ')}.`);
    refreshUserData();
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  // Check if current user is an employee and whether verified
  const currentEmployee = employeeProfile || (user?.role === 'employee' ? sqlDb.getEmployeeByEmail(user.email) : null);
  const isVerified = currentEmployee?.status === 'verified';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px 80px' }}>
      {/* Employee Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--green)' }}>
            <Briefcase size={14} /> Service Professional Portal (/employee)
          </div>
          <h1 style={{ margin: '8px 0 6px', fontSize: 'clamp(28px, 4vw, 36px)', fontFamily: 'Manrope, sans-serif', color: 'var(--ink)' }}>
            Empowering Service Experts
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6d7c84', maxWidth: 650 }}>
            Register with your email and Indian phone number. Once verified by the administrator, you can view, accept, and manage user home service requests.
          </p>
        </div>

        {currentEmployee && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{currentEmployee.name}</div>
              <div style={{ fontSize: 10, color: '#7a8c84' }}>{currentEmployee.email} · {currentEmployee.phone}</div>
            </div>
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d4dfd9',
                background: '#fff',
                color: '#556660',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        )}
      </div>

      {/* When NOT signed in as a verified employee */}
      {!currentEmployee ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, marginTop: 10 }}>
          {/* Registration Box */}
          <div style={{ background: '#fff', border: '1px solid #e1e7e2', borderRadius: 12, padding: 28, boxShadow: '0 8px 30px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e5f3eb', color: 'var(--green)', display: 'grid', placeItems: 'center' }}>
                <UserCheck size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>
                  Register as an Employee
                </h3>
                <small style={{ color: '#7a8c84' }}>Generate credentials with email & Indian mobile number</small>
              </div>
            </div>

            {successInfo ? (
              <div style={{ background: '#f0faf3', border: '1px solid #bce6cb', borderRadius: 8, padding: 18, textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ffcf56', color: '#16312a', display: 'grid', placeItems: 'center', margin: '0 auto 12px', fontSize: 20 }}>
                  ⏳
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--green-dark)' }}>
                  Registration Submitted!
                </h4>
                <p style={{ fontSize: 12, color: '#4a5d56', lineHeight: 1.6, margin: '0 0 12px' }}>
                  Your Employee ID is <strong>{successInfo.id}</strong>.
                  <br />
                  Your status is currently: <strong style={{ color: '#d97706' }}>PENDING ADMIN VERIFICATION</strong>.
                </p>
                <div style={{ background: '#fff', border: '1px dashed #c0d8cb', borderRadius: 6, padding: 12, fontSize: 11, textAlign: 'left', color: '#31483f' }}>
                  <strong>Next step:</strong> An administrator must verify your profile at{' '}
                  <code style={{ background: '#eef5f1', padding: '2px 4px', borderRadius: 3 }}>/admin</code>. Once verified, you will be able to log in below and view all user service requests.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessInfo(null);
                    setAuthMode('login');
                    setLoginEmail(successInfo.email);
                  }}
                  className="primary-btn"
                  style={{ marginTop: 14, width: '100%' }}
                >
                  Proceed to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister}>
                <div style={{ display: 'grid', gap: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#31483f' }}>
                    Full Name
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Sethi"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #d4dfd9', fontSize: 12, marginTop: 4 }}
                    />
                  </label>

                  <label style={{ fontSize: 11, fontWeight: 700, color: '#31483f' }}>
                    Email Address
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vikram.expert@quickserve.com"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #d4dfd9', fontSize: 12, marginTop: 4 }}
                    />
                  </label>

                  <label style={{ fontSize: 11, fontWeight: 700, color: '#31483f' }}>
                    Phone Number (India +91)
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #d4dfd9', fontSize: 12, marginTop: 4 }}
                    />
                    <small style={{ fontSize: 9, color: '#7a8c84' }}>10 digits prefixed with +91</small>
                  </label>

                  <label style={{ fontSize: 11, fontWeight: 700, color: '#31483f' }}>
                    Skills & Services Handled
                    <select
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #d4dfd9', fontSize: 12, marginTop: 4, background: '#fff' }}
                    >
                      <option value="Home cleaning, Sofa cleaning">Home cleaning & Housekeeping</option>
                      <option value="AC service, Appliance repair">AC service & Climate care</option>
                      <option value="TV installation, Tech at home">TV & Home electronics installation</option>
                      <option value="Electrician visit, Wiring repair">Electrical repair & wiring</option>
                      <option value="Plumber visit, Leakage fix">Plumbing & Blockage clearing</option>
                      <option value="Carpenter visit, Furniture assembly">Carpentry & Lock repairs</option>
                    </select>
                  </label>

                  <label style={{ fontSize: 11, fontWeight: 700, color: '#31483f' }}>
                    Password
                    <input
                      required
                      type="password"
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create secure password"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #d4dfd9', fontSize: 12, marginTop: 4 }}
                    />
                  </label>

                  {error && (
                    <div style={{ background: '#ffeded', color: '#a83232', padding: 10, borderRadius: 6, fontSize: 11, display: 'flex', gap: 6 }}>
                      <AlertCircle size={15} style={{ flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button className="primary-btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                    {loading ? 'Submitting…' : 'Register Profile for Verification'} <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Login Box */}
          <div style={{ background: '#fff', border: '1px solid #e1e7e2', borderRadius: 12, padding: 28, boxShadow: '0 8px 30px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e5f3eb', color: 'var(--green)', display: 'grid', placeItems: 'center' }}>
                <Lock size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>
                  Employee Sign In
                </h3>
                <small style={{ color: '#7a8c84' }}>Access your service requests queue</small>
              </div>
            </div>

            <form onSubmit={handleLogin}>
              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#31483f' }}>
                  Registered Employee Email
                  <input
                    required
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="rohan.expert@quickserve.com"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #d4dfd9', fontSize: 12, marginTop: 4 }}
                  />
                </label>

                <label style={{ fontSize: 11, fontWeight: 700, color: '#31483f' }}>
                  Password
                  <input
                    required
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #d4dfd9', fontSize: 12, marginTop: 4 }}
                  />
                </label>

                {error && (
                  <div style={{ background: '#ffeded', color: '#a83232', padding: 10, borderRadius: 6, fontSize: 11, display: 'flex', gap: 6 }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <button className="primary-btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                  {loading ? 'Checking verification…' : 'Sign in as Professional'} <ArrowRight size={15} />
                </button>
              </div>
            </form>

            <div style={{ marginTop: 24, padding: 14, background: '#f5f7f5', borderRadius: 8, fontSize: 11, color: '#556660' }}>
              <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)' }}>
                <ShieldCheck size={14} /> Quick Demo Access:
              </div>
              <div>
                Try verified employee: <strong>rohan.expert@quickserve.com</strong>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('rohan.expert@quickserve.com');
                    setLoginPassword('Rohan@Expert2026');
                  }}
                  style={{ display: 'block', marginTop: 4, color: 'var(--green)', border: 0, background: 'transparent', padding: 0, textDecoration: 'underline', cursor: 'pointer', fontSize: 11 }}
                >
                  Click to prefill verified employee account
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : !isVerified ? (
        /* Account Pending Verification Notice */
        <div style={{ background: '#fff', border: '1px solid #f1dfc5', borderRadius: 12, padding: 36, textAlign: 'center', maxWidth: 640, margin: '20px auto' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff3df', color: '#b45309', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontSize: 24 }}>
            🔒
          </div>
          <h2 style={{ margin: '0 0 10px', fontSize: 24, fontFamily: 'Manrope, sans-serif', color: 'var(--ink)' }}>
            Admin Verification Required
          </h2>
          <p style={{ fontSize: 13, color: '#6d7c84', lineHeight: 1.6, margin: '0 0 16px' }}>
            Hello <strong>{currentEmployee.name}</strong>, your employee registration ({currentEmployee.phone}) has been recorded in our SQL database. However, your account status is currently:
          </p>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: '#fff3df', color: '#92400e', fontWeight: 800, fontSize: 12, marginBottom: 20 }}>
            ● PENDING ADMIN APPROVAL
          </div>
          <p style={{ fontSize: 12, color: '#52665e', lineHeight: 1.6, background: '#f8faf8', padding: 14, borderRadius: 8, border: '1px solid #e2ece6' }}>
            As per QuickServe quality standards, customers' requested services can only be viewed once your credentials have been verified by an administrator in the <strong>Admin Page (/admin)</strong>.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
            <button
              type="button"
              onClick={refreshUserData}
              className="primary-btn"
            >
              Refresh Verification Status
            </button>
            <button
              type="button"
              onClick={logout}
              style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #d4dfd9', background: '#fff', color: '#556660', fontSize: 12, fontWeight: 600 }}
            >
              Log Out
            </button>
          </div>
        </div>
      ) : (
        /* Verified Employee Dashboard */
        <div>
          {/* Employee Badge Bar */}
          <div
            style={{
              background: 'linear-gradient(135deg, #102d26 0%, #1a483e 100%)',
              color: '#fff',
              padding: '20px 24px',
              borderRadius: 12,
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontFamily: 'Manrope, sans-serif', color: '#fff' }}>
                  {currentEmployee.name}
                </h2>
                <span style={{ background: '#79d9ae', color: '#0f3227', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 100 }}>
                  VERIFIED PRO ✓
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#c5ded5', marginTop: 4 }}>
                Specialization: <strong>{currentEmployee.skills}</strong> · Mobile: <strong>{currentEmployee.phone}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <small style={{ fontSize: 9, color: '#a6cec2', display: 'block' }}>RATING</small>
                <strong style={{ fontSize: 18, color: '#ffcf56' }}>★ {currentEmployee.rating}</strong>
              </div>
              <div>
                <small style={{ fontSize: 9, color: '#a6cec2', display: 'block' }}>JOBS COMPLETED</small>
                <strong style={{ fontSize: 18 }}>{currentEmployee.completedJobs}</strong>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e1e7e2', paddingBottom: 12, marginBottom: 20 }}>
            <button
              onClick={() => setActiveTab('available')}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: 0,
                background: activeTab === 'available' ? 'var(--green)' : '#f0f4f1',
                color: activeTab === 'available' ? '#fff' : '#4a5d56',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Requested Services by Users ({availableBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: 0,
                background: activeTab === 'assigned' ? 'var(--green)' : '#f0f4f1',
                color: activeTab === 'assigned' ? '#fff' : '#4a5d56',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              My Active Tasks ({myAssignedBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: 0,
                background: activeTab === 'completed' ? 'var(--green)' : '#f0f4f1',
                color: activeTab === 'completed' ? '#fff' : '#4a5d56',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Completed Jobs ({myCompletedBookings.length})
            </button>
          </div>

          {/* Tab 1: Available Customer Service Requests */}
          {activeTab === 'available' && (
            <div>
              {availableBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', border: '1px dashed #dce3d9', borderRadius: 12 }}>
                  <Sparkles size={32} color="var(--green)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ margin: '0 0 6px', fontSize: 18, color: 'var(--green)' }}>All Caught Up!</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#7a8a80' }}>
                    There are no unassigned service requests right now. New customer bookings will appear here instantly.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {availableBookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e1e7e2',
                        borderRadius: 12,
                        padding: '18px 22px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 16,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: '#eaf4ee', color: 'var(--green-dark)' }}>
                            TICKET {b.ticketId}
                          </span>
                          <span style={{ fontSize: 11, color: '#889891' }}>
                            Requested {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <h3 style={{ margin: '4px 0 6px', fontSize: 17, fontFamily: 'Manrope, sans-serif', color: 'var(--ink)' }}>
                          {b.mainServiceName}
                        </h3>

                        <div style={{ fontSize: 12, color: '#44554e', marginBottom: 6 }}>
                          <strong>Sub-services:</strong> {b.items.map((i) => `${i.name} (${formatPrice(i.price)})`).join(', ')}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 11, color: '#6d7c84' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={13} /> {b.scheduledDate} · {b.scheduledTime}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={13} /> {b.address}, {b.area} ({b.pincode})
                          </span>
                          {b.customerPhone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Phone size={13} /> {b.customerPhone}
                            </span>
                          )}
                        </div>

                        {b.notes && (
                          <div style={{ marginTop: 8, fontSize: 11, color: '#7a8c84', fontStyle: 'italic' }}>
                            Customer notes: "{b.notes}"
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                        <div>
                          <small style={{ fontSize: 9, color: '#889891', display: 'block' }}>ESTIMATED PAYOUT</small>
                          <strong style={{ fontSize: 20, color: 'var(--green)', fontFamily: 'Manrope, sans-serif' }}>
                            {formatPrice(b.total)}
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => handleAcceptJob(b.id)}
                          style={{ padding: '9px 18px', fontSize: 12 }}
                        >
                          Accept Service Request <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: My Assigned Tasks */}
          {activeTab === 'assigned' && (
            <div>
              {myAssignedBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', border: '1px dashed #dce3d9', borderRadius: 12 }}>
                  <Briefcase size={32} color="#8a9a90" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ margin: '0 0 6px', fontSize: 18, color: 'var(--ink)' }}>No Active Jobs</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#7a8a80' }}>
                    You have no jobs in progress. Check the "Requested Services" tab to accept available user bookings.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {myAssignedBookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #9ed5ba',
                        borderRadius: 12,
                        padding: '18px 22px',
                        boxShadow: '0 6px 20px rgba(29,139,103,.06)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: '#eaf4ee', color: 'var(--green)' }}>
                              TICKET {b.ticketId}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: b.status === 'in_progress' ? '#fff3df' : '#e0f2fe', color: b.status === 'in_progress' ? '#9a5e18' : '#0369a1' }}>
                              STATUS: {b.status.toUpperCase().replace('_', ' ')}
                            </span>
                          </div>

                          <h3 style={{ margin: '8px 0 4px', fontSize: 18, fontFamily: 'Manrope, sans-serif' }}>
                            {b.mainServiceName}
                          </h3>
                          <div style={{ fontSize: 12, color: '#44554e', marginBottom: 8 }}>
                            {b.items.map((i) => i.name).join(' + ')}
                          </div>

                          <div style={{ fontSize: 11, color: '#556660', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span><strong>Customer:</strong> {b.customerName} ({b.customerPhone})</span>
                            <span><strong>Address:</strong> {b.address}, {b.area} - {b.pincode}</span>
                            <span><strong>Slot:</strong> {b.scheduledDate} at {b.scheduledTime}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                          <strong style={{ fontSize: 18, color: 'var(--green)' }}>{formatPrice(b.total)}</strong>

                          {b.status === 'assigned' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b.id, 'in_progress')}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 6,
                                background: '#f59e0b',
                                color: '#fff',
                                border: 0,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Start Service (In Progress)
                            </button>
                          )}

                          {b.status === 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b.id, 'completed')}
                              className="primary-btn"
                              style={{ padding: '8px 14px', fontSize: 11 }}
                            >
                              Mark as Completed ✓
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Completed Jobs */}
          {activeTab === 'completed' && (
            <div>
              {myCompletedBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', border: '1px dashed #dce3d9', borderRadius: 12 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#7a8a80' }}>No completed services yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {myCompletedBookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e1e7e2',
                        borderRadius: 10,
                        padding: '14px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong>{b.mainServiceName}</strong> - {b.items.map((i) => i.name).join(', ')}
                        <small style={{ display: 'block', color: '#7a8c84', fontSize: 10, marginTop: 4 }}>
                          Completed on {b.scheduledDate} for {b.customerName} ({b.area})
                        </small>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: 'var(--green)', fontSize: 14 }}>{formatPrice(b.total)}</strong>
                        <span style={{ display: 'block', fontSize: 9, color: '#16a34a' }}>PAID ✓</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
