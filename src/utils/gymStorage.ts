import { 
  AuditLog, 
  AuthUser,
  CashFlowEntry, 
  CashierShift,
  CheckInRecord, 
  GymSessionSchedule, 
  HardwareScannerConfig, 
  Member, 
  MembershipPackage, 
  PTSessionBooking, 
  RetailProduct, 
  Trainer, 
  Transaction, 
  UserRole,
  GymSettings
} from '../types/gym';

const STORAGE_KEYS = {
  CURRENT_USER: 'aurora_gym_current_user_v1',
  USERS: 'aurora_gym_users_v1',
  SHIFTS: 'aurora_gym_shifts_v1',
  MEMBERS: 'aurora_gym_members_v1',
  CHECK_INS: 'aurora_gym_check_ins_v1',
  SCHEDULES: 'aurora_gym_schedules_v1',
  PACKAGES: 'aurora_gym_packages_v1',
  PRODUCTS: 'aurora_gym_products_v1',
  TRANSACTIONS: 'aurora_gym_transactions_v1',
  CASH_FLOW: 'aurora_gym_cashflow_v1',
  TRAINERS: 'aurora_gym_trainers_v1',
  PT_BOOKINGS: 'aurora_gym_pt_bookings_v1',
  AUDIT_LOGS: 'aurora_gym_audit_logs_v1',
  ACTIVE_ROLE: 'aurora_gym_active_role_v1',
  SCANNER_CONFIG: 'aurora_gym_scanner_config_v1',
  SETTINGS: 'aurora_gym_settings_v1',
};

const INITIAL_SETTINGS: GymSettings = {
  gymName: 'Aurora Gym & Fitness Center',
  tagline: 'Solusi Kebugaran Modern, Nyaman & Privasi Terjaga',
  phone: '0812-8888-9999',
  email: 'halo@auroragym.id',
  address: 'Jl. Soekarno-Hatta No. 88, Malang, Jawa Timur',
  website: 'https://auroragym.id',
  taxRate: 0,
  sessionSchedules: {
    womenOnly: '06:00 - 10:00 & 14:00 - 17:00 WIB',
    menOnly: '10:30 - 14:30 & 17:00 - 20:00 WIB',
    mixed: '06:00 - 08:00 & 20:00 - 22:30 WIB',
  },
  hardware: {
    barcodeScannerEnabled: true,
    turnstileGateIntegration: true,
    soundEffectsEnabled: true,
    relayPulseDurationMs: 3000,
    receiptPrinterType: '58mm',
  },
};

// Default Users for Role Screening & Auth
export const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'usr-owner',
    name: 'Aditya Pratama, S.E.',
    email: 'owner@auroragym.id',
    password: 'owner123',
    role: 'owner',
    phone: '0812-3456-7890',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badge: 'Super Admin / Owner',
    shift: 'Full Access (Semua Shift)',
  },
  {
    id: 'usr-manager',
    name: 'Rian Kusuma',
    email: 'manager@auroragym.id',
    password: 'manager123',
    role: 'manager',
    phone: '0813-8877-6655',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    badge: 'Operations Manager',
    shift: 'General Shift (08:00 - 17:00)',
  },
  {
    id: 'usr-cashier-pagi',
    name: 'Nadia Safitri',
    email: 'kasir.pagi@auroragym.id',
    password: 'kasir123',
    role: 'cashier',
    phone: '0819-1122-3344',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    badge: 'Staff Kasir (Pagi)',
    shift: 'Pagi (06:00 - 14:00)',
  },
  {
    id: 'usr-cashier-sore',
    name: 'Budi Santoso',
    email: 'kasir.sore@auroragym.id',
    password: 'kasir123',
    role: 'cashier',
    phone: '0821-5566-7788',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    badge: 'Staff Kasir (Sore)',
    shift: 'Sore (14:00 - 22:00)',
  },
  {
    id: 'usr-trainer',
    name: 'Coach Hendra Wijaya',
    email: 'trainer@auroragym.id',
    password: 'trainer123',
    role: 'trainer',
    phone: '0812-9988-1122',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    badge: 'Head Personal Trainer',
    shift: 'PT Coaching & Client Sessions',
  }
];

// Initial Cashier Shifts Seed
const INITIAL_SHIFTS: CashierShift[] = [
  {
    id: 'shift-001',
    shiftNumber: 'SHF-20260817-001',
    cashierId: 'usr-cashier-pagi',
    cashierName: 'Nadia Safitri',
    shiftType: 'Pagi (06:00 - 14:00)',
    startTime: new Date(Date.now() - 28 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 20 * 3600000).toISOString(),
    status: 'closed',
    startingCash: 300000,
    expectedCash: 1250000,
    actualCash: 1250000,
    cashDifference: 0,
    differenceReason: '',
    paymentSummary: {
      cash: 950000,
      qris: 1450000,
      bank_transfer: 375000,
      debit_card: 0,
      totalSales: 2775000,
    },
    categorySummary: {
      membership: 1950000,
      retail: 475000,
      pt: 350000,
      other: 0,
    },
    totalTransactions: 9,
    cashIn: 0,
    cashOut: 0,
    notes: 'Serah terima laci kas lengkap dan rapi. Stok minuman dingin sudah direstock.',
    handoverTo: 'Budi Santoso (Kasir Sore)',
    closedBy: 'Nadia Safitri',
  },
  {
    id: 'shift-002',
    shiftNumber: 'SHF-20260817-002',
    cashierId: 'usr-cashier-sore',
    cashierName: 'Budi Santoso',
    shiftType: 'Sore (14:00 - 22:00)',
    startTime: new Date(Date.now() - 20 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 12 * 3600000).toISOString(),
    status: 'closed',
    startingCash: 300000,
    expectedCash: 1780000,
    actualCash: 1780000,
    cashDifference: 0,
    differenceReason: '',
    paymentSummary: {
      cash: 1480000,
      qris: 2150000,
      bank_transfer: 950000,
      debit_card: 500000,
      totalSales: 5080000,
    },
    categorySummary: {
      membership: 3800000,
      retail: 780000,
      pt: 500000,
      other: 0,
    },
    totalTransactions: 14,
    cashIn: 0,
    cashOut: 0,
    notes: 'Tutup kasir malam aman terkendali. Setoran tunai disimpan di brankas utama.',
    handoverTo: 'Aditya Pratama (Owner)',
    closedBy: 'Budi Santoso',
  },
  {
    id: 'shift-003',
    shiftNumber: 'SHF-20260818-001',
    cashierId: 'usr-cashier-pagi',
    cashierName: 'Nadia Safitri',
    shiftType: 'Pagi (06:00 - 14:00)',
    startTime: new Date(Date.now() - 3 * 3600000).toISOString(),
    status: 'open',
    startingCash: 300000,
    expectedCash: 950000,
    paymentSummary: {
      cash: 650000,
      qris: 890000,
      bank_transfer: 0,
      debit_card: 0,
      totalSales: 1540000,
    },
    categorySummary: {
      membership: 1250000,
      retail: 290000,
      pt: 0,
      other: 0,
    },
    totalTransactions: 4,
    cashIn: 0,
    cashOut: 0,
    notes: 'Shift aktif pagi hari ini',
  }
];

