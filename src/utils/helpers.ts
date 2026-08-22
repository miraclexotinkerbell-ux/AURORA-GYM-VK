import { GymSessionSchedule, RolePermission, SessionCategory, UserRole } from '../types/gym';

export const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const getIndonesianDayName = (date: Date = new Date()): string => {
  const dayIndex = date.getDay(); // 0 = Minggu, 1 = Senin, ... 6 = Sabtu
  const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return indonesianDays[dayIndex];
};

export const isWeekendDay = (dayName: string): boolean => {
  return dayName === 'Sabtu' || dayName === 'Minggu';
};

export const getCurrentActiveSession = (
  schedules: GymSessionSchedule[],
  customDate: Date = new Date()
): {
  activeSchedule: GymSessionSchedule | null;
  currentDay: string;
  currentTimeStr: string;
  isWeekend: boolean;
  todaySchedules: GymSessionSchedule[];
} => {
  const currentDay = getIndonesianDayName(customDate);
  const isWeekend = isWeekendDay(currentDay);
  const hours = String(customDate.getHours()).padStart(2, '0');
  const minutes = String(customDate.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${hours}:${minutes}`;

  // Find all schedules valid for today
  const todaySchedules = schedules.filter(s => s.days && s.days.includes(currentDay));

  // Find schedule matching current time
  const activeSchedule = todaySchedules.find(s => {
    return currentTimeStr >= s.startTime && currentTimeStr <= s.endTime;
  }) || (todaySchedules.length > 0 ? todaySchedules[0] : null);

  return {
    activeSchedule,
    currentDay,
    currentTimeStr,
    isWeekend,
    todaySchedules,
  };
};

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateID = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatDateTimeID = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const getSessionBadge = (category: SessionCategory): { label: string; bg: string; text: string; border: string } => {
  switch (category) {
    case 'women_only':
      return {
        label: 'Sesi Khusus Perempuan',
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        border: 'border-pink-200',
      };
    case 'men_only':
      return {
        label: 'Sesi Khusus Laki-laki',
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
      };
    case 'mixed':
    default:
      return {
        label: 'Sesi Gabungan (All-Gender)',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
      };
  }
};

export const getDaysRemaining = (endDateStr: string): number => {
  const end = new Date(endDateStr);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const createWhatsAppRenewalLink = (phone?: string, name?: string, daysLeft: number = 0, packageName?: string): string => {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const finalPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : (cleanPhone || '6281200000000');
  const message = `Halo Kak ${name || 'Member'}! 🏋️\n\nKami dari *Aurora Gym* ingin menginfokan bahwa masa aktif membership Anda (${packageName || 'Membership'}) tersisa *${daysLeft <= 0 ? 'SUDAH HABIS' : `${daysLeft} hari lagi`}*.\n\nAgar tetap lancar berolahraga dan mengunci kuota sesi latihan Anda, yuk perpanjang membership hari ini dan dapatkan bonus free shaker/diskon khusus perpanjangan!\n\n_Salam Sehat,_\n*Aurora Gym Management*`;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
};

export const createWhatsAppReceiptLink = (phone?: string, invoiceNumber?: string, customerName?: string, total: number = 0): string => {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const finalPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : (cleanPhone || '6281200000000');
  const message = `Halo Kak ${customerName || 'Pelanggan'}! 🧾\n\nTerima kasih atas transaksi Anda di *Aurora Gym*.\n\n*No. Invoice:* ${invoiceNumber || 'INV'}\n*Total Pembayaran:* ${formatRupiah(total)}\n*Status:* LUNAS (PAID)\n\nKuitansi digital ini resmi diterbitkan oleh sistem kasir Aurora Gym. Simpan struk ini sebagai bukti pembayaran yang sah.\n\n_Terima kasih dan selamat berlatih!_\n*Aurora Gym*`;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermission> = {
  owner: {
    role: 'owner',
    title: 'Pemilik Gym (Owner)',
    description: 'Akses penuh ke seluruh modul, pembagian hasil, master paket, staf, dan audit log.',
    canAccessDashboard: true,
    canAccessMembers: true,
    canEditMembers: true,
    canAccessPOS: true,
    canAccessInventory: true,
    canEditInventory: true,
    canAccessTrainers: true,
    canAccessReports: true,
    canAccessSettings: true,
    canManagePackages: true,
    canVoidTransactions: true,
  },
  manager: {
    role: 'manager',
    title: 'Manager Operasional',
    description: 'Mengelola operasional harian, pendaftaran, stok, kehadiran, dan jadwal sesi.',
    canAccessDashboard: true,
    canAccessMembers: true,
    canEditMembers: true,
    canAccessPOS: true,
    canAccessInventory: true,
    canEditInventory: true,
    canAccessTrainers: true,
    canAccessReports: true,
    canAccessSettings: true,
    canManagePackages: true,
    canVoidTransactions: true,
  },
  admin: {
    role: 'admin',
    title: 'Admin Front-Desk',
    description: 'Pendaftaran member baru, check-in kehadiran, booking trainer, dan POS retail.',
    canAccessDashboard: true,
    canAccessMembers: true,
    canEditMembers: true,
    canAccessPOS: true,
    canAccessInventory: true,
    canEditInventory: false,
    canAccessTrainers: true,
    canAccessReports: false,
    canAccessSettings: false,
    canManagePackages: false,
    canVoidTransactions: false,
  },
  cashier: {
    role: 'cashier',
    title: 'Kasir Retail & POS',
    description: 'Transaksi retail F&B, perpanjangan paket, dan pencetakan kuitansi.',
    canAccessDashboard: false,
    canAccessMembers: true,
    canEditMembers: false,
    canAccessPOS: true,
    canAccessInventory: true,
    canEditInventory: false,
    canAccessTrainers: false,
    canAccessReports: false,
    canAccessSettings: false,
    canManagePackages: false,
    canVoidTransactions: false,
  },
  trainer: {
    role: 'trainer',
    title: 'Personal Trainer (PT)',
    description: 'Melihat direktori trainer, jadwal latihan klien binaan, dan log check-in member.',
    canAccessDashboard: false,
    canAccessMembers: true,
    canEditMembers: false,
    canAccessPOS: false,
    canAccessInventory: false,
    canEditInventory: false,
    canAccessTrainers: true,
    canAccessReports: false,
    canAccessSettings: false,
    canManagePackages: false,
    canVoidTransactions: false,
  },
};
