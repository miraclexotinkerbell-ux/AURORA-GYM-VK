import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  UserCheck, 
  FileText, 
  Settings, 
  Lock,
  QrCode,
  Dumbbell,
  X,
  LogOut
} from 'lucide-react';
import { AuthUser, UserRole } from '../types/gym';
import { ROLE_PERMISSIONS } from '../utils/helpers';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenCheckIn?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  currentUser,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  onOpenCheckIn,
}) => {
  const perm = ROLE_PERMISSIONS[activeRole];

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowed: perm.canAccessDashboard,
      badge: 'Live',
    },
    {
      id: 'members',
      label: 'Manajemen Member',
      icon: Users,
      allowed: perm.canAccessMembers,
      subLabel: 'Sesi Khusus & RFID',
    },
    {
      id: 'pos',
      label: 'Transaksi & POS',
      icon: ShoppingCart,
      allowed: perm.canAccessPOS,
      subLabel: 'Kasir & Retail',
    },
    {
      id: 'inventory',
      label: 'Stok Inventaris',
      icon: Package,
      allowed: perm.canAccessInventory,
      subLabel: 'Kontrol Real-time',
    },
    {
      id: 'trainers',
      label: 'Personal Trainer',
      icon: UserCheck,
      allowed: perm.canAccessTrainers,
      subLabel: 'Direktori & Sesi',
    },
    {
      id: 'reports',
      label: 'Laporan Keuangan',
      icon: FileText,
      allowed: perm.canAccessReports,
      subLabel: 'Arus Kas & P&L',
    },
    {
      id: 'settings',
      label: 'Pengaturan RBAC',
      icon: Settings,
      allowed: perm.canAccessSettings,
      subLabel: 'Paket & Hardware',
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#0F172A] text-slate-300 select-none">
      
      {/* Brand Header */}
      <div>
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <Dumbbell className="w-4 h-4 text-slate-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold tracking-tight text-base leading-tight">AURORA GYM</span>
              <span className="text-[10px] text-teal-400 font-mono tracking-wider">MANAGEMENT OS</span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Check-in Button */}
        {onOpenCheckIn && (
          <div className="p-3 pb-1">
            <button
              id="btn-sidebar-quick-scan"
              onClick={onOpenCheckIn}
              className="w-full py-2 px-3 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 font-bold text-xs rounded transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <QrCode className="w-3.5 h-3.5 text-teal-400" />
              <span>Terminal Scan RFID</span>
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Menu Operasional
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAllowed = item.allowed;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                disabled={!isAllowed}
                onClick={() => isAllowed && setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-400 rounded-r font-semibold'
                    : isAllowed
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r'
                    : 'text-slate-600 bg-slate-950/40 cursor-not-allowed opacity-50 rounded-r'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : isAllowed ? 'text-slate-400' : 'text-slate-600'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && isAllowed && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    {item.badge}
                  </span>
                )}

                {!isAllowed && (
                  <span title="Akses dibatasi oleh RBAC">
                    <Lock className="w-3 h-3 text-slate-600" />
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User / RBAC Profile Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-[#0B1120]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-bold text-xs shrink-0 uppercase">
              {currentUser ? currentUser.name.slice(0, 2) : activeRole === 'owner' ? 'OW' : activeRole === 'manager' ? 'MG' : activeRole === 'cashier' ? 'CS' : 'ST'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {currentUser?.name || 'Aditya Pratama'}
              </span>
              <span className="text-[10px] text-teal-400 font-mono uppercase tracking-wide truncate">
                {ROLE_PERMISSIONS[activeRole]?.title || 'Staff'}
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Keluar / Ganti Akun"
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