// Initial Indonesian Realistic Data Seeds (Updated with flexible days & weekend mixed sessions)
const INITIAL_SCHEDULES: GymSessionSchedule[] = [
  {
    id: 'sch-1',
    category: 'women_only',
    name: 'Sesi Khusus Perempuan (Morning Glow)',
    startTime: '06:00',
    endTime: '11:00',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
    currentOccupancy: 18,
    maxCapacity: 35,
    description: 'Area gym khusus wanita dengan pelatih & staf pendamping wanita. Privasi penuh & nyaman.',
    color: 'rose',
    isActiveNow: true,
  },
  {
    id: 'sch-2',
    category: 'men_only',
    name: 'Sesi Khusus Laki-laki (Power & Strength)',
    startTime: '11:00',
    endTime: '14:00',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
    currentOccupancy: 22,
    maxCapacity: 40,
    description: 'Sesi latihan beban intensitas tinggi untuk member pria dengan fokus free-weights & rack.',
    color: 'sky',
    isActiveNow: false,
  },
  {
    id: 'sch-3',
    category: 'women_only',
    name: 'Sesi Khusus Perempuan (Afternoon Fit)',
    startTime: '14:00',
    endTime: '17:00',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
    currentOccupancy: 14,
    maxCapacity: 35,
    description: 'Sesi aerobik, pilates, dan mesin cardio area khusus wanita di sore hari.',
    color: 'rose',
    isActiveNow: false,
  },
  {
    id: 'sch-4',
    category: 'men_only',
    name: 'Sesi Khusus Laki-laki (Evening Power)',
    startTime: '17:00',
    endTime: '20:00',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
    currentOccupancy: 28,
    maxCapacity: 45,
    description: 'Sesi malam khusus pria untuk hypertrophy & powerlifting.',
    color: 'sky',
    isActiveNow: false,
  },
  {
    id: 'sch-5',
    category: 'mixed',
    name: 'Sesi Gabungan Malam Weekday (All-Access Night)',
    startTime: '20:00',
    endTime: '22:30',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
    currentOccupancy: 19,
    maxCapacity: 50,
    description: 'Sesi terbuka untuk seluruh member pria & wanita di malam hari.',
    color: 'emerald',
    isActiveNow: false,
  },
  {
    id: 'sch-6',
    category: 'mixed',
    name: 'Sesi Gabungan Akhir Pekan (Sabtu & Minggu Bebas Pria & Wanita)',
    startTime: '06:00',
    endTime: '22:00',
    days: ['Sabtu', 'Minggu'],
    currentOccupancy: 35,
    maxCapacity: 60,
    description: 'Khusus latihan di hari Sabtu dan Minggu dicampur antara perempuan dan laki-laki sepanjang jam operasional.',
    color: 'emerald',
    isActiveNow: false,
  },
];

