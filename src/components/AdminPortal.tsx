import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sqlDb } from '../db/sqlDatabase';
import { Booking, Employee } from '../types';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Database,
  Calendar,
  IndianRupee,
  Lock,
  ArrowRight,
  LogOut,
  Search,
  Wrench,
  Clock,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';

interface AdminPortalProps {
  onShowToast: (msg: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onShowToast }) => {
  const { user, isAdmin, login, logout, refreshUserData } = useAuth();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'verification' | 'bookings' | 'services' | 'sql'>('verification');
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM employees;');
  const [sqlResult, setSqlResult] = useState<any>(null);

  // Live database records
  const employees = sqlDb.getEmployees();
  const bookings = sqlDb.getBookings();
  const services = sqlDb.getServices();
  const sqlHistory = sqlDb.getSqlHistory();

  const pendingEmployees = employees.filter((e) => e.status === 'pending_verification');
  const verifiedEmployees = employees.filter((e) => e.status === 'verified');

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.total : 0), 0);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const res = await login(adminEmail, adminPassword, 'admin');
      if (!res.success) {
        setAuthError(res.message || 'Invalid administrator credentials.');
      } else {
        onShowToast('Welcome to QuickServe Admin Control Center.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmployee = (employeeId: string, status: 'verified' | 'rejected') => {
    sqlDb.verifyEmployee(employeeId, status);
    onShowToast(`Employee ${status === 'verified' ? 'verified & approved' : 'rejected'}.`);
    refreshUserData();
  };

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    sqlDb.updateBookingStatus(bookingId, newStatus);
    onShowToast(`Booking status updated to ${newStatus}.`);
    refreshUserData();
  };

  const handleAssignEmployee = (bookingId: string, empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      sqlDb.assignBooking(bookingId, emp.id, emp.name);
      onShowToast(`Assigned booking to ${emp.name}.`);
      refreshUserData();
    }
  };

  const handleExecuteSql = () => {
    try {
      const result = sqlDb.query(sqlQuery);
      setSqlResult(result);
      onShowToast('SQL statement executed.');
    } catch (e: any) {
      setAuthError(e?.message || 'SQL syntax error');
    }
  };

  // If not logged in as Admin, show login form
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 440, margin: '60px auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', border: '1px solid #e1e7e2', borderRadius: 16, padding: '36px 32px', boxShadow: '0 12px 40px rgba(0,0,0,.06)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#102d26', color: '#ffcf56', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
            <ShieldCheck size={24} />
          </div>

          <h2 style={{ margin: '0 0 6px', fontSize: 24, fontFamily: 'Manrope, sans-serif', color: 'var(--ink)' }}>
            Admin Access Portal
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: 12, color: '#6d7c84' }}>
            Administrative console for employee verification, bookings dispatch, and SQL database management.
          </p>

          <form onSubmit={handleAdminLogin}>
            <div style={{ display: 'grid', gap: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#31483f' }}>
                Admin Email
                <input
                  required
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@quickserve.com"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d4dfd9', fontSize: 12, marginTop: 4 }}
                />
              </label>

              <label style={{ fontSize: 11, fontWeight: 700, color: '#31483f' }}>
                Password
                <input
                  required
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d4dfd9', fontSize: 12, marginTop: 4 }}
                />
              </label>

              {authError && (
                <div style={{ background: '#ffeded', color: '#a83232', padding: 10, borderRadius: 6, fontSize: 11, display: 'flex', gap: 6 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <button className="primary-btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                {loading ? 'Authenticating…' : 'Enter Admin Console'} <ArrowRight size={15} />
              </button>
            </div>
          </form>

          <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #f0f3ee', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setAdminEmail('admin@quickserve.com');
                setAdminPassword('Admin@QuickServe2026!');
              }}
              style={{
                fontSize: 11,
                color: 'var(--green)',
                background: 'transparent',
                border: 0,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Fill standard admin credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--green)' }}>
            <ShieldCheck size={14} /> Operations & Dispatch Console (/admin)
          </div>
          <h1 style={{ margin: '8px 0 4px', fontSize: 'clamp(26px, 3.5vw, 34px)', fontFamily: 'Manrope, sans-serif' }}>
            QuickServe Administration
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: '#6d7c84' }}>
            Verify service professionals, manage customer booking tickets, and inspect the Relational SQL engine.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#556660' }}>Signed in as <strong>{user?.name || 'Administrator'}</strong></span>
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
            <LogOut size={13} /> Exit Admin
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#fff', border: '1px solid #e1e7e2', borderRadius: 10, padding: '16px 20px' }}>
          <small style={{ fontSize: 10, fontWeight: 700, color: '#889891', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            PENDING VERIFICATION
          </small>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 }}>
            <strong style={{ fontSize: 26, fontFamily: 'Manrope, sans-serif', color: pendingEmployees.length > 0 ? '#d97706' : 'var(--green)' }}>
              {pendingEmployees.length}
            </strong>
            <span style={{ fontSize: 11, color: '#889891' }}>Employees</span>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e1e7e2', borderRadius: 10, padding: '16px 20px' }}>
          <small style={{ fontSize: 10, fontWeight: 700, color: '#889891', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            VERIFIED EXPERTS
          </small>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 }}>
            <strong style={{ fontSize: 26, fontFamily: 'Manrope, sans-serif', color: 'var(--green)' }}>
              {verifiedEmployees.length}
            </strong>
            <span style={{ fontSize: 11, color: '#889891' }}>Active</span>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e1e7e2', borderRadius: 10, padding: '16px 20px' }}>
          <small style={{ fontSize: 10, fontWeight: 700, color: '#889891', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            TOTAL BOOKINGS
          </small>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 }}>
            <strong style={{ fontSize: 26, fontFamily: 'Manrope, sans-serif', color: 'var(--ink)' }}>
              {bookings.length}
            </strong>
            <span style={{ fontSize: 11, color: '#889891' }}>Tickets</span>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e1e7e2', borderRadius: 10, padding: '16px 20px' }}>
          <small style={{ fontSize: 10, fontWeight: 700, color: '#889891', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            GROSS REVENUE
          </small>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 }}>
            <strong style={{ fontSize: 26, fontFamily: 'Manrope, sans-serif', color: 'var(--green)' }}>
              {formatPrice(totalRevenue)}
            </strong>
            <span style={{ fontSize: 11, color: '#889891' }}>INR</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e1e7e2', paddingBottom: 12, marginBottom: 24, overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('verification')}
          style={{
            padding: '9px 16px',
            borderRadius: 6,
            border: 0,
            background: activeTab === 'verification' ? 'var(--green)' : '#f0f4f1',
            color: activeTab === 'verification' ? '#fff' : '#4a5d56',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Users size={14} /> Employee Verification Queue ({pendingEmployees.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '9px 16px',
            borderRadius: 6,
            border: 0,
            background: activeTab === 'bookings' ? 'var(--green)' : '#f0f4f1',
            color: activeTab === 'bookings' ? '#fff' : '#4a5d56',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Calendar size={14} /> Bookings & Dispatch ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('services')}
          style={{
            padding: '9px 16px',
            borderRadius: 6,
            border: 0,
            background: activeTab === 'services' ? 'var(--green)' : '#f0f4f1',
            color: activeTab === 'services' ? '#fff' : '#4a5d56',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Wrench size={14} /> Services Catalog ({services.length})
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          style={{
            padding: '9px 16px',
            borderRadius: 6,
            border: 0,
            background: activeTab === 'sql' ? 'var(--green)' : '#f0f4f1',
            color: activeTab === 'sql' ? '#fff' : '#4a5d56',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Database size={14} /> SQL Database Console
        </button>
      </div>

      {/* TAB 1: EMPLOYEE VERIFICATION */}
      {activeTab === 'verification' && (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'Manrope, sans-serif' }}>
              Service Professionals Verification
            </h3>
            <span style={{ fontSize: 12, color: '#6d7c84' }}>
              Unverified employees cannot see user requests until approved here.
            </span>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {employees.map((emp) => (
              <div
                key={emp.id}
                style={{
                  background: '#fff',
                  border: emp.status === 'pending_verification' ? '2px solid #f59e0b' : '1px solid #e1e7e2',
                  borderRadius: 12,
                  padding: '18px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h4 style={{ margin: 0, fontSize: 17, fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>
                      {emp.name}
                    </h4>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 100,
                        background:
                          emp.status === 'verified'
                            ? '#e2f5ec'
                            : emp.status === 'rejected'
                            ? '#fef2f2'
                            : '#fffbeb',
                        color:
                          emp.status === 'verified'
                            ? '#166534'
                            : emp.status === 'rejected'
                            ? '#991b1b'
                            : '#92400e',
                      }}
                    >
                      {emp.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#556660', marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    <span>Email: <strong>{emp.email}</strong></span>
                    <span>Phone: <strong>{emp.phone}</strong> (India)</span>
                    <span>Skills: <strong>{emp.skills}</strong></span>
                    <span>Experience: <strong>{emp.experienceYears} yrs</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  {emp.status === 'pending_verification' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleVerifyEmployee(emp.id, 'verified')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          borderRadius: 6,
                          background: 'var(--green)',
                          color: '#fff',
                          border: 0,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Check size={14} /> Verify & Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerifyEmployee(emp.id, 'rejected')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          borderRadius: 6,
                          background: '#fff',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  ) : emp.status === 'verified' ? (
                    <span style={{ fontSize: 12, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                      <CheckCircle2 size={16} /> Verified Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleVerifyEmployee(emp.id, 'verified')}
                      style={{ padding: '6px 12px', fontSize: 11, borderRadius: 4, border: '1px solid #d4dfd9', background: '#fff' }}
                    >
                      Re-approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS & DISPATCH */}
      {activeTab === 'bookings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'Manrope, sans-serif' }}>Customer Service Requests</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingFilter(st)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    border: bookingFilter === st ? '1px solid var(--green)' : '1px solid #d4dfd9',
                    background: bookingFilter === st ? 'var(--green)' : '#fff',
                    color: bookingFilter === st ? '#fff' : '#556660',
                    cursor: 'pointer',
                  }}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e1e7e2',
                  borderRadius: 12,
                  padding: '18px 22px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: '#eaf4ee', color: 'var(--green)' }}>
                        TICKET: {b.ticketId}
                      </span>
                      <span style={{ fontSize: 11, color: '#889891' }}>
                        {b.scheduledDate} · {b.scheduledTime}
                      </span>
                    </div>

                    <h4 style={{ margin: '4px 0 6px', fontSize: 17, fontFamily: 'Manrope, sans-serif' }}>
                      {b.mainServiceName}
                    </h4>

                    <div style={{ fontSize: 12, color: '#44554e', marginBottom: 6 }}>
                      {b.items.map((i) => i.name).join(' · ')}
                    </div>

                    <div style={{ fontSize: 11, color: '#6d7c84', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span><strong>Customer:</strong> {b.customerName} ({b.customerEmail} / {b.customerPhone})</span>
                      <span><strong>Address:</strong> {b.address}, {b.area} - {b.pincode}</span>
                      {b.notes && <span><strong>Notes:</strong> {b.notes}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <strong style={{ fontSize: 20, color: 'var(--green)', fontFamily: 'Manrope, sans-serif' }}>
                      {formatPrice(b.total)}
                    </strong>

                    {/* Status Changer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                      <span style={{ color: '#7a8c84' }}>Status:</span>
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value as any)}
                        style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d4dfd9', fontSize: 11, background: '#fff' }}
                      >
                        <option value="pending_payment">Pending Payment</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Assign Employee Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                      <span style={{ color: '#7a8c84' }}>Assigned Pro:</span>
                      <select
                        value={b.assignedEmployeeId || ''}
                        onChange={(e) => handleAssignEmployee(b.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d4dfd9', fontSize: 11, background: '#fff' }}
                      >
                        <option value="">Unassigned</option>
                        {verifiedEmployees.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name} ({e.skills.split(',')[0]})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SERVICES CATALOG */}
      {activeTab === 'services' && (
        <div style={{ display: 'grid', gap: 16 }}>
          {services.map((srv) => (
            <div key={srv.id} style={{ background: '#fff', border: '1px solid #e1e7e2', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 17, fontFamily: 'Manrope, sans-serif' }}>
                    {srv.icon} {srv.name} ({srv.category})
                  </h4>
                  <small style={{ color: '#7a8c84' }}>{srv.description}</small>
                </div>
                <strong style={{ color: 'var(--green)', fontSize: 16 }}>Starting from {formatPrice(srv.startingPrice)}</strong>
              </div>

              <div style={{ background: '#f8faf8', borderRadius: 8, padding: 12, border: '1px solid #e7efe9' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-dark)', display: 'block', marginBottom: 8 }}>
                  Nested Sub-Services Inside ({srv.subServices?.length || 0}):
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
                  {srv.subServices?.map((sub) => (
                    <div key={sub.id} style={{ background: '#fff', padding: '8px 12px', borderRadius: 6, border: '1px solid #dce5df', fontSize: 11 }}>
                      <strong>{sub.name}</strong> - <span style={{ color: 'var(--green)' }}>{formatPrice(sub.price)}</span>
                      <small style={{ display: 'block', color: '#7a8c84' }}>{sub.duration}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SQL DATABASE ENGINE INSPECTOR */}
      {activeTab === 'sql' && (
        <div style={{ background: '#fff', border: '1px solid #e1e7e2', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Database size={20} color="var(--green)" />
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'Manrope, sans-serif' }}>
                Relational SQL Engine (SQLite Dialect)
              </h3>
              <small style={{ color: '#7a8c84' }}>Zero MongoDB dependency. Pure relational SQL schema with foreign keys.</small>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="SELECT * FROM bookings;"
              style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: 12,
                padding: '10px 14px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#0f172a',
                color: '#38bdf8',
              }}
            />
            <button className="primary-btn" type="button" onClick={handleExecuteSql}>
              Execute SQL
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['SELECT * FROM employees;', 'SELECT * FROM bookings;', 'SELECT * FROM services;', 'SELECT * FROM sub_services;'].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setSqlQuery(q);
                  const res = sqlDb.query(q);
                  setSqlResult(res);
                }}
                style={{ padding: '4px 10px', fontSize: 10, borderRadius: 4, border: '1px solid #cbd5e1', background: '#f8fafc', fontFamily: 'monospace' }}
              >
                {q}
              </button>
            ))}
          </div>

          {sqlResult && (
            <div style={{ overflowX: 'auto', maxHeight: 300, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, textAlign: 'left' }}>
                <thead style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
                  <tr>
                    {sqlResult.columns.map((c: string) => (
                      <th key={c} style={{ padding: '8px 12px', borderBottom: '1px solid #cbd5e1' }}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sqlResult.rows.map((row: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {sqlResult.columns.map((c: string) => (
                        <td key={c} style={{ padding: '8px 12px' }}>
                          {typeof row[c] === 'object' ? JSON.stringify(row[c]) : String(row[c] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>
              RECENT SQL EXECUTION LOG:
            </span>
            <div style={{ background: '#0f172a', color: '#a5f3fc', padding: 14, borderRadius: 8, fontFamily: 'monospace', fontSize: 11, maxHeight: 150, overflowY: 'auto' }}>
              {sqlHistory.slice(0, 10).map((cmd, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span style={{ color: '#4ade80' }}>sql&gt;</span> {cmd}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
