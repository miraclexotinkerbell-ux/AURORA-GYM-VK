export type UserRole = 'owner' | 'manager' | 'admin' | 'cashier' | 'trainer';

export type SessionCategory = 'women_only' | 'men_only' | 'mixed';

export type MemberStatus = 'active' | 'expiring' | 'expired' | 'suspended';

export type Gender = 'female' | 'male';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  shift?: string;
  badge: string;
  password?: string;
  lastLogin?: string;
}

export interface CashierShift {
  id: string;
  shiftNumber: string;
  cashierId: string;
  cashierName: string;
  shiftType: 'Pagi (06:00 - 14:00)' | 'Sore (14:00 - 22:00)' | 'Full Day (06:00 - 22:00)' | 'Custom';
  startTime: string;
  endTime?: string;
  status: 'open' | 'closed';
  startingCash: number; // Modal Awal Kas
  expectedCash: number; // Modal Awal + Total Penjualan Tunai + Kas Masuk - Kas Keluar
  actualCash?: number;  // Uang Fisik Dihitung di Laci saat Tutup Shift
  cashDifference?: number; // actualCash - expectedCash (0 = Pas, <0 = Kurang, >0 = Lebih)
  differenceReason?: string;
  paymentSummary: {
    cash: number;
    qris: number;
    bank_transfer: number;
    debit_card: number;
    totalSales: number;
  };
  categorySummary: {
    membership: number;
    retail: number;
    pt: number;
    other: number;
  };
  totalTransactions: number;
  cashIn: number;
  cashOut: number;
  notes?: string;
  handoverTo?: string;
  closedBy?: string;
  transactions?: string[];
}

export interface Member {
  id: string;
  name: string;
  gender: Gender;
  phone: string;
  email: string;
  avatar: string;
  barcode: string;
  sessionCategory: SessionCategory;
  packageId: string;
  packageName: string;
  joinDate: string;
  startDate: string;
  endDate: string;
  status: MemberStatus;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  notes?: string;
  totalCheckIns: number;
  lastCheckIn?: string;
  balanceOrDeposit?: number;
}

export interface CheckInRecord {
  id: string;
  memberId: string;
  memberName: string;
  barcode: string;
  gender: Gender;
  sessionCategory: SessionCategory;
  checkInTime: string;
  checkOutTime?: string;
  lockerNumber?: number;
  status: 'inside' | 'completed' | 'denied';
  denialReason?: string;
  checkedInBy: string;
}

export interface GymSessionSchedule {
  id: string;
  category: SessionCategory;
  name: string;
  startTime: string; // e.g. "06:00"
  endTime: string;   // e.g. "11:00"
  days: string[];    // e.g. ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
  currentOccupancy: number;
  maxCapacity: number;
  description: string;
  color: string;
  isActiveNow?: boolean;
}

export interface MembershipPackage {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  allowedSession: SessionCategory | 'all';
  description: string;
  benefits: string[];
  isPopular?: boolean;
  discountPercent?: number;
}

export interface RetailProduct {
  id: string;
  sku: string;
  name: string;
  category: 'Beverages' | 'Supplements' | 'Snacks' | 'Merchandise' | 'Accessories';
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStockAlert: number;
  image: string;
  barcode: string;
  soldCount: number;
}

export interface CartItem {
  product: RetailProduct;
  quantity: number;
}

export interface TransactionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  category?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string;
  type: 'membership_reg' | 'membership_renew' | 'pos_retail' | 'pt_booking' | 'fine';
  customerName: string;
  customerPhone?: string;
  memberId?: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'qris' | 'bank_transfer' | 'debit_card';
  cashierName: string;
  cashierId?: string;
  shiftId?: string;
  notes?: string;
  status: 'paid' | 'pending' | 'void';
}

export interface CashFlowEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 'Membership' | 'Retail POS' | 'PT Session' | 'Gaji Karyawan' | 'Listrik & Utilitas' | 'Maintenance Alat' | 'Sewa Tempat' | 'Restock Barang' | 'Lain-lain';
  amount: number;
  description: string;
  performedBy: string;
  referenceId?: string;
}

export interface Trainer {
  id: string;
  name: string;
  gender: Gender;
  photo: string;
  specialties: string[];
  certification: string;
  rating: number;
  reviewCount: number;
  totalClients: number;
  sessionRate: number;
  monthlyRate: number;
  status: 'available' | 'in_session' | 'day_off';
  phone: string;
  bio: string;
  availableSchedule: { day: string; hours: string }[];
}

export interface PTSessionBooking {
  id: string;
  trainerId: string;
  trainerName: string;
  memberId: string;
  memberName: string;
  date: string;
  time: string;
  durationMinutes: number;
  topic: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress: string;
}

export interface HardwareScannerConfig {
  enabled: boolean;
  mode: 'keyboard_wedge' | 'camera' | 'usb_serial';
  autoCheckInOnScan: boolean;
  playBeep: boolean;
  scannerPort: string;
  baudRate: number;
  allowOverrideOnMismatch: boolean;
}

export interface GymSettings {
  gymName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  taxRate: number;
  sessionSchedules: {
    womenOnly: string;
    menOnly: string;
    mixed: string;
  };
  hardware: {
    barcodeScannerEnabled: boolean;
    turnstileGateIntegration: boolean;
    soundEffectsEnabled: boolean;
    relayPulseDurationMs: number;
    receiptPrinterType: '58mm' | '80mm' | 'none';
  };
}

export interface RolePermission {
  role: UserRole;
  title: string;
  description: string;
  canAccessDashboard: boolean;
  canAccessMembers: boolean;
  canEditMembers: boolean;
  canAccessPOS: boolean;
  canAccessInventory: boolean;
  canEditInventory: boolean;
  canAccessTrainers: boolean;
  canAccessReports: boolean;
  canAccessSettings: boolean;
  canManagePackages: boolean;
  canVoidTransactions: boolean;
}