const INITIAL_PACKAGES: MembershipPackage[] = [
  {
    id: 'pkg-1',
    name: 'Sesi Khusus Perempuan (1 Bulan)',
    durationMonths: 1,
    price: 290000,
    allowedSession: 'women_only',
    description: 'Akses penuh seluruh jadwal Sesi Khusus Perempuan + Locker + Free 1x Pengukuran Body Composition.',
    benefits: ['Akses Sesi Khusus Perempuan', 'Free Locker & Shower', '1x Free InBody Scan', 'Diskon POS Retail 5%'],
    isPopular: true,
  },
  {
    id: 'pkg-2',
    name: 'Sesi Khusus Laki-laki (1 Bulan)',
    durationMonths: 1,
    price: 290000,
    allowedSession: 'men_only',
    description: 'Akses khusus jadwal Power & Strength Pria + Free Heavy Free-Weight Zone.',
    benefits: ['Akses Sesi Khusus Laki-laki', 'Free Locker & Sauna', '1x Konsultasi Program Beban', 'Diskon POS 5%'],
    isPopular: false,
  },
  {
    id: 'pkg-3',
    name: 'All-Access Unlimited (1 Bulan)',
    durationMonths: 1,
    price: 375000,
    allowedSession: 'all',
    description: 'Akses fleksibel tanpa batasan ke Sesi Khusus gender maupun Sesi Gabungan setiap hari.',
    benefits: ['Bebas Akses Semua Sesi', 'Free Locker Eksklusif', '2x InBody Scan', 'Diskon Suplemen 10%'],
    isPopular: true,
  },
  {
    id: 'pkg-4',
    name: 'Aurora Platinum Member (3 Bulan)',
    durationMonths: 3,
    price: 950000,
    discountPercent: 15,
    allowedSession: 'all',
    description: 'Hemat 15% untuk keanggotaan 3 bulan + Free 1 Sesi Personal Trainer.',
    benefits: ['Akses Semua Sesi 90 Hari', 'Free 1x Personal Trainer 60 Min', 'Bonus Aurora Shaker Bottle', 'Diskon 10% Merchandise'],
    isPopular: false,
  },
  {
    id: 'pkg-5',
    name: 'Aurora VIP Annual (12 Bulan)',
    durationMonths: 12,
    price: 3200000,
    discountPercent: 30,
    allowedSession: 'all',
    description: 'Paket keanggotaan tahunan premium dengan diskon terbesar dan fasilitas VIP.',
    benefits: ['Akses Tanpa Batas 365 Hari', 'Free 3x Personal Trainer', 'Free Gym Bag & Jersey Aurora', 'Prioritas Booking Kelas'],
    isPopular: false,
  },
  {
    id: 'pkg-6',
    name: 'Daily Pass / Kunjungan Harian',
    durationMonths: 0,
    price: 45000,
    allowedSession: 'all',
    description: 'Kunjungan 1 hari untuk umum/tamu gym.',
    benefits: ['Akses Gym 1 Hari', 'Penggunaan Locker Harian', 'Akses Ruang Ganti & Shower'],
    isPopular: false,
  },
];

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'AG-2026-001',
    name: 'Siti Nurhaliza',
    gender: 'female',
    phone: '081234567890',
    email: 'siti.nurhaliza@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    barcode: 'AGM882101',
    sessionCategory: 'women_only',
    packageId: 'pkg-1',
    packageName: 'Sesi Khusus Perempuan (1 Bulan)',
    joinDate: '2026-05-10',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'active',
    emergencyContact: {
      name: 'Ahmad Fauzi',
      phone: '081299887766',
      relation: 'Suami',
    },
    assignedTrainerId: 'trn-2',
    assignedTrainerName: 'Coach Nadia Lestari',
    notes: 'Fokus penurunan kadar lemak tubuh & penguatan otot panggul pasca melahirkan.',
    totalCheckIns: 42,
    lastCheckIn: '2026-08-18 07:15',
  },
  {
    id: 'AG-2026-002',
    name: 'Dimas Pratama',
    gender: 'male',
    phone: '085712349988',
    email: 'dimas.pratama@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    barcode: 'AGM882102',
    sessionCategory: 'men_only',
    packageId: 'pkg-2',
    packageName: 'Sesi Khusus Laki-laki (1 Bulan)',
    joinDate: '2026-06-15',
    startDate: '2026-08-05',
    endDate: '2026-09-05',
    status: 'active',
    emergencyContact: {
      name: 'Rini Pratama',
      phone: '085711223344',
      relation: 'Ibu',
    },
    assignedTrainerId: 'trn-1',
    assignedTrainerName: 'Coach Rian Perkasa',
    notes: 'Program hipertrofi & deadlift 180kg goal.',
    totalCheckIns: 38,
    lastCheckIn: '2026-08-17 11:20',
  },
  {
    id: 'AG-2026-003',
    name: 'Anisa Rahmawati',
    gender: 'female',
    phone: '082198765432',
    email: 'anisa.rahma@yahoo.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    barcode: 'AGM882103',
    sessionCategory: 'women_only',
    packageId: 'pkg-1',
    packageName: 'Sesi Khusus Perempuan (1 Bulan)',
    joinDate: '2026-07-01',
    startDate: '2026-07-22',
    endDate: '2026-08-21',
    status: 'expiring',
    emergencyContact: {
      name: 'Dewi Rahmawati',
      phone: '082155443322',
      relation: 'Kakak',
    },
    assignedTrainerId: 'trn-4',
    assignedTrainerName: 'Coach Sarah Amelia',
    notes: 'Rutin sesi aerobik & pilates.',
    totalCheckIns: 19,
    lastCheckIn: '2026-08-18 06:45',
  },
  {
    id: 'AG-2026-004',
    name: 'Rizky Alamsyah',
    gender: 'male',
    phone: '081344556677',
    email: 'rizky.alamsyah@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    barcode: 'AGM882104',
    sessionCategory: 'mixed',
    packageId: 'pkg-3',
    packageName: 'All-Access Unlimited (1 Bulan)',
    joinDate: '2026-03-12',
    startDate: '2026-08-10',
    endDate: '2026-09-10',
    status: 'active',
    emergencyContact: {
      name: 'Maya Alamsyah',
      phone: '081399001122',
      relation: 'Istri',
    },
    assignedTrainerId: 'trn-3',
    assignedTrainerName: 'Coach Bima Wicaksono',
    notes: 'Member fleksibel jadwal kerja shift.',
    totalCheckIns: 56,
    lastCheckIn: '2026-08-18 08:30',
  },
  {
    id: 'AG-2026-005',
    name: 'Putri Maharani',
    gender: 'female',
    phone: '087812345678',
    email: 'putri.maharani@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    barcode: 'AGM882105',
    sessionCategory: 'mixed',
    packageId: 'pkg-4',
    packageName: 'Aurora Platinum Member (3 Bulan)',
    joinDate: '2026-04-05',
    startDate: '2026-06-01',
    endDate: '2026-08-19',
    status: 'expiring',
    emergencyContact: {
      name: 'Bambang Maharani',
      phone: '087855667788',
      relation: 'Ayah',
    },
    notes: 'Masa aktif sisa 1 hari lagi, perlu diingatkan perpanjangan.',
    totalCheckIns: 64,
    lastCheckIn: '2026-08-16 17:10',
  },
  {
    id: 'AG-2026-006',
    name: 'Budi Santoso',
    gender: 'male',
    phone: '081987654321',
    email: 'budi.santoso@yahoo.co.id',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    barcode: 'AGM882106',
    sessionCategory: 'men_only',
    packageId: 'pkg-2',
    packageName: 'Sesi Khusus Laki-laki (1 Bulan)',
    joinDate: '2026-01-20',
    startDate: '2026-07-05',
    endDate: '2026-08-05',
    status: 'expired',
    emergencyContact: {
      name: 'Wati Santoso',
      phone: '081911223344',
      relation: 'Istri',
    },
    notes: 'Member lama, belum perpanjang sejak awal Agustus.',
    totalCheckIns: 28,
    lastCheckIn: '2026-08-04 12:30',
  },
  {
    id: 'AG-2026-007',
    name: 'Zahra Fitriani',
    gender: 'female',
    phone: '085233445566',
    email: 'zahra.fitri@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    barcode: 'AGM882107',
    sessionCategory: 'women_only',
    packageId: 'pkg-5',
    packageName: 'Aurora VIP Annual (12 Bulan)',
    joinDate: '2026-02-14',
    startDate: '2026-02-14',
    endDate: '2027-02-14',
    status: 'active',
    emergencyContact: {
      name: 'Hadi Fitriani',
      phone: '085277889900',
      relation: 'Kakak',
    },
    assignedTrainerId: 'trn-2',
    assignedTrainerName: 'Coach Nadia Lestari',
    notes: 'VIP Member, fasilitas handuk & locker khusus nomor 07.',
    totalCheckIns: 92,
    lastCheckIn: '2026-08-18 07:45',
  },
  {
    id: 'AG-2026-008',
    name: 'Fajar Nugroho',
    gender: 'male',
    phone: '081299008811',
    email: 'fajar.nugroho@tech.id',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    barcode: 'AGM882108',
    sessionCategory: 'mixed',
    packageId: 'pkg-3',
    packageName: 'All-Access Unlimited (1 Bulan)',
    joinDate: '2026-07-20',
    startDate: '2026-07-20',
    endDate: '2026-08-20',
    status: 'expiring',
    emergencyContact: {
      name: 'Indah Nugroho',
      phone: '081233445566',
      relation: 'Istri',
    },
    notes: 'Masa aktif habis 2 hari lagi.',
    totalCheckIns: 14,
    lastCheckIn: '2026-08-15 19:30',
  }
];

