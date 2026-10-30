import React, { createContext, useContext, useEffect, useState } from 'react';
import { Employee, User, UserRole } from '../types';
import { sqlDb } from '../db/sqlDatabase';

interface AuthContextType {
  user: User | null;
  employeeProfile: Employee | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isCustomer: boolean;
  login: (email: string, password?: string, intendedRole?: UserRole) => Promise<{ success: boolean; message?: string }>;
  registerCustomer: (name: string, email: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  registerEmployee: (data: {
    name: string;
    email: string;
    phone: string;
    skills: string;
    experienceYears?: number;
    password?: string;
  }) => Promise<{ success: boolean; message?: string; employee?: Employee }>;
  logout: () => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'quickserve_auth_session_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [employeeProfile, setEmployeeProfile] = useState<Employee | null>(null);

  const refreshUserData = () => {
    if (!user) {
      setEmployeeProfile(null);
      return;
    }
    const freshUser = sqlDb.getUserByEmail(user.email);
    if (freshUser) {
      setUser(freshUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshUser));
    }
    if (user.role === 'employee' || freshUser?.role === 'employee') {
      const emp = sqlDb.getEmployeeByEmail(user.email);
      setEmployeeProfile(emp || null);
    } else {
      setEmployeeProfile(null);
    }
  };

  useEffect(() => {
    refreshUserData();
    const unsubscribe = sqlDb.subscribe(() => {
      refreshUserData();
    });
    return unsubscribe;
  }, [user?.email]);

  const login = async (
    email: string,
    _password?: string,
    intendedRole?: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists in SQL database
    let existingUser = sqlDb.getUserByEmail(cleanEmail);

    // If attempting Admin login
    if (intendedRole === 'admin' || cleanEmail.includes('admin@')) {
      if (!existingUser) {
        existingUser = sqlDb.registerUser('QuickServe Admin', cleanEmail, 'admin', '+91 98765 00001');
      } else if (existingUser.role !== 'admin') {
        return { success: false, message: 'This account does not have Admin privileges.' };
      }
      setUser(existingUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(existingUser));
      return { success: true, message: 'Signed in as Administrator.' };
    }

    // If attempting Employee login
    if (intendedRole === 'employee' || existingUser?.role === 'employee') {
      const emp = sqlDb.getEmployeeByEmail(cleanEmail);
      if (!emp) {
        return {
          success: false,
          message: 'No registered employee found with this email. Please register as an employee first.',
        };
      }

      // Check if employee is verified by admin
      if (emp.status === 'pending_verification') {
        return {
          success: false,
          message:
            'Your employee account is pending Admin Verification. Once an admin approves your profile in the Admin Portal (/admin), you will gain access to active customer service requests.',
        };
      }

      if (emp.status === 'rejected') {
        return {
          success: false,
          message: 'Your employee application was rejected. Please contact support.',
        };
      }

      if (!existingUser) {
        existingUser = sqlDb.registerUser(emp.name, cleanEmail, 'employee', emp.phone);
      }
      setUser(existingUser);
      setEmployeeProfile(emp);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(existingUser));
      return { success: true, message: `Welcome back, ${emp.name}!` };
    }

    // Default Customer login
    if (!existingUser) {
      existingUser = sqlDb.registerUser(cleanEmail.split('@')[0], cleanEmail, 'customer');
    }
    setUser(existingUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(existingUser));
    return { success: true, message: `Welcome back, ${existingUser.name}!` };
  };

  const registerCustomer = async (
    name: string,
    email: string,
    phone?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    const newUser = sqlDb.registerUser(name, cleanEmail, 'customer', phone);
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    return { success: true, message: 'Account created successfully!' };
  };

  const registerEmployee = async (data: {
    name: string;
    email: string;
    phone: string;
    skills: string;
    experienceYears?: number;
    password?: string;
  }): Promise<{ success: boolean; message?: string; employee?: Employee }> => {
    const cleanEmail = data.email.toLowerCase().trim();

    // Check if already registered
    const existingEmp = sqlDb.getEmployeeByEmail(cleanEmail);
    if (existingEmp) {
      return {
        success: false,
        message: 'An employee with this email already exists.',
      };
    }

    const { employee } = sqlDb.registerEmployee({
      name: data.name,
      email: cleanEmail,
      phone: data.phone,
      skills: data.skills,
      experienceYears: data.experienceYears || 1,
    });

    setEmployeeProfile(employee);

    return {
      success: true,
      employee,
      message:
        'Registration submitted successfully! Your credentials and Employee ID have been created. An administrator must verify your account before you can view and accept customer requests.',
    };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setEmployeeProfile(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';
  const isCustomer = user?.role === 'customer' || (!isAdmin && !isEmployee);

  return (
    <AuthContext.Provider
      value={{
        user,
        employeeProfile,
        isAuthenticated,
        isAdmin,
        isEmployee,
        isCustomer,
        login,
        registerCustomer,
        registerEmployee,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
