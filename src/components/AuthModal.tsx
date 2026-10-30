import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { X, ShieldCheck, Sparkles, User, Briefcase, Lock, ArrowRight, AlertCircle, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'customer',
  defaultMode = 'login',
  onSuccess,
}) => {
  const { login, registerCustomer, registerEmployee } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [role, setRole] = useState<UserRole>(defaultRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [skills, setSkills] = useState('Home cleaning, AC service');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password, role);
        if (!res.success) {
          setError(res.message || 'Login failed.');
        } else {
          setSuccessMsg(res.message || 'Signed in successfully!');
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 800);
        }
      } else {
        // Registration
        if (role === 'employee') {
          // Indian phone validation check
          const cleanedPhone = phone.replace(/[\s-]/g, '');
          if (!cleanedPhone.startsWith('+91') || cleanedPhone.length < 13) {
            setError('Please enter a valid Indian phone number starting with +91 followed by 10 digits.');
            setLoading(false);
            return;
          }

          const res = await registerEmployee({
            name,
            email,
            phone,
            skills,
            password,
          });

          if (!res.success) {
            setError(res.message || 'Registration failed.');
          } else {
            setSuccessMsg(
              'Employee profile registered! Status: PENDING ADMIN VERIFICATION. An Admin at /admin must verify your profile before you can access customer requests.'
            );
          }
        } else {
          // Customer registration
          const res = await registerCustomer(name, email, phone);
          if (!res.success) {
            setError(res.message || 'Could not create account.');
          } else {
            setSuccessMsg('Account created successfully!');
            setTimeout(() => {
              onClose();
              if (onSuccess) onSuccess();
            }, 800);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoRole: UserRole) => {
    setError('');
    setSuccessMsg('');
    setRole(demoRole);
    setMode('login');
    if (demoRole === 'admin') {
      setEmail('admin@quickserve.com');
      setPassword('Admin@QuickServe2026!');
    } else if (demoRole === 'employee') {
      setEmail('rohan.expert@quickserve.com');
      setPassword('Rohan@Expert2026');
    } else {
      setEmail('ananya.pune@example.com');
      setPassword('Customer@2026');
    }
  };

  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>

        <div className="modal-brand">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>
            quick<span>serve</span>
          </span>
        </div>

        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p>
          {role === 'admin'
            ? 'Access QuickServe administrator control center.'
            : role === 'employee'
            ? 'Join the verified QuickServe service professionals network.'
            : 'Sign in to schedule, customize, and track your home services.'}
        </p>

        {/* Role Selector Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: '#f2f5f1', padding: 4, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => {
              setRole('customer');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 6,
              border: 0,
              background: role === 'customer' ? '#fff' : 'transparent',
              color: role === 'customer' ? 'var(--green)' : '#667770',
              boxShadow: role === 'customer' ? '0 2px 6px rgba(0,0,0,.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <User size={13} /> Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('employee');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 6,
              border: 0,
              background: role === 'employee' ? '#fff' : 'transparent',
              color: role === 'employee' ? 'var(--green)' : '#667770',
              boxShadow: role === 'employee' ? '0 2px 6px rgba(0,0,0,.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Briefcase size={13} /> Professional
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setMode('login');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 6,
              border: 0,
              background: role === 'admin' ? '#fff' : 'transparent',
              color: role === 'admin' ? 'var(--green)' : '#667770',
              boxShadow: role === 'admin' ? '0 2px 6px rgba(0,0,0,.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Lock size={13} /> Admin
          </button>
        </div>

        {/* Quick Demo Pre-fill helpers */}
        <div style={{ marginBottom: 14, fontSize: 10, color: '#778880', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>Demo prefill:</span>
          <button
            type="button"
            onClick={() => fillQuickDemo('customer')}
            style={{ padding: '3px 7px', fontSize: 10, borderRadius: 4, border: '1px solid #d4dfd9', background: '#fff' }}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('employee')}
            style={{ padding: '3px 7px', fontSize: 10, borderRadius: 4, border: '1px solid #d4dfd9', background: '#fff' }}
          >
            Verified Pro
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('admin')}
            style={{ padding: '3px 7px', fontSize: 10, borderRadius: 4, border: '1px solid #d4dfd9', background: '#fff' }}
          >
            Admin
          </button>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: '#e9f7ee',
              color: '#1d6e4a',
              fontSize: 11,
              marginBottom: 14,
              border: '1px solid #bce6cb',
            }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Full name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'employee' ? 'e.g. Vikram Sethi' : 'e.g. Ananya Kulkarni'}
              />
            </label>
          )}

          <label>
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </label>

          {(mode === 'register' || role === 'employee') && (
            <label>
              Indian Mobile Number (+91)
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  required={mode === 'register' && role === 'employee'}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <small style={{ fontSize: 9, color: '#7a8c84' }}>
                Required for SMS job alerts & customer coordination
              </small>
            </label>
          )}

          {mode === 'register' && role === 'employee' && (
            <label>
              Primary Skills & Specialization
              <input
                required
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. AC service, Electrician visit, Home cleaning"
              />
            </label>
          )}

          <label>
            Password
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button className="primary-btn full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? (
              'Processing…'
            ) : mode === 'login' ? (
              <>
                Sign in as {role === 'admin' ? 'Admin' : role === 'employee' ? 'Professional' : 'Customer'}{' '}
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                Register {role === 'employee' ? 'as Professional' : 'Account'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {role !== 'admin' && (
          <div className="switch-auth">
            {mode === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
                setSuccessMsg('');
              }}
            >
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </div>
        )}

        <div className="secure-note">
          <ShieldCheck size={14} /> Powered by Clerk authentication & Relational SQL database.
        </div>
      </div>
    </div>
  );
};