const INITIAL_PRODUCTS: RetailProduct[] = [
  {
    id: 'prd-1',
    sku: 'AUR-WHEY-01',
    name: 'Optimum Nutrition Gold Whey Sachet 30g',
    category: 'Supplements',
    buyPrice: 18000,
    sellPrice: 28000,
    stock: 45,
    minStockAlert: 15,
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=150&auto=format&fit=crop&q=80',
    barcode: '8991001001',
    soldCount: 120,
  },
  {
    id: 'prd-2',
    sku: 'AUR-WHEY-02',
    name: 'IsoFlex Protein Shake RTD 400ml (Coklat)',
    category: 'Beverages',
    buyPrice: 23000,
    sellPrice: 35000,
    stock: 24,
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=150&auto=format&fit=crop&q=80',
    barcode: '8991001002',
    soldCount: 88,
  },
  {
    id: 'prd-3',
    sku: 'AUR-PRE-01',
    name: 'C4 Pre-Workout Energy Drink 330ml',
    category: 'Beverages',
    buyPrice: 25000,
    sellPrice: 38000,
    stock: 18,
    minStockAlert: 8,
    image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=150&auto=format&fit=crop&q=80',
    barcode: '8991001003',
    soldCount: 65,
  },
  {
    id: 'prd-4',
    sku: 'AUR-DRK-01',
    name: 'Pocari Sweat Ion Water 500ml',
    category: 'Beverages',
    buyPrice: 6500,
    sellPrice: 10000,
    stock: 80,
    minStockAlert: 20,
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=150&auto=format&fit=crop&q=80',
    barcode: '8991001004',
    soldCount: 340,
  },
  {
    id: 'prd-5',
    sku: 'AUR-DRK-02',
    name: 'Hydro Coco Pure Coconut Water 330ml',
    category: 'Beverages',
    buyPrice: 7500,
    sellPrice: 12000,
    stock: 50,
    minStockAlert: 15,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=150&auto=format&fit=crop&q=80',
    barcode: '8991001005',
    soldCount: 195,
  },
  {
    id: 'prd-6',
    sku: 'AUR-SNK-01',
    name: 'Quest Nutrition Protein Bar (Cookies & Cream)',
    category: 'Snacks',
    buyPrice: 29000,
    sellPrice: 42000,
    stock: 4, // LOW STOCK
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1622484214545-ebecbca70783?w=150&auto=format&fit=crop&q=80',
    barcode: '8991001006',
    soldCount: 78,
  },
  {
    id: 'prd-7',
    sku: 'AUR-MERCH-01',
    name: 'Aurora Matte Black Shaker Bottle 700ml',
    category: 'Merchandise',
    buyPrice: 40000,
    sellPrice: 75000,
    stock: 3, // LOW STOCK
    minStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=150&auto=format&fit=crop&q=80',
    barcode: '8991001007',
    soldCount: 42,
  },
  {
    id: 'prd-8',
    sku: 'AUR-ACC-01',
    name: 'Aurora Heavy Duty Lifting Straps (Pair)',
    category: 'Accessories',
    buyPrice: 35000,
    sellPrice: 65000,
    stock: 12,
    minStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80',
    barcode: '8991001008',
    soldCount: 31,
  },
  {
    id: 'prd-9',
    sku: 'AUR-MERCH-02',
    name: 'Aurora Quick-Dry Gym Towel (Microfiber)',
    category: 'Merchandise',
    buyPrice: 22000,
    sellPrice: 45000,
    stock: 15,
    minStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=150&auto=format&fit=crop&q=80',
    barcode: '8991001009',
    soldCount: 54,
  }
];

