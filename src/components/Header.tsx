import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  QrCode, 
  Bell, 
  ShieldCheck, 
  ChevronDown, 
  AlertTriangle,
  UserCheck,
  Menu,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { AuthUser, UserRole } from '../types/gym';
import { gymStorage } from '../utils/gymStorage';
import { ROLE_PERMISSIONS, getDaysRemaining } from '../utils/helpers';

interface HeaderProps {
  activeTab?: string;
  activeRole: UserRole;
  currentUser?: AuthUser | null;
  onRoleChange: (role: UserRole) => void;
  onLogout?: () => void;
  onOpenScanner?: () => void;
  onOpenCheckIn?: () => void;
  onToggleMobileSidebar?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'dashboard',
  activeRole,
  currentUser,
  onRoleChange,
  onLogout,
  onOpenScanner,
  onOpenCheckIn,
  onToggleMobileSidebar,
  onNavigateToTab,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [expiringMembers, setExpiringMembers] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  const handleOpenScanner = onOpenScanner || onOpenCheckIn;

  const tabTitles: Record<string, string> = {
    dashboard: 'Operational Dashboard',
    members: 'Member Management & RFID Gates',
    pos: 'Point of Sales & Retail Cashier',
    inventory: 'Inventory & Stock Control',
    trainers: 'Personal Trainer Directory',
    reports: 'Financial Reports & P&L',
    settings: 'System & RBAC Settings',
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' WIB'
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkAlerts = () => {
      const members = gymStorage.getMembers();
      const expiring = members.filter(m => {
        const days = getDaysRemaining(m.endDate);
        return days <= 5 && m.status !== 'suspended';
      });
      setExpiringMembers(expiring);

      const products = gymStorage.getProducts();
      const lowStock = products.filter(p => p.stock <= p.minStockAlert);
      setLowStockProducts(lowStock);
    };

    checkAlerts();
    window.addEventListener('aurora_storage_updated', checkAlerts);
    return () => window.removeEventListener('aurora_storage_updated', checkAlerts);
  }, []);

  const totalAlerts = expiringMembers.length + lowStockProducts.length;
  const currentRoleInfo = ROLE_PERMISSIONS[activeRole];

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-xs">
      
      {/* Left side: Mobile Toggle + Title + Status Pill */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">
            {tabTitles[activeTab] || 'Operational Dashboard'}
          </h1>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </div>

      {/* Right side: Domain Info, Clock, Quick Scanner, Alerts, Role Switcher */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Custom Domain Info */}
        <div className="hidden md:block text-[11px] text-slate-400">
          Custom Domain: <span className="text-teal-600 font-mono font-medium">admin.auroragym.com</span>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{currentTime}</span>
        </div>

        {/* Quick Check-In Terminal Button */}
        {handleOpenScanner && (
          <button
            id="btn-quick-checkin-header"
            onClick={handleOpenScanner}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Buka Terminal Scanner RFID / Barcode (F2)"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scanner Check-In</span>
            <span className="sm:hidden">Scan</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="btn-notifications-toggle"
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowRoleMenu(false);
            }}
            className="h-8 w-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors relative cursor-pointer"
            title="Pemberitahuan & Alert"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wide">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  Live Operational Alerts ({totalAlerts})
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 mt-2.5 pr-1">
                {totalAlerts === 0 ? (
                  <div className="text-center py-5 text-slate-400 text-xs">
                    <UserCheck className="w-6 h-6 mx-auto text-emerald-500 mb-1 opacity-80" />
                    Semua sistem normal. Tidak ada alert mendesak.
                  </div>
                ) : (
                  <>
                    {/* Expiring Members */}
                    {expiringMembers.map(m => {
                      const days = getDaysRemaining(m.endDate);
                      return (
                        <div 
                          key={m.id}
                          className="p-2.5 rounded-md bg-amber-50 border border-amber-200 flex items-start justify-between gap-2"
                        >
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-1 font-bold text-amber-800">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Member Habis: {m.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              {m.packageName} • Sisa {days <= 0 ? 'Hari ini' : `${days} hari`}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setShowNotifMenu(false);
                              onNavigateToTab?.('members');
                            }}
                            className="text-[10px] px-2 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-900 rounded font-semibold transition cursor-pointer"
                          >
                            Perpanjang
                          </button>
                        </div>
                      );
                    })}

                    {/* Low Stock Products */}
                    {lowStockProducts.map(p => (
                      <div 
                        key={p.id}
                        className="p-2.5 rounded-md bg-rose-50 border border-rose-200 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1 font-bold text-rose-800">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Stok Menipis: {p.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Sisa {p.stock} pcs (Min: {p.minStockAlert} pcs)
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setShowNotifMenu(false);
                            onNavigateToTab?.('inventory');
                          }}
                          className="text-[10px] px-2 py-1 bg-rose-200/80 hover:bg-rose-300 text-rose-900 rounded font-semibold transition cursor-pointer"
                        >
                          Restock
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RBAC Role & User Profile Switcher */}
        <div className="relative">
          <button
            id="btn-role-switcher-toggle"
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] uppercase">
              {currentUser ? currentUser.name.slice(0, 2) : activeRole.slice(0, 2)}
            </div>
            <div className="text-left hidden sm:block leading-tight">
              <div className="text-[11px] font-bold text-slate-900 truncate max-w-[100px]">
                {currentUser?.name || currentRoleInfo.title.split(' ')[0]}
              </div>
              <div className="text-[9px] text-teal-700 font-mono capitalize">
                {currentRoleInfo.title.split(' ')[0]}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Role Switcher & User Menu */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {currentUser && (
                <div className="p-2 bg-slate-50 rounded-md border border-slate-200 mb-2">
                  <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{currentUser.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[10px] font-bold uppercase font-mono">
                      Posisi: {currentUser.role}
                    </span>
                    {currentUser.shift && (
                      <span className="text-[10px] text-slate-500">
                        ({currentUser.shift})
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Simulasi / Screening Posisi (RBAC)
              </div>
              <div className="space-y-1 mt-1 max-h-56 overflow-y-auto">
                {(Object.keys(ROLE_PERMISSIONS) as UserRole[]).map((r) => {
                  const info = ROLE_PERMISSIONS[r];
                  const isSelected = activeRole === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        onRoleChange(r);
                        gymStorage.setActiveRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded text-xs transition flex items-start gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50 text-teal-900 border border-teal-200 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="truncate">{info.title}</span>
                          {isSelected && (
                            <span className="text-[8px] px-1 py-0.2 bg-teal-500 text-white font-bold rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {info.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {onLogout && (
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onLogout();
                    }}
                    className="w-full py-1.5 px-2.5 rounded text-xs font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out & Ganti Akun</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dedicated Quick Logout button on desktop */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Keluar / Ganti Akun"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        )}

      </div>

    </header>
  );
};

