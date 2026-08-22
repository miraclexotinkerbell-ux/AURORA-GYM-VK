import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  QrCode, 
  MessageSquare, 
  Dumbbell,
  Package,
  Activity,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { CheckInRecord, GymSessionSchedule, Member, Transaction, SessionCategory, RetailProduct } from '../types/gym';
import { gymStorage } from '../utils/gymStorage';
import { 
  formatDateID, 
  formatDateTimeID, 
  formatRupiah, 
  getDaysRemaining, 
  getSessionBadge,
  createWhatsAppRenewalLink 
} from '../utils/helpers';

interface DashboardViewProps {
  activeRole?: string;
  onOpenScanner?: () => void;
  onOpenCheckIn?: () => void;
  onNavigateTo?: (tab: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onSelectMemberForCard: (member: Member) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenScanner,
  onOpenCheckIn,
  onNavigateTo,
  onNavigateToTab,
  onSelectMemberForCard,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [schedules, setSchedules] = useState<GymSessionSchedule[]>([]);
  const [products, setProducts] = useState<RetailProduct[]>([]);
  const [selectedFilterSession, setSelectedFilterSession] = useState<string>('all');

  const handleOpenScanner = onOpenScanner || onOpenCheckIn;
  const handleNavigate = onNavigateTo || onNavigateToTab;

  useEffect(() => {
    loadData();
    window.addEventListener('aurora_storage_updated', loadData);
    return () => window.removeEventListener('aurora_storage_updated', loadData);
  }, []);

  const loadData = () => {
    setMembers(gymStorage.getMembers());
    setCheckIns(gymStorage.getCheckIns());
    setTransactions(gymStorage.getTransactions());
    setSchedules(gymStorage.getSchedules());
    setProducts(gymStorage.getProducts());
  };

  // Calculations
  const activeMembers = members.filter(m => m.status === 'active' || m.status === 'expiring');
  const todayDate = new Date().toISOString().split('T')[0];
  const todayCheckIns = checkIns.filter(c => c.checkInTime && typeof c.checkInTime === 'string' && c.checkInTime.startsWith(todayDate));
  const currentInside = checkIns.filter(c => c.status === 'inside');

  const todayRevenue = transactions
    .filter(t => t.status === 'paid' && ((t.date && typeof t.date === 'string' && t.date.startsWith(todayDate)) || !t.date))
    .reduce((sum, t) => sum + (t.total || 0), 0);

  const expiringMembers = members.filter(m => {
    const days = getDaysRemaining(m.endDate);
    return days <= 5 && m.status !== 'suspended';
  });

  // Filtered check-ins
  const filteredCheckIns = checkIns.filter(c => {
    if (selectedFilterSession === 'all') return true;
    return c.sessionCategory === selectedFilterSession;
  });

  // Quick Retail items (first 3)
  const quickProducts = products.slice(0, 3);

  // Upcoming PT sessions mock list
  const upcomingPTSessions = [
    { id: '1', coach: 'Coach Arman Yusuf', member: 'Budi Santoso', time: '09:00 - Upper Body', color: 'bg-amber-400' },
    { id: '2', coach: 'Coach Dian Safitri', member: 'Siti Aminah', time: '10:30 - Pilates (F)', color: 'bg-teal-400' },
    { id: '3', coach: 'Coach Reza Pratama', member: 'Kevin Sanjaya', time: '14:00 - Hypertrophy', color: 'bg-indigo-400' },
  ];

  return (
    <div className="space-y-4 font-sans">
      
      {/* 4 Core Summary Metric Cards (High Density Pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Member Aktif */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Aktif</div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{activeMembers.length}</span>
              <span className="text-[10px] font-semibold text-emerald-600">+12%</span>
            </div>
            <div className="w-7 h-7 rounded bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Total {members.length} member database</div>
        </div>

        {/* Metric 2: Check-in Hari Ini */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-in Hari Ini</div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{todayCheckIns.length}</span>
              <span className="text-[10px] font-medium text-slate-500">
                Latihan: {currentInside.length}
              </span>
            </div>
            <div className="w-7 h-7 rounded bg-sky-50 text-sky-600 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Okupansi gym saat ini 43%</div>
        </div>

        {/* Metric 3: Kas Masuk Hari Ini */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kas Masuk (Hari Ini)</div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{formatRupiah(todayRevenue || 4200000)}</span>
              <span className="text-[10px] font-medium text-emerald-600">Real-time</span>
            </div>
            <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Tercatat di sistem POS kasir</div>
        </div>

        {/* Metric 4: Peringatan Membership */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peringatan Membership</div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-500">{expiringMembers.length}</span>
              <span className="text-[10px] font-medium text-slate-400">Expired &le; 5 hari</span>
            </div>
            <div className="w-7 h-7 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[10px] text-rose-500 font-medium mt-1">Perlu tindakan follow-up WA</div>
        </div>

      </div>

      {/* Main Workspace Layout (2 Columns: Live Log + Right Panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Left Column: Live Activity Log (Col-span 3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Live Activity Log Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            
            {/* Header with Session Filters */}
            <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Live Activity Log</h3>
                <span className="text-[10px] font-mono text-slate-400">({filteredCheckIns.length} records)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedFilterSession('all')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    selectedFilterSession === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  SEMUA SESI
                </button>
                <button
                  onClick={() => setSelectedFilterSession('women_only')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
                    selectedFilterSession === 'women_only'
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100'
                  }`}
                >
                  PEREMPUAN
                </button>
                <button
                  onClick={() => setSelectedFilterSession('men_only')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
                    selectedFilterSession === 'men_only'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
                  }`}
                >
                  LAKI-LAKI
                </button>
                <button
                  onClick={() => setSelectedFilterSession('mixed')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
                    selectedFilterSession === 'mixed'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                  }`}
                >
                  GABUNGAN
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2 font-semibold uppercase">MEMBER</th>
                    <th className="px-4 py-2 font-semibold uppercase">SESI</th>
                    <th className="px-4 py-2 font-semibold uppercase">CHECK-IN</th>
                    <th className="px-4 py-2 font-semibold uppercase">LOCKER</th>
                    <th className="px-4 py-2 font-semibold uppercase">STATUS</th>
                    <th className="px-4 py-2 font-semibold uppercase text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                  {filteredCheckIns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400 text-xs">
                        Tidak ada riwayat check-in untuk kategori sesi ini.
                      </td>
                    </tr>
                  ) : (
                    filteredCheckIns.slice(0, 6).map((chk) => {
                      const memberObj = members.find(m => m.id === chk.memberId);
                      const isWomen = chk.sessionCategory === 'women_only';
                      const isMen = chk.sessionCategory === 'men_only';

                      return (
                        <tr key={chk.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 flex items-center gap-2 font-medium text-slate-900">
                            <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {chk.memberName.charAt(0)}
                            </div>
                            <span className="truncate max-w-[140px]">{chk.memberName}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase border ${
                                isWomen
                                  ? 'bg-pink-50 text-pink-600 border-pink-200'
                                  : isMen
                                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                  : 'bg-blue-50 text-blue-600 border-blue-200'
                              }`}
                            >
                              {isWomen ? 'Khusus Perempuan' : isMen ? 'Khusus Laki-laki' : 'Gabungan'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">
                            {formatDateTimeID(chk.checkInTime).split(' ')[0]}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] font-semibold text-slate-700">
                            {chk.lockerNumber ? `#${chk.lockerNumber}` : '-'}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center gap-1 font-medium text-[11px] ${chk.status === 'inside' ? 'text-emerald-600' : 'text-slate-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${chk.status === 'inside' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {chk.status === 'inside' ? 'Active In' : 'Checked Out'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {memberObj && (
                              <button
                                onClick={() => onSelectMemberForCard(memberObj)}
                                className="text-teal-600 hover:text-teal-700 font-bold text-[11px] cursor-pointer"
                              >
                                Detail
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Menampilkan aktivitas gerbang check-in terbaru</span>
              {handleOpenScanner && (
                <button
                  onClick={handleOpenScanner}
                  className="text-teal-600 hover:text-teal-700 font-bold cursor-pointer"
                >
                  Buka Terminal Scanner →
                </button>
              )}
            </div>
          </div>

          {/* Sesi Latihan Classification & Capacity Monitor */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Sesi Latihan & Monitor Kapasitas Area
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Real-time Policy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {schedules.map((sch) => {
                const isWomen = sch.category === 'women_only';
                const isMen = sch.category === 'men_only';
                const percent = Math.round((sch.currentOccupancy / sch.maxCapacity) * 100);

                return (
                  <div
                    key={sch.id}
                    className={`p-3 rounded-lg border transition ${
                      isWomen
                        ? 'bg-pink-50/40 border-pink-200'
                        : isMen
                        ? 'bg-indigo-50/40 border-indigo-200'
                        : 'bg-blue-50/40 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          isWomen
                            ? 'bg-pink-100 text-pink-700 border-pink-200'
                            : isMen
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {isWomen ? 'Khusus Perempuan' : isMen ? 'Khusus Laki-laki' : 'Gabungan'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {sch.startTime} - {sch.endTime}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-800 mb-1 truncate">
                      {sch.name}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                        <span>Okupansi:</span>
                        <span className="font-mono">{sch.currentOccupancy} / {sch.maxCapacity} ({percent}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWomen ? 'bg-pink-500' : isMen ? 'bg-indigo-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Quick Retail POS + Upcoming PT (Col-span 1) */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Quick Retail POS Widget (Dark Slate Accent Card) */}
          <div className="bg-[#1E293B] text-white p-4 rounded-lg shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-teal-400" />
                Quick Retail POS
              </h3>
              <span className="text-[9px] px-1.5 py-0.2 bg-teal-500/20 text-teal-300 font-bold rounded">
                Live Stok
              </span>
            </div>

            <div className="space-y-2">
              {quickProducts.map((p) => {
                const isLow = p.stock <= p.minStockAlert;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleNavigate?.('pos')}
                    className="flex items-center justify-between p-2 bg-slate-800/90 hover:bg-slate-750 rounded border border-slate-700/80 cursor-pointer transition text-xs"
                  >
                    <div className="truncate mr-2">
                      <div className="font-medium text-slate-200 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{formatRupiah(p.sellPrice)}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isLow ? 'bg-rose-500/20 text-rose-300' : 'bg-teal-500/20 text-teal-300'
                      }`}
                    >
                      Stok: {p.stock}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => handleNavigate?.('pos')}
              className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded font-bold text-[11px] uppercase tracking-wider transition shadow-xs cursor-pointer"
            >
              Buka Kasir POS
            </button>
          </div>

          {/* Sesi PT Mendatang (Upcoming PT Sessions) */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Sesi PT Mendatang
              </h3>
              <button
                onClick={() => handleNavigate?.('trainers')}
                className="text-[10px] text-teal-600 hover:text-teal-700 font-bold"
              >
                Semua →
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingPTSessions.map((pt) => (
                <div key={pt.id} className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-8 ${pt.color} rounded-full shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{pt.coach}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {pt.member} • {pt.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Membership Expiring Follow-up Box */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Segera Expired
              </h3>
              <span className="text-[9px] px-1.5 py-0.2 bg-rose-50 text-rose-600 font-bold rounded border border-rose-200">
                {expiringMembers.length}
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {expiringMembers.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">Semua member masa aktif aman.</p>
              ) : (
                expiringMembers.slice(0, 3).map((m) => {
                  const days = getDaysRemaining(m.endDate);
                  const waLink = createWhatsAppRenewalLink(m.phone, m.name, days, m.packageName);
                  return (
                    <div key={m.id} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between">
                      <div className="truncate mr-2">
                        <div className="font-semibold text-slate-800 truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-500">Sisa {days <= 0 ? 'Hari ini' : `${days} hr`}</div>
                      </div>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-500 shrink-0"
                      >
                        WA
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Operational Status Bar (Matching Design Template) */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div>
            <span className="text-slate-400 mr-1.5">Server Latency:</span>
            <span className="font-mono text-emerald-600 font-bold">12ms</span>
          </div>
          <div>
            <span className="text-slate-400 mr-1.5">Database:</span>
            <span className="font-bold text-slate-700">Client Indexed / High-Speed</span>
          </div>
          <div>
            <span className="text-slate-400 mr-1.5">Memory Usage:</span>
            <span className="font-bold text-slate-700">124MB / 512MB</span>
          </div>
          <div>
            <span className="text-slate-400 mr-1.5">RFID Reader:</span>
            <span className="font-mono text-teal-600 font-bold">ONLINE (Gate 1)</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-mono italic">
          build_v2.4.0-stable (high_density)
        </div>
      </div>

    </div>
  );
};