const INITIAL_TRAINERS: Trainer[] = [
  {
    id: 'trn-1',
    name: 'Coach Rian Perkasa, CSCS',
    gender: 'male',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialties: ['Bodybuilding', 'Powerlifting', 'Strength Conditioning'],
    certification: 'APKI Certified, CSCS Strength Coach',
    rating: 4.9,
    reviewCount: 48,
    totalClients: 14,
    sessionRate: 175000,
    monthlyRate: 1500000,
    status: 'available',
    phone: '081211112222',
    bio: 'Berpengalaman 7+ tahun dalam pembentukan massa otot dan powerlifting kompetitif.',
    availableSchedule: [
      { day: 'Senin - Jumat', hours: '10:00 - 18:00' },
      { day: 'Sabtu', hours: '08:00 - 14:00' },
    ],
  },
  {
    id: 'trn-2',
    name: 'Coach Nadia Lestari, CPT',
    gender: 'female',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    specialties: ['Women Fitness', 'Fat Loss', 'Post-Natal Care', 'Pilates'],
    certification: 'NASM Certified Personal Trainer, Mat Pilates Level 2',
    rating: 5.0,
    reviewCount: 62,
    totalClients: 18,
    sessionRate: 175000,
    monthlyRate: 1500000,
    status: 'in_session',
    phone: '081233334444',
    bio: 'Spesialis program kebugaran wanita, pembentukan lekuk tubuh, dan pola makan berkelanjutan.',
    availableSchedule: [
      { day: 'Senin - Sabtu', hours: '06:00 - 12:00 & 16:00 - 19:00' },
    ],
  },
  {
    id: 'trn-3',
    name: 'Coach Bima Wicaksono',
    gender: 'male',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialties: ['Calisthenics', 'Mobility & Rehab', 'HIIT'],
    certification: 'Fitness Australia Level 3, FMS Functional Movement',
    rating: 4.8,
    reviewCount: 35,
    totalClients: 10,
    sessionRate: 150000,
    monthlyRate: 1300000,
    status: 'available',
    phone: '081255556666',
    bio: 'Fokus pada fleksibilitas, perbaikan postur tubuh pekerja kantoran, dan kekuatan fungsional.',
    availableSchedule: [
      { day: 'Selasa - Minggu', hours: '14:00 - 21:00' },
    ],
  },
  {
    id: 'trn-4',
    name: 'Coach Sarah Amelia',
    gender: 'female',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    specialties: ['Yoga Vinyasa', 'Core Strengthening', 'Cardio Boxing'],
    certification: 'RYT-200 Yoga Alliance, Les Mills BodyCombat',
    rating: 4.9,
    reviewCount: 41,
    totalClients: 12,
    sessionRate: 150000,
    monthlyRate: 1300000,
    status: 'available',
    phone: '081277778888',
    bio: 'Membimbing sesi latihan kardio bersemangat dan meditasi pernapasan untuk mengurangi stres.',
    availableSchedule: [
      { day: 'Senin, Rabu, Jumat, Sabtu', hours: '07:00 - 15:00' },
    ],
  },
];

const INITIAL_CHECKINS: CheckInRecord[] = [
  {
    id: 'chk-1',
    memberId: 'AG-2026-001',
    memberName: 'Siti Nurhaliza',
    barcode: 'AGM882101',
    gender: 'female',
    sessionCategory: 'women_only',
    checkInTime: '2026-08-18T07:15:00',
    lockerNumber: 12,
    status: 'inside',
    checkedInBy: 'Admin Front-Desk',
  },
  {
    id: 'chk-2',
    memberId: 'AG-2026-003',
    memberName: 'Anisa Rahmawati',
    barcode: 'AGM882103',
    gender: 'female',
    sessionCategory: 'women_only',
    checkInTime: '2026-08-18T06:45:00',
    lockerNumber: 14,
    status: 'inside',
    checkedInBy: 'Admin Front-Desk',
  },
  {
    id: 'chk-3',
    memberId: 'AG-2026-007',
    memberName: 'Zahra Fitriani',
    barcode: 'AGM882107',
    gender: 'female',
    sessionCategory: 'women_only',
    checkInTime: '2026-08-18T07:45:00',
    lockerNumber: 7,
    status: 'inside',
    checkedInBy: 'Scanner Terminal 1',
  },
  {
    id: 'chk-4',
    memberId: 'AG-2026-004',
    memberName: 'Rizky Alamsyah',
    barcode: 'AGM882104',
    gender: 'male',
    sessionCategory: 'mixed',
    checkInTime: '2026-08-18T08:30:00',
    lockerNumber: 22,
    status: 'inside',
    checkedInBy: 'Admin Front-Desk',
  },
  {
    id: 'chk-5',
    memberId: 'AG-2026-002',
    memberName: 'Dimas Pratama',
    barcode: 'AGM882102',
    gender: 'male',
    sessionCategory: 'men_only',
    checkInTime: '2026-08-17T11:20:00',
    checkOutTime: '2026-08-17T13:10:00',
    lockerNumber: 5,
    status: 'completed',
    checkedInBy: 'Scanner Terminal 1',
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-101',
    invoiceNumber: 'INV/20260818/001',
    date: '2026-08-18T07:20:00',
    type: 'membership_reg',
    customerName: 'Siti Nurhaliza',
    memberId: 'AG-2026-001',
    items: [
      {
        id: 'pkg-1',
        name: 'Sesi Khusus Perempuan (1 Bulan)',
        price: 290000,
        quantity: 1,
        subtotal: 290000,
        category: 'Membership',
      }
    ],
    subtotal: 290000,
    discount: 0,
    tax: 0,
    total: 290000,
    paymentMethod: 'qris',
    cashierName: 'Dewi (Kasir)',
    status: 'paid',
  },
  {
    id: 'txn-102',
    invoiceNumber: 'INV/20260818/002',
    date: '2026-08-18T08:05:00',
    type: 'pos_retail',
    customerName: 'Zahra Fitriani',
    memberId: 'AG-2026-007',
    items: [
      {
        id: 'prd-2',
        name: 'IsoFlex Protein Shake RTD 400ml',
        price: 35000,
        quantity: 1,
        subtotal: 35000,
        category: 'Beverages',
      },
      {
        id: 'prd-4',
        name: 'Pocari Sweat Ion Water 500ml',
        price: 10000,
        quantity: 1,
        subtotal: 10000,
        category: 'Beverages',
      }
    ],
    subtotal: 45000,
    discount: 0,
    tax: 0,
    total: 45000,
    paymentMethod: 'cash',
    cashierName: 'Dewi (Kasir)',
    status: 'paid',
  },
  {
    id: 'txn-103',
    invoiceNumber: 'INV/20260818/003',
    date: '2026-08-18T08:40:00',
    type: 'pos_retail',
    customerName: 'Rizky Alamsyah',
    memberId: 'AG-2026-004',
    items: [
      {
        id: 'prd-1',
        name: 'Optimum Nutrition Gold Whey Sachet 30g',
        price: 28000,
        quantity: 2,
        subtotal: 56000,
        category: 'Supplements',
      }
    ],
    subtotal: 56000,
    discount: 5600, // 10% member discount
    tax: 0,
    total: 50400,
    paymentMethod: 'qris',
    cashierName: 'Dewi (Kasir)',
    status: 'paid',
  }
];

