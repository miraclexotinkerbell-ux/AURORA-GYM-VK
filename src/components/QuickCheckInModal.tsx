import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  LogOut, 
  Sparkles, 
  Volume2, 
  KeyRound,
  User,
  Users,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  CreditCard,
  Barcode
} from 'lucide-react';
import { CheckInRecord, Member, SessionCategory } from '../types/gym';
import { gymStorage } from '../utils/gymStorage';
import { soundFx } from '../utils/audio';
import { formatDateID, formatDateTimeID, getDaysRemaining, getSessionBadge } from '../utils/helpers';

interface QuickCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRenew?: (memberId: string) => void;
  onSelectMemberForCard?: (member: Member) => void;
}

export const QuickCheckInModal: React.FC<QuickCheckInModalProps> = ({
  isOpen,
  onClose,
  onNavigateToRenew,
}) => {
  const [query, setQuery] = useState<string>('');
  const [resultMessage, setResultMessage] = useState<{
    type: 'success' | 'denied' | 'checkout';
    title: string;
    description: string;
    member?: Member;
    locker?: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'scan' | 'active_now' | 'history'>('scan');
  const [activeCheckIns, setActiveCheckIns] = useState<CheckInRecord[]>([]);
  const [selectedLocker, setSelectedLocker] = useState<number>(() => Math.floor(1 + Math.random() * 45));
  const inputRef = useRef<HTMLInputElement>(null);

  // Active current gym session (Mock simulation of active session)
  const currentGymSession: { name: string; category: SessionCategory; hours: string } = {
    name: 'Sesi Khusus Perempuan (Morning Glow)',
    category: 'women_only',
    hours: '06:00 - 10:00 WIB',
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const loadData = () => {
    const checkIns = gymStorage.getCheckIns();
    setActiveCheckIns(checkIns.filter(c => c.status === 'inside'));
  };

  if (!isOpen) return null;

  const handleProcessScan = (barcodeOrQuery: string) => {
    const clean = barcodeOrQuery.trim().toLowerCase();
    if (!clean) return;

    soundFx.playScanBeep();

    const members = gymStorage.getMembers();
    const checkIns = gymStorage.getCheckIns();

    // Helper to sanitize phone digits
    const cleanDigits = clean.replace(/\D/g, '');

    // Find member by barcode, ID, phone, email, or name
    const member = members.find(m => {
      const mBarcode = m.barcode.toLowerCase();
      const mId = m.id.toLowerCase();
      const mName = m.name.toLowerCase();
      const mEmail = (m.email || '').toLowerCase();
      const mPhoneDigits = (m.phone || '').replace(/\D/g, '');

      // 1. Barcode match
      if (mBarcode === clean || mBarcode.includes(clean)) return true;

      // 2. Member ID match
      if (mId === clean || mId.includes(clean)) return true;

      // 3. Email match
      if (mEmail && (mEmail === clean || mEmail.includes(clean))) return true;

      // 4. Phone number match (flexible with country code 62 / 0)
      if (cleanDigits.length >= 4) {
        if (mPhoneDigits.includes(cleanDigits) || cleanDigits.includes(mPhoneDigits)) return true;
        const strippedClean = cleanDigits.replace(/^(62|0)/, '');
        const strippedMPhone = mPhoneDigits.replace(/^(62|0)/, '');
        if (strippedClean && strippedMPhone.includes(strippedClean)) return true;
      }

      // 5. Name match (contains query)
      if (mName.includes(clean)) return true;

      return false;
    });

    if (!member) {
      soundFx.playDeniedBuzz();
      setResultMessage({
        type: 'denied',
        title: 'Member Tidak Ditemukan',
        description: `Tidak ditemukan member dengan Barcode, No HP, Email, atau ID "${barcodeOrQuery}". Silakan periksa kembali.`,
      });
      return;
    }

    // Check if already checked in
    const existingActive = checkIns.find(c => c.memberId === member.id && c.status === 'inside');
    if (existingActive) {
      // Prompt for Check-out
      gymStorage.checkOutMember(existingActive.id);
      soundFx.playSuccessChime();
      setResultMessage({
        type: 'checkout',
        title: 'Check-Out Berhasil!',
        description: `${member.name} telah check-out dari gym. Locker #${existingActive.lockerNumber || '-'} telah dikosongkan.`,
        member,
      });
      loadData();
      setQuery('');
      return;
    }

    // Validation 1: Membership status (Expired or Suspended)
    const daysLeft = getDaysRemaining(member.endDate);
    if (member.status === 'expired' || daysLeft < 0) {
      soundFx.playDeniedBuzz();
      setResultMessage({
        type: 'denied',
        title: 'Akses Ditolak: Membership Expired',
        description: `Masa aktif paket ${member.packageName} telah habis sejak ${formatDateID(member.endDate)}. Silakan lakukan perpanjangan.`,
        member,
      });
      gymStorage.addCheckIn({
        id: `chk-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        barcode: member.barcode,
        gender: member.gender,
        sessionCategory: member.sessionCategory,
        checkInTime: new Date().toISOString(),
        status: 'denied',
        denialReason: 'Membership Expired',
        checkedInBy: 'Scanner Terminal',
      });
      loadData();
      return;
    }

    if (member.status === 'suspended') {
      soundFx.playDeniedBuzz();
      setResultMessage({
        type: 'denied',
        title: 'Akses Ditolak: Akun Suspended',
        description: `Status member sedang ditangguhkan. Hubungi manager frontdesk.`,
        member,
      });
      gymStorage.addCheckIn({
        id: `chk-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        barcode: member.barcode,
        gender: member.gender,
        sessionCategory: member.sessionCategory,
        checkInTime: new Date().toISOString(),
        status: 'denied',
        denialReason: 'Account Suspended',
        checkedInBy: 'Scanner Terminal',
      });
      loadData();
      return;
    }

    // Validation 2: Session Classification Check (Women Only vs Men Only vs Mixed)
    const isSessionMismatch = 
      currentGymSession.category === 'women_only' && member.gender === 'male' && member.sessionCategory !== 'mixed';

    if (isSessionMismatch) {
      soundFx.playDeniedBuzz();
      setResultMessage({
        type: 'denied',
        title: 'Akses Ditolak: Sesi Khusus Perempuan',
        description: `Jadwal gym saat ini adalah "Sesi Khusus Perempuan" (06:00 - 10:00). Member pria dengan paket Sesi Khusus Laki-laki dapat masuk pada sesi 10:30 WIB.`,
        member,
      });
      gymStorage.addCheckIn({
        id: `chk-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        barcode: member.barcode,
        gender: member.gender,
        sessionCategory: member.sessionCategory,
        checkInTime: new Date().toISOString(),
        status: 'denied',
        denialReason: 'Ketidaksesuaian Sesi Khusus Gender',
        checkedInBy: 'Scanner Terminal',
      });
      loadData();
      return;
    }

    // SUCCESS CHECK-IN
    const newLocker = Math.floor(1 + Math.random() * 48);
    setSelectedLocker(newLocker);

    const newRecord: CheckInRecord = {
      id: `chk-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      barcode: member.barcode,
      gender: member.gender,
      sessionCategory: member.sessionCategory,
      checkInTime: new Date().toISOString(),
      lockerNumber: newLocker,
      status: 'inside',
      checkedInBy: 'Scanner Terminal (F2)',
    };

    gymStorage.addCheckIn(newRecord);
    soundFx.playSuccessChime();

    setResultMessage({
      type: 'success',
      title: 'Check-In Berhasil! Selamat Berlatih',
      description: `Akses disetujui untuk ${member.name}. Kunci locker telah dialokasikan.`,
      member,
      locker: newLocker,
    });

    loadData();
    setQuery('');
  };

  const handleManualCheckOut = (recordId: string) => {
    gymStorage.checkOutMember(recordId);
    soundFx.playSuccessChime();
    loadData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-700">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 leading-none">
                Terminal Check-In & Check-Out
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-mono font-bold">
                  Online
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Scan barcode kartu / RFID atau masukkan No. HP, Email, atau ID Member (Tanpa Akses Kamera)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Session Banner */}
        <div className="px-3.5 py-1.5 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-900 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-bold">Sesi Aktif:</span>
            <span>{currentGymSession.name} ({currentGymSession.hours})</span>
          </div>
          <span className="text-[10px] text-amber-800 font-mono font-medium">
            Kapasitas: {activeCheckIns.length} / 35 Orang
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-3.5">
          <button
            onClick={() => setActiveTab('scan')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'scan'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Check-In (Barcode / No HP / Email)
          </button>
          <button
            onClick={() => setActiveTab('active_now')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'active_now'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Sedang Latihan ({activeCheckIns.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'scan' && (
            <>
              {/* Scan Barcode / Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleProcessScan(query);
                }}
                className="space-y-2.5"
              >
                {/* Method Badges */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium overflow-x-auto pb-0.5">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
                    <Barcode className="w-3 h-3 text-teal-600" /> Barcode / RFID
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
                    <Phone className="w-3 h-3 text-teal-600" /> No. Handphone
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
                    <Mail className="w-3 h-3 text-teal-600" /> Email Member
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
                    <CreditCard className="w-3 h-3 text-teal-600" /> ID / Nama
                  </span>
                </div>

                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Scan Barcode / Masukkan No HP, Email, atau ID Member..."
                    className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-xs text-slate-900 placeholder:text-slate-400 outline-none transition"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1 px-2.5 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded transition cursor-pointer active:scale-95 shadow-xs"
                  >
                    Proses (Enter)
                  </button>
                </div>

                {/* Quick Action Chips for Testing */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="text-slate-400">Contoh Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('AGM882101');
                      handleProcessScan('AGM882101');
                    }}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    <Barcode className="w-2.5 h-2.5 text-teal-600" /> Barcode (AGM882101)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('081234567890');
                      handleProcessScan('081234567890');
                    }}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    <Phone className="w-2.5 h-2.5 text-teal-600" /> No. HP: 081234567890
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('siti.rahma@gmail.com');
                      handleProcessScan('siti.rahma@gmail.com');
                    }}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    <Mail className="w-2.5 h-2.5 text-teal-600" /> Email Siti
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('AGM882102');
                      handleProcessScan('AGM882102');
                    }}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer"
                  >
                    Dimas (Sesi Mismatch)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('AGM882106');
                      handleProcessScan('AGM882106');
                    }}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer"
                  >
                    Budi (Expired)
                  </button>
                </div>
              </form>

              {/* Scan Result Feedback Card */}
              {resultMessage && (
                <div
                  className={`p-3.5 rounded border animate-in zoom-in-95 duration-150 ${
                    resultMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : resultMessage.type === 'checkout'
                      ? 'bg-sky-50 border-sky-300 text-sky-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {resultMessage.type === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {resultMessage.type === 'checkout' && (
                      <LogOut className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    )}
                    {resultMessage.type === 'denied' && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="font-bold text-xs">{resultMessage.title}</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {resultMessage.description}
                      </p>

                      {/* Member Info Card on Success */}
                      {resultMessage.member && (
                        <div className="mt-2.5 p-2 bg-white rounded border border-slate-200 flex items-center justify-between gap-2.5 shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={resultMessage.member.avatar}
                              alt={resultMessage.member.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-800 text-xs">
                                {resultMessage.member.name}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {resultMessage.member.packageName}
                              </div>
                              <div className="text-[9px] text-slate-400 font-mono">
                                Berlaku s/d: {formatDateID(resultMessage.member.endDate)}
                              </div>
                            </div>
                          </div>

                          {resultMessage.locker && (
                            <div className="text-center px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded">
                              <div className="text-[9px] text-emerald-700 uppercase font-semibold">
                                No. Locker
                              </div>
                              <div className="text-base font-black text-emerald-800 font-mono">
                                #{resultMessage.locker}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action for Expired Member */}
                      {resultMessage.type === 'denied' && resultMessage.member && (
                        <div className="pt-1.5 flex justify-end">
                          <button
                            onClick={() => {
                              onClose();
                              onNavigateToRenew?.(resultMessage.member!.id);
                            }}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded transition flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            Perpanjang Sekarang di Kasir
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Hardware Scanner Tips */}
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Hardware Barcode Listener: <strong>Aktif (Keyboard Wedge / HID)</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => soundFx.playScanBeep()}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3 h-3 text-slate-600" /> Test Beep
                </button>
              </div>
            </>
          )}

          {activeTab === 'active_now' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1">
                <span>Daftar member di dalam area gym ({activeCheckIns.length})</span>
                <span>Klik "Check Out" saat selesai</span>
              </div>

              {activeCheckIns.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Tidak ada member yang sedang check-in saat ini.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {activeCheckIns.map(chk => {
                    const badge = getSessionBadge(chk.sessionCategory);
                    return (
                      <div
                        key={chk.id}
                        className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between gap-2.5 hover:bg-slate-100/80 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-teal-50 border border-teal-200 flex items-center justify-center font-mono font-bold text-teal-800 text-xs">
                            #{chk.lockerNumber || '-'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              {chk.memberName}
                              <span className={`text-[9px] px-1 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                                {badge.label.split(' ')[1]}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Masuk: {formatDateTimeID(chk.checkInTime)}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleManualCheckOut(chk.id)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-rose-700 text-xs font-semibold rounded border border-slate-300 transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-600" />
                          Check Out
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-mono text-[10px]">Pintasan Keyboard: [Esc] Tutup • [Enter] Validasi</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
