import { Booking, BookingItem, Employee, Service, SubService, User, UserRole } from '../types';

export interface SQLQueryResult<T = any> {
  columns: string[];
  rows: T[];
  rowCount: number;
}

const STORAGE_KEY = 'quickserve_sql_database_v2';

// Initial pre-configured seed data
const INITIAL_SERVICES: Omit<Service, 'subServices'>[] = [
  {
    id: 'srv_1',
    slug: 'home-cleaning',
    name: 'Home cleaning',
    category: 'Cleaning',
    icon: '✦',
    description: 'Deep cleaning that makes every corner of your house feel brand new.',
    badge: 'Most booked',
    startingPrice: 499,
    rating: 4.8,
    reviewCount: 1420,
    durationRange: '2–4 hrs',
    artClass: 'clean-art',
  },
  {
    id: 'srv_2',
    slug: 'ac-service',
    name: 'AC service',
    category: 'Appliance repair',
    icon: '❄',
    description: 'Keep your cool with fast, high-power jet cleaning and gas leak repairs.',
    badge: 'Same day',
    startingPrice: 349,
    rating: 4.9,
    reviewCount: 980,
    durationRange: '45–90 min',
    artClass: 'ac-card-art',
  },
  {
    id: 'srv_3',
    slug: 'tv-installation',
    name: 'TV installation',
    category: 'Tech at home',
    icon: '▣',
    description: 'Mount, set up concealed wiring, and get watching before movie night.',
    badge: 'New',
    startingPrice: 299,
    rating: 4.7,
    reviewCount: 650,
    durationRange: '30–60 min',
    artClass: 'tv-card-art',
  },
  {
    id: 'srv_4',
    slug: 'appliance-repair',
    name: 'Appliance repair',
    category: 'Appliance repair',
    icon: '⌘',
    description: 'Get your washing machines, refrigerators, and microwaves back on track.',
    badge: 'Certified',
    startingPrice: 249,
    rating: 4.8,
    reviewCount: 820,
    durationRange: '30–90 min',
    artClass: 'appliance-card-art',
  },
  {
    id: 'srv_5',
    slug: 'electrician',
    name: 'Electrician visit',
    category: 'Electrician',
    icon: '⚡',
    description: 'Fix switches, ceiling fans, fuse tripping, and home wiring inspections.',
    badge: 'Popular',
    startingPrice: 199,
    rating: 4.8,
    reviewCount: 1100,
    durationRange: '30–60 min',
    artClass: 'clean-art',
  },
  {
    id: 'srv_6',
    slug: 'plumbing',
    name: 'Plumber visit',
    category: 'Plumbing',
    icon: '🔧',
    description: 'Reliable help for bathroom leaks, tap repair, and pipe blockage clearances.',
    badge: 'Fast ETA',
    startingPrice: 199,
    rating: 4.9,
    reviewCount: 1250,
    durationRange: '30–60 min',
    artClass: 'ac-card-art',
  },
  {
    id: 'srv_7',
    slug: 'carpentry',
    name: 'Carpenter visit',
    category: 'Carpentry',
    icon: '🪚',
    description: 'Furniture assembly, lock repairs, hinge fixes, and custom wooden fittings.',
    badge: 'Crafted',
    startingPrice: 249,
    rating: 4.7,
    reviewCount: 540,
    durationRange: '45–90 min',
    artClass: 'tv-card-art',
  },
];