const INITIAL_CASHFLOW: CashFlowEntry[] = [
  {
    id: 'cf-1',
    date: '2026-08-18T07:20:00',
    type: 'income',
    category: 'Membership',
    amount: 290000,
    description: 'Pendaftaran Member Baru Siti Nurhaliza (INV/20260818/001)',
    performedBy: 'Dewi (Kasir)',
    referenceId: 'txn-101',
  },
  {
    id: 'cf-2',
    date: '2026-08-18T08:05:00',
    type: 'income',
    category: 'Retail POS',
    amount: 45000,
    description: 'Pembelian Retail Zahra Fitriani (INV/20260818/002)',
    performedBy: 'Dewi (Kasir)',
    referenceId: 'txn-102',
  },
  {
    id: 'cf-3',
    date: '2026-08-18T08:40:00',
    type: 'income',
    category: 'Retail POS',
    amount: 50400,
    description: 'Pembelian Retail Rizky Alamsyah (INV/20260818/003)',
    performedBy: 'Dewi (Kasir)',
    referenceId: 'txn-103',
  },
  {
    id: 'cf-4',
    date: '2026-08-17T15:00:00',
    type: 'expense',
    category: 'Restock Barang',
    amount: 850000,
    description: 'Restock Minuman Pocari Sweat & Hydro Coco (Supplier CV Sejahtera)',
    performedBy: 'Manager Operasional',
  },
  {
    id: 'cf-5',
    date: '2026-08-16T10:00:00',
    type: 'expense',
    category: 'Maintenance Alat',
    amount: 450000,
    description: 'Service & Pelumasan Treadmill Technogym Line 2 & 3',
    performedBy: 'Manager Operasional',
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-18T06:00:15',
    userName: 'Dewi (Kasir)',
    role: 'cashier',
    action: 'Buka Kasir Harian',
    details: 'Membuka shift kasir pagi dengan modal kas awal Rp 500.000',
    ipAddress: '192.168.1.102',
  },
  {
    id: 'log-2',
    timestamp: '2026-08-18T07:15:20',
    userName: 'Admin Front-Desk',
    role: 'admin',
    action: 'Check-In Member',
    details: 'Member Siti Nurhaliza (AGM882101) berhasil check-in pada Sesi Khusus Perempuan (Locker #12)',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'log-3',
    timestamp: '2026-08-18T07:20:45',
    userName: 'Dewi (Kasir)',
    role: 'cashier',
    action: 'Transaksi Membership Baru',
    details: 'Invoice INV/20260818/001 senilai Rp 290.000 via QRIS',
    ipAddress: '192.168.1.102',
  },
  {
    id: 'log-4',
    timestamp: '2026-08-18T08:05:30',
    userName: 'Dewi (Kasir)',
    role: 'cashier',
    action: 'Transaksi POS Retail',
    details: 'Penjualan retail IsoFlex + Pocari Sweat senilai Rp 45.000 tunai',
    ipAddress: '192.168.1.102',
  }
];

const INITIAL_SCANNER_CONFIG: HardwareScannerConfig = {
  enabled: true,
  mode: 'keyboard_wedge',
  autoCheckInOnScan: true,
  playBeep: true,
  scannerPort: 'COM3 / USB Barcode Reader HID',
  baudRate: 9600,
  allowOverrideOnMismatch: false,
};

