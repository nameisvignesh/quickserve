export type UserRole = 'customer' | 'employee' | 'admin';

export type EmployeeStatus = 'pending_verification' | 'verified' | 'rejected';

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'demo_paid' | 'failed' | 'refunded';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  verified?: boolean;
  createdAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string; // Indian phone number (+91 ...)
  skills: string; // e.g. "Cleaning, AC Repair"
  experienceYears?: number;
  status: EmployeeStatus;
  rating: number;
  completedJobs: number;
  createdAt: string;
}

export interface SubService {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: string;
  includes: string[];
  popular?: boolean;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  badge?: string;
  startingPrice: number;
  rating: number;
  reviewCount: number;
  durationRange: string;
  artClass: string;
  subServices?: SubService[];
}

export interface BookingItem {
  id: string;
  bookingId: string;
  subServiceId: string;
  name: string;
  price: number;
  duration: string;
}

export interface Booking {
  id: string;
  ticketId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  mainServiceName: string;
  items: BookingItem[];
  address: string;
  area: string;
  pincode: string;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  createdAt: string;
}