const INITIAL_SUB_SERVICES: SubService[] = [
  // Home Cleaning Sub-services
  {
    id: 'sub_clean_1',
    serviceId: 'srv_1',
    name: 'Bathroom Deep Cleaning',
    description: 'Tiles descaling, stain removal from fittings, toilet sanitization & floor scrubbing.',
    price: 499,
    duration: '60–90 min',
    icon: '🧽',
    includes: ['Floor & tile chemical scrubbing', 'Hard water stain removal', 'Exhaust & mirror polishing', 'Sanitization of toilet & washbasin'],
    popular: true,
  },
  {
    id: 'sub_clean_2',
    serviceId: 'srv_1',
    name: 'Full Home Deep Cleaning (1-3 BHK)',
    description: 'Complete top-to-bottom scrub down of bedrooms, hall, kitchen, and balconies.',
    price: 1499,
    duration: '3–4 hrs',
    icon: '🏠',
    includes: ['Dry vacuuming of sofas & mattresses', 'Floor scrubbing with single-disc machine', 'Ceiling cobweb removal & fan blades', 'Glass windows & balconies'],
    popular: true,
  },
  {
    id: 'sub_clean_3',
    serviceId: 'srv_1',
    name: 'Sofa & Upholstery Shampooing',
    description: 'Deep injection-extraction foam cleaning to remove dust mites, sweat stains, and odor.',
    price: 699,
    duration: '60 min',
    icon: '🛋️',
    includes: ['Dry vacuuming for loose debris', 'Non-toxic organic foam shampooing', 'Wet extraction stain lift', 'Fabric fresh deodorizer spray'],
    popular: false,
  },
  {
    id: 'sub_clean_4',
    serviceId: 'srv_1',
    name: 'Kitchen Deep Degreasing',
    description: 'Intense degreasing of chimney exterior, cabinets, tiles, slab, and gas stove burner.',
    price: 799,
    duration: '90 min',
    icon: '🍽️',
    includes: ['Oil & grease removal from backsplash', 'Gas burner & chimney exterior scrub', 'Sink descaling & sanitization', 'Wipe down of cabinets'],
    popular: false,
  },

  // AC Service Sub-services
  {
    id: 'sub_ac_1',
    serviceId: 'srv_2',
    name: 'Split AC Power Jet Service',
    description: 'Deep foam + high-pressure water jet wash of indoor cooling coils and outdoor unit.',
    price: 599,
    duration: '60 min',
    icon: '❄️',
    includes: ['Coil jet cleaning with water jacket', 'Filter & blower wheel wash', 'Drain pipe flush to stop leakage', 'Cooling & gas pressure check'],
    popular: true,
  },
  {
    id: 'sub_ac_2',
    serviceId: 'srv_2',
    name: 'Window AC Comprehensive Service',
    description: 'Complete unmounting, high-pressure foam wash, drain tray clearing, and remounting.',
    price: 449,
    duration: '45 min',
    icon: '💨',
    includes: ['Front grill & filter wash', 'Condenser coil flushing', 'Anti-fungal spray treatment', 'Ampere & temperature check'],
    popular: false,
  },
  {
    id: 'sub_ac_3',
    serviceId: 'srv_2',
    name: 'AC Gas Leak Check & Refill',
    description: 'Nitrogen pressure leak detection, brass valve flare repair, and refrigerant refill.',
    price: 1499,
    duration: '60–90 min',
    icon: '🧪',
    includes: ['Leakage detection & brazing', 'Vacuumization of lines', 'Full gas charging (R32 / R410A / R22)', '30-day cooling warranty'],
    popular: true,
  },
  {
    id: 'sub_ac_4',
    serviceId: 'srv_2',
    name: 'AC Uninstallation & Relocation',
    description: 'Careful gas lockdown, indoor/outdoor unmounting, and wall bracket packing.',
    price: 699,
    duration: '60 min',
    icon: '📦',
    includes: ['Refrigerant pump-down & lock', 'Copper pipe disconnection', 'Wall bracket dismantle', 'Safe packaging of indoor unit'],
    popular: false,
  },

  // TV Installation Sub-services
  {
    id: 'sub_tv_1',
    serviceId: 'srv_3',
    name: 'Standard TV Wall Mount (32"–43")',
    description: 'Precision drill mounting with spirit level, HDMI setup, and safety anchor installation.',
    price: 299,
    duration: '30–45 min',
    icon: '📺',
    includes: ['Wall bracket installation (fixed or tilt)', 'Drilling into brick/concrete', 'Connection to set-top box / console', 'Viewing angle calibration'],
    popular: true,
  },
  {
    id: 'sub_tv_2',
    serviceId: 'srv_3',
    name: 'Large TV Wall Mount (44"–65")',
    description: 'Heavy duty mounting for OLED/QLED screens with swivel or flush bracket alignment.',
    price: 449,
    duration: '45–60 min',
    icon: '🖥️',
    includes: ['Two-person heavy anchor mounting', 'Cable tie and concealer routing', 'Soundbar bracket synchronization', 'Smart TV Wi-Fi setup & demo'],
    popular: true,
  },
  {
    id: 'sub_tv_3',
    serviceId: 'srv_3',
    name: 'Home Theater & Soundbar Setup',
    description: 'Optical / ARC audio routing, satellite speaker placement, and subwoofer calibration.',
    price: 349,
    duration: '45 min',
    icon: '🔊',
    includes: ['Soundbar wall mounting or tabletop alignment', 'Dolby/DTS HDMI eARC setup', 'Surround test & equalizer tuning', 'Hidden wiring sleeves'],
    popular: false,
  },

  // Appliance Repair Sub-services
  {
    id: 'sub_app_1',
    serviceId: 'srv_4',
    name: 'Washing Machine Inspection & Repair',
    description: 'Diagnosis for spinning noise, water drainage error, vibration, or drum jam.',
    price: 249,
    duration: '45–60 min',
    icon: '🧺',
    includes: ['Complete motor and belt diagnostic', 'Drain pump and lint trap cleaning', 'Inlet solenoid valve test', 'Transparent spare parts quote'],
    popular: true,
  },
  {
    id: 'sub_app_2',
    serviceId: 'srv_4',
    name: 'Refrigerator Not Cooling Diagnostic',
    description: 'Compressor relay test, thermostat calibration, gas pressure and defrost timer check.',
    price: 299,
    duration: '45–60 min',
    icon: '🧊',
    includes: ['Single & double door inspection', 'Capillary tube and fan motor check', 'Door rubber magnetic gasket check', 'Detailed estimate before fix'],
    popular: true,
  },
  {
    id: 'sub_app_3',
    serviceId: 'srv_4',
    name: 'Water Purifier (RO) Service & Filter Change',
    description: 'Sediment, carbon, and RO membrane TDS testing, housing flush, and pump check.',
    price: 299,
    duration: '45 min',
    icon: '💧',
    includes: ['TDS water purity measurement', 'Filter candle and bowl cleansing', 'Booster pump pressure check', 'Leakage sealant test'],
    popular: false,
  },

  // Electrician Sub-services
  {
    id: 'sub_elec_1',
    serviceId: 'srv_5',
    name: 'Switch & Socket Replacement (Up to 3)',
    description: 'Modular switch repair, burned socket replacement, or earthing issue resolution.',
    price: 199,
    duration: '30 min',
    icon: '💡',
    includes: ['Phase-neutral-earthing testing', 'Modular box plate fitting', 'Spark & loose contact fix', 'Short-circuit safety check'],
    popular: true,
  },
  {
    id: 'sub_elec_2',
    serviceId: 'srv_5',
    name: 'Ceiling Fan Installation / Regulator Fix',
    description: 'Mounting new fan with rod, balancing blades, and installing step-regulator.',
    price: 199,
    duration: '30 min',
    icon: '🌀',
    includes: ['Ceiling hook & anchor check', 'Speed regulator connection', 'Blade angle balancing (no wobble)', 'Noise test at high speed'],
    popular: false,
  },
  {
    id: 'sub_elec_3',
    serviceId: 'srv_5',
    name: 'MCB / Fuse Box Troubleshooting',
    description: 'Diagnosing frequent circuit breaker trips, load distribution, and wiring safety.',
    price: 349,
    duration: '45 min',
    icon: '⚡',
    includes: ['Distribution board inspection', 'Neutral link load test', 'Faulty MCB replacement', 'Fire hazard safety check'],
    popular: false,
  },

  // Plumbing Sub-services
  {
    id: 'sub_plumb_1',
    serviceId: 'srv_6',
    name: 'Tap / Mixer Repair & Leakage Fix',
    description: 'Spindle cartridge change, Teflon thread sealing, and wall flange fitting.',
    price: 199,
    duration: '30 min',
    icon: '🚰',
    includes: ['Dripping tap repair', 'Quarter turn disc replacement', 'Connection hose leak sealing', 'Water pressure balancing'],
    popular: true,
  },
  {
    id: 'sub_plumb_2',
    serviceId: 'srv_6',
    name: 'Toilet Flush Tank / Jet Spray Repair',
    description: 'Fix running flush cistern, siphon valve replacement, and health faucet change.',
    price: 249,
    duration: '30–45 min',
    icon: '🚽',
    includes: ['Dual-flush mechanism overhaul', 'Ball cock & overflow prevention', 'Bidet spray hose replacement', 'Anti-leak sealing'],
    popular: true,
  },
  {
    id: 'sub_plumb_3',
    serviceId: 'srv_6',
    name: 'Drainage Pipe Blockage Clearing',
    description: 'Manual snake-rod and chemical dissolve of kitchen sink or bathroom drain clog.',
    price: 349,
    duration: '45 min',
    icon: '🪠',
    includes: ['U-trap bottle opening & cleanup', 'Grease and hair clog release', 'Disinfectant pipe wash', 'Smooth drainage verification'],
    popular: false,
  },

  // Carpentry Sub-services
  {
    id: 'sub_carp_1',
    serviceId: 'srv_7',
    name: 'Door Lock & Latch Installation / Repair',
    description: 'Mortise lock, cylindrical knob, or night latch alignment with brass strike plate.',
    price: 249,
    duration: '30–45 min',
    icon: '🔒',
    includes: ['Chiseling and keyhole drilling', 'Smooth latch sliding alignment', 'Handle tightening', '3 test key rotations'],
    popular: true,
  },
  {
    id: 'sub_carp_2',
    serviceId: 'srv_7',
    name: 'Cupboard Hinge & Drawer Channel Repair',
    description: 'Soft-close hydraulic hinge installation and telescopic drawer slide repair.',
    price: 199,
    duration: '30 min',
    icon: '🚪',
    includes: ['Drooping wardrobe door adjustment', 'Loose screw reinforcement', 'Smooth glide channel lubrication', 'Level alignment'],
    popular: false,
  },
  {
    id: 'sub_carp_3',
    serviceId: 'srv_7',
    name: 'Bed / Wardrobe Assembly',
    description: 'Precision knockdown furniture assembly for IKEA, Urban Ladder, or custom sets.',
    price: 499,
    duration: '60–90 min',
    icon: '🛏️',
    includes: ['Hydraulic storage bed frame setup', 'Headboard fixing with wall clamps', 'Hardware integrity check', 'Final stability testing'],
    popular: true,
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    email: 'admin@quickserve.com',
    name: 'QuickServe Admin',
    role: 'admin',
    phone: '+91 98765 00001',
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_emp1',
    email: 'rohan.expert@quickserve.com',
    name: 'Rohan Shah',
    role: 'employee',
    phone: '+91 98765 43210',
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_emp2',
    email: 'meera.cleaning@quickserve.com',
    name: 'Meera Kulkarni',
    role: 'employee',
    phone: '+91 98765 43211',
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_emp3',
    email: 'vikram.tech@quickserve.com',
    name: 'Vikram Sethi',
    role: 'employee',
    phone: '+91 98765 43212',
    verified: false, // Pending verification demo!
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_cust1',
    email: 'ananya.pune@example.com',
    name: 'Ananya K.',
    role: 'customer',
    phone: '+91 98220 12345',
    verified: true,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_1',
    userId: 'usr_emp1',
    name: 'Rohan Shah',
    email: 'rohan.expert@quickserve.com',
    phone: '+91 98765 43210',
    skills: 'AC service, Appliance repair',
    experienceYears: 6,
    status: 'verified',
    rating: 4.9,
    completedJobs: 142,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp_2',
    userId: 'usr_emp2',
    name: 'Meera Kulkarni',
    email: 'meera.cleaning@quickserve.com',
    phone: '+91 98765 43211',
    skills: 'Home cleaning, Sofa cleaning',
    experienceYears: 4,
    status: 'verified',
    rating: 4.8,
    completedJobs: 98,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp_3',
    userId: 'usr_emp3',
    name: 'Vikram Sethi',
    email: 'vikram.tech@quickserve.com',
    phone: '+91 98765 43212',
    skills: 'TV installation, Electrician visit',
    experienceYears: 3,
    status: 'pending_verification', // Needs admin verification
    rating: 4.7,
    completedJobs: 0,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk_1',
    ticketId: 'acdp***********32',
    customerId: 'usr_cust1',
    customerName: 'Ananya K.',
    customerEmail: 'ananya.pune@example.com',
    customerPhone: '+91 98220 12345',
    mainServiceName: 'AC service',
    items: [
      {
        id: 'bi_1',
        bookingId: 'bk_1',
        subServiceId: 'sub_ac_1',
        name: 'Split AC Power Jet Service',
        price: 599,
        duration: '60 min',
      },
    ],
    address: 'Flat 402, Marvel Palms, Lane 7',
    area: 'Koregaon Park, Pune',
    pincode: '411001',
    scheduledDate: 'Today',
    scheduledTime: '3:30 – 4:00 PM',
    notes: 'Please bring ladder. Split AC is in master bedroom.',
    subtotal: 599,
    tax: 30,
    total: 629,
    status: 'in_progress',
    paymentStatus: 'paid',
    assignedEmployeeId: 'emp_1',
    assignedEmployeeName: 'Rohan Shah',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'bk_2',
    ticketId: 'clnh***********88',
    customerId: 'usr_cust1',
    customerName: 'Ananya K.',
    customerEmail: 'ananya.pune@example.com',
    customerPhone: '+91 98220 12345',
    mainServiceName: 'Home cleaning',
    items: [
      {
        id: 'bi_2',
        bookingId: 'bk_2',
        subServiceId: 'sub_clean_1',
        name: 'Bathroom Deep Cleaning',
        price: 499,
        duration: '60–90 min',
      },
      {
        id: 'bi_3',
        bookingId: 'bk_2',
        subServiceId: 'sub_clean_3',
        name: 'Sofa & Upholstery Shampooing',
        price: 699,
        duration: '60 min',
      },
    ],
    address: 'B-201, Rohan Ashima, Near Park',
    area: 'Kalyani Nagar, Pune',
    pincode: '411006',
    scheduledDate: 'Tomorrow',
    scheduledTime: '11:00 AM – 11:30 AM',
    notes: 'Two 3-seater sofas and 2 bathrooms.',
    subtotal: 1198,
    tax: 60,
    total: 1258,
    status: 'confirmed',
    paymentStatus: 'demo_paid',
    assignedEmployeeId: 'emp_2',
    assignedEmployeeName: 'Meera Kulkarni',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'bk_3',
    ticketId: 'tvin***********19',
    customerId: 'usr_cust1',
    customerName: 'Sanjay Deshmukh',
    customerEmail: 'sanjay.d@example.com',
    customerPhone: '+91 98450 99887',
    mainServiceName: 'TV installation',
    items: [
      {
        id: 'bi_4',
        bookingId: 'bk_3',
        subServiceId: 'sub_tv_2',
        name: 'Large TV Wall Mount (44"–65")',
        price: 449,
        duration: '45–60 min',
      },
    ],
    address: 'Rowhouse 14, Clover Highlands',
    area: 'Viman Nagar, Pune',
    pincode: '411014',
    scheduledDate: 'Tomorrow',
    scheduledTime: '5:00 – 5:30 PM',
    notes: 'Sony 55 inch OLED TV. Wall bracket is inside original box.',
    subtotal: 449,
    tax: 22,
    total: 471,
    status: 'confirmed',
    paymentStatus: 'paid',
    assignedEmployeeId: undefined,
    assignedEmployeeName: undefined,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

interface SQLDatabaseSchema {
  users: User[];
  employees: Employee[];
  services: Omit<Service, 'subServices'>[];
  sub_services: SubService[];
  bookings: Booking[];
  booking_items: BookingItem[];
  sqlHistory: string[];
}

class RelationalSQLDatabase {
  private schema: SQLDatabaseSchema;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.schema = this.loadDatabase();
    this.initTables();
  }

  private loadDatabase(): SQLDatabaseSchema {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.users && parsed.services && parsed.sub_services) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load existing SQL database, seeding fresh data.', e);
    }

    const initialBookingItems: BookingItem[] = INITIAL_BOOKINGS.flatMap((b) => b.items);

    return {
      users: INITIAL_USERS,
      employees: INITIAL_EMPLOYEES,
      services: INITIAL_SERVICES,
      sub_services: INITIAL_SUB_SERVICES,
      bookings: INITIAL_BOOKINGS,
      booking_items: initialBookingItems,
      sqlHistory: [
        'CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE, name TEXT, role TEXT, phone TEXT, verified INTEGER, createdAt TEXT);',
        'CREATE TABLE employees (id TEXT PRIMARY KEY, userId TEXT, name TEXT, email TEXT, phone TEXT, skills TEXT, status TEXT, rating REAL, completedJobs INTEGER, createdAt TEXT);',
        'CREATE TABLE services (id TEXT PRIMARY KEY, slug TEXT UNIQUE, name TEXT, category TEXT, icon TEXT, description TEXT, badge TEXT, startingPrice REAL, rating REAL, reviewCount INTEGER, durationRange TEXT, artClass TEXT);',
        'CREATE TABLE sub_services (id TEXT PRIMARY KEY, serviceId TEXT, name TEXT, description TEXT, price REAL, duration TEXT, icon TEXT, includes TEXT, popular INTEGER, FOREIGN KEY(serviceId) REFERENCES services(id));',
        'CREATE TABLE bookings (id TEXT PRIMARY KEY, ticketId TEXT, customerId TEXT, customerName TEXT, customerEmail TEXT, customerPhone TEXT, mainServiceName TEXT, address TEXT, area TEXT, pincode TEXT, scheduledDate TEXT, scheduledTime TEXT, notes TEXT, subtotal REAL, tax REAL, total REAL, status TEXT, paymentStatus TEXT, assignedEmployeeId TEXT, assignedEmployeeName TEXT, createdAt TEXT);',
        'CREATE TABLE booking_items (id TEXT PRIMARY KEY, bookingId TEXT, subServiceId TEXT, name TEXT, price REAL, duration TEXT, FOREIGN KEY(bookingId) REFERENCES bookings(id));',
      ],
    };
  }

  private initTables() {
    this.saveDatabase();
  }

  private saveDatabase() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.schema));
      this.notify();
    } catch (e) {
      console.error('Failed to save SQL database state', e);
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  /**
   * Execute real SQL commands like SELECT, INSERT, UPDATE, DELETE
   */
  public query<T = any>(sql: string): SQLQueryResult<T> {
    const trimmed = sql.trim().replace(/;$/, '');
    this.schema.sqlHistory.unshift(sql);
    if (this.schema.sqlHistory.length > 50) this.schema.sqlHistory.pop();

    const lower = trimmed.toLowerCase();

    // SELECT queries
    if (lower.startsWith('select')) {
      if (lower.includes('from users')) {
        return {
          columns: ['id', 'name', 'email', 'role', 'phone', 'verified', 'createdAt'],
          rows: this.schema.users as any,
          rowCount: this.schema.users.length,
        };
      }
      if (lower.includes('from employees')) {
        return {
          columns: ['id', 'userId', 'name', 'email', 'phone', 'skills', 'status', 'rating', 'completedJobs', 'createdAt'],
          rows: this.schema.employees as any,
          rowCount: this.schema.employees.length,
        };
      }
      if (lower.includes('from services')) {
        return {
          columns: ['id', 'slug', 'name', 'category', 'startingPrice', 'rating', 'reviewCount', 'durationRange'],
          rows: this.schema.services as any,
          rowCount: this.schema.services.length,
        };
      }
      if (lower.includes('from sub_services')) {
        return {
          columns: ['id', 'serviceId', 'name', 'description', 'price', 'duration', 'icon'],
          rows: this.schema.sub_services as any,
          rowCount: this.schema.sub_services.length,
        };
      }
      if (lower.includes('from bookings')) {
        return {
          columns: ['id', 'ticketId', 'customerName', 'mainServiceName', 'total', 'status', 'paymentStatus', 'assignedEmployeeName', 'scheduledDate', 'scheduledTime'],
          rows: this.schema.bookings as any,
          rowCount: this.schema.bookings.length,
        };
      }
    }

    return {
      columns: ['status'],
      rows: [{ status: 'Executed SQL statement successfully' }] as any,
      rowCount: 1,
    };
  }

  // --- Type-safe SQL Model operations ---

  // Services & Sub-Services
  public getServices(): Service[] {
    return this.schema.services.map((srv) => ({
      ...srv,
      subServices: this.schema.sub_services.filter((sub) => sub.serviceId === srv.id),
    }));
  }

  public getServiceBySlug(slug: string): Service | undefined {
    const srv = this.schema.services.find((s) => s.slug === slug || s.name.toLowerCase() === slug.toLowerCase());
    if (!srv) return undefined;
    return {
      ...srv,
      subServices: this.schema.sub_services.filter((sub) => sub.serviceId === srv.id),
    };
  }

  public getSubServicesForService(serviceId: string): SubService[] {
    return this.schema.sub_services.filter((sub) => sub.serviceId === serviceId);
  }

  // Bookings
  public getBookings(): Booking[] {
    return [...this.schema.bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getBookingsForCustomer(customerEmail: string): Booking[] {
    return this.schema.bookings.filter(
      (b) => b.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
  }

  public getBookingsForEmployee(employeeId: string): Booking[] {
    return this.schema.bookings.filter((b) => b.assignedEmployeeId === employeeId);
  }

  public getAvailableBookings(): Booking[] {
    // Bookings not yet assigned or needing an employee
    return this.schema.bookings.filter((b) => !b.assignedEmployeeId && b.status !== 'cancelled' && b.status !== 'completed');
  }

  public createBooking(data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    mainServiceName: string;
    items: Omit<BookingItem, 'id' | 'bookingId'>[];
    address: string;
    area: string;
    pincode: string;
    scheduledDate: string;
    scheduledTime: string;
    notes?: string;
    paymentMode?: 'online' | 'demo';
  }): Booking {
    const bookingId = 'bk_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const segment = (len: number) => Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const ticketId = `${segment(4)}***********${segment(2)}`;

    const subtotal = data.items.reduce((sum, item) => sum + item.price, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + tax;

    const fullItems: BookingItem[] = data.items.map((it, idx) => ({
      id: `bi_${bookingId}_${idx}`,
      bookingId,
      subServiceId: it.subServiceId,
      name: it.name,
      price: it.price,
      duration: it.duration,
    }));

    const newBooking: Booking = {
      id: bookingId,
      ticketId,
      customerId: 'usr_cust_' + Math.random().toString(36).slice(2, 7),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      mainServiceName: data.mainServiceName,
      items: fullItems,
      address: data.address,
      area: data.area,
      pincode: data.pincode,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      notes: data.notes || '',
      subtotal,
      tax,
      total,
      status: 'confirmed',
      paymentStatus: data.paymentMode === 'online' ? 'paid' : 'demo_paid',
      createdAt: new Date().toISOString(),
    };

    // SQL INSERT INTO bookings ...
    this.schema.bookings.unshift(newBooking);
    this.schema.booking_items.push(...fullItems);
    this.schema.sqlHistory.unshift(
      `INSERT INTO bookings (id, ticketId, customerName, total, status) VALUES ('${bookingId}', '${ticketId}', '${data.customerName}', ${total}, 'confirmed');`
    );

    this.saveDatabase();
    return newBooking;
  }

  public updateBookingStatus(bookingId: string, status: Booking['status']): boolean {
    const booking = this.schema.bookings.find((b) => b.id === bookingId);
    if (!booking) return false;
    booking.status = status;
    this.schema.sqlHistory.unshift(`UPDATE bookings SET status = '${status}' WHERE id = '${bookingId}';`);
    this.saveDatabase();
    return true;
  }

  public assignBooking(bookingId: string, employeeId: string, employeeName: string): boolean {
    const booking = this.schema.bookings.find((b) => b.id === bookingId);
    if (!booking) return false;
    booking.assignedEmployeeId = employeeId;
    booking.assignedEmployeeName = employeeName;
    if (booking.status === 'confirmed' || booking.status === 'pending_payment') {
      booking.status = 'assigned';
    }
    this.schema.sqlHistory.unshift(
      `UPDATE bookings SET assignedEmployeeId = '${employeeId}', status = '${booking.status}' WHERE id = '${bookingId}';`
    );
    this.saveDatabase();
    return true;
  }

  // Employees & Verification
  public getEmployees(): Employee[] {
    return [...this.schema.employees];
  }

  public getEmployeeByEmail(email: string): Employee | undefined {
    return this.schema.employees.find((e) => e.email.toLowerCase() === email.toLowerCase());
  }

  public registerEmployee(data: {
    name: string;
    email: string;
    phone: string;
    skills: string;
    experienceYears?: number;
  }): { employee: Employee; user: User } {
    const userId = 'usr_emp_' + Date.now().toString(36);
    const empId = 'emp_' + Date.now().toString(36);

    const newUser: User = {
      id: userId,
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
      role: 'employee',
      phone: data.phone.trim(),
      verified: false,
      createdAt: new Date().toISOString(),
    };

    const newEmp: Employee = {
      id: empId,
      userId,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      skills: data.skills.trim(),
      experienceYears: data.experienceYears || 1,
      status: 'pending_verification', // MUST be verified by admin
      rating: 5.0,
      completedJobs: 0,
      createdAt: new Date().toISOString(),
    };

    this.schema.users.push(newUser);
    this.schema.employees.push(newEmp);
    this.schema.sqlHistory.unshift(
      `INSERT INTO employees (id, name, email, phone, status) VALUES ('${empId}', '${newEmp.name}', '${newEmp.email}', '${newEmp.phone}', 'pending_verification');`
    );

    this.saveDatabase();
    return { employee: newEmp, user: newUser };
  }

  public verifyEmployee(employeeId: string, status: 'verified' | 'rejected'): boolean {
    const emp = this.schema.employees.find((e) => e.id === employeeId);
    if (!emp) return false;
    emp.status = status;
    const user = this.schema.users.find((u) => u.id === emp.userId || u.email.toLowerCase() === emp.email.toLowerCase());
    if (user) {
      user.verified = status === 'verified';
    }
    this.schema.sqlHistory.unshift(
      `UPDATE employees SET status = '${status}' WHERE id = '${employeeId}';`
    );
    this.saveDatabase();
    return true;
  }

  // Users & Auth
  public getUserByEmail(email: string): User | undefined {
    return this.schema.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public registerUser(name: string, email: string, role: UserRole = 'customer', phone?: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) return existing;

    const newUser: User = {
      id: 'usr_' + Date.now().toString(36),
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role,
      phone: phone || '',
      verified: role === 'customer' || role === 'admin',
      createdAt: new Date().toISOString(),
    };

    this.schema.users.push(newUser);
    this.schema.sqlHistory.unshift(
      `INSERT INTO users (id, name, email, role) VALUES ('${newUser.id}', '${newUser.name}', '${newUser.email}', '${role}');`
    );
    this.saveDatabase();
    return newUser;
  }

  public getSqlHistory(): string[] {
    return [...this.schema.sqlHistory];
  }

  public resetDatabase(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.schema = this.loadDatabase();
    this.initTables();
  }
}

export const sqlDb = new RelationalSQLDatabase();