// Generic LocalStorage helper with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('aurora_storage_updated'));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export const gymStorage = {
  // Members
  getMembers: (): Member[] => loadFromStorage(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS),
  saveMembers: (members: Member[]) => saveToStorage(STORAGE_KEYS.MEMBERS, members),
  addMember: (member: Member) => {
    const current = gymStorage.getMembers();
    gymStorage.saveMembers([member, ...current]);
    gymStorage.addAuditLog('Tambah Member Baru', `Mendaftarkan member ${member.name} (${member.id}) dengan paket ${member.packageName}`);
  },
  updateMember: (updated: Member) => {
    const current = gymStorage.getMembers();
    gymStorage.saveMembers(current.map(m => m.id === updated.id ? updated : m));
    gymStorage.addAuditLog('Update Biodata Member', `Mengubah data member ${updated.name} (${updated.id})`);
  },
  renewMember: (memberId: string, packageItem: MembershipPackage, paymentMethod: 'cash' | 'qris' | 'bank_transfer' | 'debit_card', cashierName: string) => {
    const members = gymStorage.getMembers();
    const target = members.find(m => m.id === memberId);
    if (!target) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + packageItem.durationMonths);

    const updatedMember: Member = {
      ...target,
      packageId: packageItem.id,
      packageName: packageItem.name,
      sessionCategory: packageItem.allowedSession === 'all' ? target.sessionCategory : packageItem.allowedSession,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'active',
    };

    gymStorage.saveMembers(members.map(m => m.id === memberId ? updatedMember : m));

    // Create transaction & cash flow
    const invNumber = `INV/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${Math.floor(100 + Math.random() * 900)}`;
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      invoiceNumber: invNumber,
      date: new Date().toISOString(),
      type: 'membership_renew',
      customerName: target.name,
      customerPhone: target.phone,
      memberId: target.id,
      items: [
        {
          id: packageItem.id,
          name: `Perpanjangan: ${packageItem.name}`,
          price: packageItem.price,
          quantity: 1,
          subtotal: packageItem.price,
          category: 'Membership',
        }
      ],
      subtotal: packageItem.price,
      discount: 0,
      tax: 0,
      total: packageItem.price,
      paymentMethod,
      cashierName,
      status: 'paid',
    };
    gymStorage.addTransaction(newTxn);

    gymStorage.addCashFlow({
      id: `cf-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'income',
      category: 'Membership',
      amount: packageItem.price,
      description: `Perpanjangan Paket ${target.name} (${packageItem.name})`,
      performedBy: cashierName,
      referenceId: newTxn.id,
    });

    gymStorage.addAuditLog('Perpanjangan Membership', `Perpanjangan membership ${target.name} durasi ${packageItem.durationMonths} bulan sebesar Rp ${packageItem.price.toLocaleString('id-ID')}`);
  },

  // Check-in / Check-out
  getCheckIns: (): CheckInRecord[] => loadFromStorage(STORAGE_KEYS.CHECK_INS, INITIAL_CHECKINS),
  saveCheckIns: (records: CheckInRecord[]) => saveToStorage(STORAGE_KEYS.CHECK_INS, records),
  addCheckIn: (record: CheckInRecord) => {
    const current = gymStorage.getCheckIns();
    gymStorage.saveCheckIns([record, ...current]);
    if (record.status === 'inside') {
      const members = gymStorage.getMembers();
      gymStorage.saveMembers(members.map(m => m.id === record.memberId ? {
        ...m,
        totalCheckIns: m.totalCheckIns + 1,
        lastCheckIn: new Date().toISOString().replace('T', ' ').slice(0, 16)
      } : m));
    }
    gymStorage.addAuditLog(
      record.status === 'inside' ? 'Check-In Member' : 'Check-In Ditolak',
      `${record.memberName} (${record.barcode}) status: ${record.status}${record.denialReason ? ` (${record.denialReason})` : ''}`
    );
  },
  checkOutMember: (checkInId: string) => {
    const current = gymStorage.getCheckIns();
    const now = new Date().toISOString();
    gymStorage.saveCheckIns(current.map(c => c.id === checkInId ? { ...c, checkOutTime: now, status: 'completed' } : c));
    gymStorage.addAuditLog('Check-Out Member', `Check out selesai untuk ID transaksi check-in: ${checkInId}`);
  },

  // Schedules
  getSchedules: (): GymSessionSchedule[] => loadFromStorage(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES),
  saveSchedules: (schedules: GymSessionSchedule[]) => saveToStorage(STORAGE_KEYS.SCHEDULES, schedules),

  // Packages
  getPackages: (): MembershipPackage[] => loadFromStorage(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES),
  savePackages: (packages: MembershipPackage[]) => saveToStorage(STORAGE_KEYS.PACKAGES, packages),

  // Products
  getProducts: (): RetailProduct[] => loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProducts: (products: RetailProduct[]) => saveToStorage(STORAGE_KEYS.PRODUCTS, products),
  updateProductStock: (productId: string, deltaQty: number) => {
    const products = gymStorage.getProducts();
    gymStorage.saveProducts(products.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + deltaQty);
        const newSold = deltaQty < 0 ? p.soldCount + Math.abs(deltaQty) : p.soldCount;
        return { ...p, stock: newStock, soldCount: newSold };
      }
      return p;
    }));
  },

  // Transactions
  getTransactions: (): Transaction[] => loadFromStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS),
  addTransaction: (transaction: Transaction) => {
    const current = gymStorage.getTransactions();
    gymStorage.saveTransactions([transaction, ...current]);
    gymStorage.recordShiftTransaction(transaction);
  },
  saveTransactions: (txns: Transaction[]) => saveToStorage(STORAGE_KEYS.TRANSACTIONS, txns),

  // Users & Authentication
  getUsers: (): AuthUser[] => loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS),
  saveUsers: (users: AuthUser[]) => saveToStorage(STORAGE_KEYS.USERS, users),
  getCurrentUser: (): AuthUser | null => loadFromStorage(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]),
  setCurrentUser: (user: AuthUser | null) => {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    if (user) {
      gymStorage.setActiveRole(user.role);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('aurora_auth_changed'));
      window.dispatchEvent(new Event('aurora_storage_updated'));
    }
  },
  login: (email: string, password?: string): { success: boolean; user?: AuthUser; message: string } => {
    const users = gymStorage.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, message: 'Email tidak terdaftar dalam sistem Aurora Gym.' };
    }
    if (password && found.password && found.password !== password) {
      return { success: false, message: 'Kata sandi yang Anda masukkan salah.' };
    }
    const loggedUser: AuthUser = {
      ...found,
      lastLogin: new Date().toISOString(),
    };
    gymStorage.setCurrentUser(loggedUser);
    gymStorage.addAuditLog('Login Pengguna Berhasil', `User ${found.name} login sebagai [${found.role.toUpperCase()}]`);
    return { success: true, user: loggedUser, message: `Selamat datang kembali, ${found.name}!` };
  },
  logout: () => {
    const user = gymStorage.getCurrentUser();
    if (user) {
      gymStorage.addAuditLog('Logout Pengguna', `User ${user.name} (${user.role}) telah logout dari sistem.`);
    }
    gymStorage.setCurrentUser(null);
  },

  // Cashier Shifts
  getShifts: (): CashierShift[] => loadFromStorage(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS),
  saveShifts: (shifts: CashierShift[]) => saveToStorage(STORAGE_KEYS.SHIFTS, shifts),
  getActiveShift: (cashierId?: string): CashierShift | null => {
    const shifts = gymStorage.getShifts();
    if (cashierId) {
      return shifts.find(s => s.cashierId === cashierId && s.status === 'open') || shifts.find(s => s.status === 'open') || null;
    }
    return shifts.find(s => s.status === 'open') || null;
  },
  openShift: (params: { cashierId: string; cashierName: string; shiftType: CashierShift['shiftType']; startingCash: number }): CashierShift => {
    const shifts = gymStorage.getShifts();
    const now = new Date();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const shiftNumber = `SHF-${dateCode}-${String(shifts.length + 1).padStart(3, '0')}`;
    const newShift: CashierShift = {
      id: `shift-${Date.now()}`,
      shiftNumber,
      cashierId: params.cashierId,
      cashierName: params.cashierName,
      shiftType: params.shiftType,
      startTime: now.toISOString(),
      status: 'open',
      startingCash: params.startingCash,
      expectedCash: params.startingCash,
      paymentSummary: {
        cash: 0,
        qris: 0,
        bank_transfer: 0,
        debit_card: 0,
        totalSales: 0,
      },
      categorySummary: {
        membership: 0,
        retail: 0,
        pt: 0,
        other: 0,
      },
      totalTransactions: 0,
      cashIn: 0,
      cashOut: 0,
      notes: `Shift ${params.shiftType} dibuka oleh ${params.cashierName}`,
    };
    gymStorage.saveShifts([newShift, ...shifts]);
    gymStorage.addAuditLog('Buka Shift Kasir', `Shift ${shiftNumber} dibuka oleh ${params.cashierName} dengan modal awal Rp ${params.startingCash.toLocaleString('id-ID')}`);
    return newShift;
  },
  closeShift: (shiftId: string, params: { actualCash: number; handoverTo?: string; notes?: string; differenceReason?: string; closedBy?: string }): CashierShift | null => {
    const shifts = gymStorage.getShifts();
    const target = shifts.find(s => s.id === shiftId);
    if (!target) return null;

    const diff = params.actualCash - target.expectedCash;
    const now = new Date().toISOString();
    const closedShift: CashierShift = {
      ...target,
      status: 'closed',
      endTime: now,
      actualCash: params.actualCash,
      cashDifference: diff,
      differenceReason: params.differenceReason || (diff === 0 ? 'Kas Pas Sesuai Penjualan' : diff > 0 ? 'Kelebihan Uang Fisik' : 'Kekurangan Uang Kas'),
      handoverTo: params.handoverTo,
      notes: params.notes,
      closedBy: params.closedBy || target.cashierName,
    };

    const updated = shifts.map(s => s.id === shiftId ? closedShift : s);
    gymStorage.saveShifts(updated);
    gymStorage.addAuditLog('Tutup Shift Kasir', `Shift ${target.shiftNumber} ditutup oleh ${target.cashierName}. Fisik: Rp ${params.actualCash.toLocaleString('id-ID')}, Selisih: Rp ${diff.toLocaleString('id-ID')}`);
    return closedShift;
  },
  recordShiftTransaction: (txn: Transaction) => {
    const shifts = gymStorage.getShifts();
    const active = shifts.find(s => s.status === 'open');
    if (!active) return;

    const isCash = txn.paymentMethod === 'cash';
    const isQris = txn.paymentMethod === 'qris';
    const isTransfer = txn.paymentMethod === 'bank_transfer';
    const isDebit = txn.paymentMethod === 'debit_card';

    const txnType = String(txn?.type || '');
    const isMembership = txnType.startsWith('membership');
    const isRetail = txnType === 'pos_retail';
    const isPt = txnType === 'pt_booking';

    const cashAddition = isCash ? txn.total : 0;
    const updatedShift: CashierShift = {
      ...active,
      expectedCash: active.expectedCash + cashAddition,
      totalTransactions: active.totalTransactions + 1,
      paymentSummary: {
        cash: active.paymentSummary.cash + (isCash ? txn.total : 0),
        qris: active.paymentSummary.qris + (isQris ? txn.total : 0),
        bank_transfer: active.paymentSummary.bank_transfer + (isTransfer ? txn.total : 0),
        debit_card: active.paymentSummary.debit_card + (isDebit ? txn.total : 0),
        totalSales: active.paymentSummary.totalSales + txn.total,
      },
      categorySummary: {
        membership: active.categorySummary.membership + (isMembership ? txn.total : 0),
        retail: active.categorySummary.retail + (isRetail ? txn.total : 0),
        pt: active.categorySummary.pt + (isPt ? txn.total : 0),
        other: active.categorySummary.other + (!isMembership && !isRetail && !isPt ? txn.total : 0),
      },
      transactions: [...(active.transactions || []), txn.id],
    };

    gymStorage.saveShifts(shifts.map(s => s.id === active.id ? updatedShift : s));
  },

  // Cash Flow
  getCashFlow: (): CashFlowEntry[] => loadFromStorage(STORAGE_KEYS.CASH_FLOW, INITIAL_CASHFLOW),
  addCashFlow: (entry: CashFlowEntry) => {
    const current = gymStorage.getCashFlow();
    gymStorage.saveCashFlow([entry, ...current]);
  },
  saveCashFlow: (entries: CashFlowEntry[]) => saveToStorage(STORAGE_KEYS.CASH_FLOW, entries),

  // Trainers
  getTrainers: (): Trainer[] => loadFromStorage(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS),
  saveTrainers: (trainers: Trainer[]) => saveToStorage(STORAGE_KEYS.TRAINERS, trainers),

  // PT Bookings
  getPTBookings: (): PTSessionBooking[] => loadFromStorage(STORAGE_KEYS.PT_BOOKINGS, []),
  addPTBooking: (booking: PTSessionBooking) => {
    const current = gymStorage.getPTBookings();
    saveToStorage(STORAGE_KEYS.PT_BOOKINGS, [booking, ...current]);
    gymStorage.addAuditLog('Booking Personal Trainer', `${booking.memberName} memesan sesi dengan ${booking.trainerName} pada ${booking.date} jam ${booking.time}`);
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  addAuditLog: (action: string, details: string) => {
    const current = gymStorage.getAuditLogs();
    const role = gymStorage.getActiveRole();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: role === 'owner' ? 'Bambang (Pemilik)' : role === 'manager' ? 'Hendra (Manager)' : role === 'admin' ? 'Admin Front-Desk' : role === 'cashier' ? 'Dewi (Kasir)' : 'Coach Rian (Trainer)',
      role,
      action,
      details,
      ipAddress: '192.168.1.' + Math.floor(100 + Math.random() * 50),
    };
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...current.slice(0, 99)]);
  },

  // Active Role
  getActiveRole: (): UserRole => loadFromStorage(STORAGE_KEYS.ACTIVE_ROLE, 'owner'),
  setActiveRole: (role: UserRole) => {
    saveToStorage(STORAGE_KEYS.ACTIVE_ROLE, role);
    gymStorage.addAuditLog('Ganti Sesi Role', `Beralih ke hak akses akun: ${role.toUpperCase()}`);
  },

  // Scanner Config
  getScannerConfig: (): HardwareScannerConfig => loadFromStorage(STORAGE_KEYS.SCANNER_CONFIG, INITIAL_SCANNER_CONFIG),
  saveScannerConfig: (cfg: HardwareScannerConfig) => saveToStorage(STORAGE_KEYS.SCANNER_CONFIG, cfg),

  // Settings
  getSettings: (): GymSettings => loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  saveSettings: (settings: GymSettings) => saveToStorage(STORAGE_KEYS.SETTINGS, settings),

  // Reset to default
  resetToDefault: () => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
    window.dispatchEvent(new Event('aurora_storage_updated'));
  },
  resetData: () => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
    window.location.reload();
  }
};
