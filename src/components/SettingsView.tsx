import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  Clock, 
  ShieldCheck, 
  Cpu, 
  Printer, 
  Database, 
  Save, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Edit3,
  HardDrive,
  FileSpreadsheet,
  Lock,
  Sparkles,
  Download,
  Upload,
  X
} from 'lucide-react';
import { GymSettings, MembershipPackage, UserRole } from '../types/gym';
import { gymStorage } from '../utils/gymStorage';
import { soundFx } from '../utils/audio';
import { formatRupiah, formatDateTimeID, ROLE_PERMISSIONS } from '../utils/helpers';

interface SettingsViewProps {
  activeRole: UserRole;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ activeRole }) => {
  const [activeTab, setActiveTab] = useState<'gym_info' | 'sessions' | 'packages' | 'hardware' | 'audit' | 'backup'>('gym_info');
  const [settings, setSettings] = useState<GymSettings>(gymStorage.getSettings());
  const [packages, setPackages] = useState<MembershipPackage[]>(gymStorage.getPackages());
  const [auditLogs, setAuditLogs] = useState(gymStorage.getAuditLogs());
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // New Package Modal
  const [showPackageModal, setShowPackageModal] = useState<boolean>(false);
  const [pkgName, setPkgName] = useState<string>('');
  const [pkgPrice, setPkgPrice] = useState<number>(350000);
  const [pkgDuration, setPkgDuration] = useState<number>(1);
  const [pkgBenefits, setPkgBenefits] = useState<string>('Akses Semua Area Gym, Free Locker, Sesi Khusus');

  const perm = ROLE_PERMISSIONS[activeRole];

  useEffect(() => {
    loadData();
    window.addEventListener('aurora_storage_updated', loadData);
    return () => window.removeEventListener('aurora_storage_updated', loadData);
  }, []);

  const loadData = () => {
    setSettings(gymStorage.getSettings());
    setPackages(gymStorage.getPackages());
    setAuditLogs(gymStorage.getAuditLogs());
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    gymStorage.saveSettings(settings);
    gymStorage.addAuditLog('Perbarui Pengaturan Sistem', 'Mengubah konfigurasi umum / hardware gym');
    soundFx.playSuccessChime();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName) return;

    const newPkg: MembershipPackage = {
      id: `pkg-${Date.now()}`,
      name: pkgName,
      durationMonths: pkgDuration,
      price: pkgPrice,
      allowedSession: 'all',
      description: pkgBenefits,
      benefits: pkgBenefits.split(',').map(b => b.trim()),
      isPopular: false,
    };

    const updated = [...packages, newPkg];
    gymStorage.savePackages(updated);
    gymStorage.addAuditLog('Tambah Master Paket', `Menambah paket membership ${pkgName}`);
    soundFx.playSuccessChime();

    setShowPackageModal(false);
    setPkgName('');
    loadData();
  };

  const handleDeletePackage = (id: string) => {
    if (packages.length <= 1) {
      alert('Minimal harus ada 1 paket membership yang aktif.');
      return;
    }
    const updated = packages.filter(p => p.id !== id);
    gymStorage.savePackages(updated);
    gymStorage.addAuditLog('Hapus Paket Membership', `Menghapus paket ID ${id}`);
    loadData();
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: 'aurora_v1',
      members: gymStorage.getMembers(),
      products: gymStorage.getProducts(),
      trainers: gymStorage.getTrainers(),
      transactions: gymStorage.getTransactions(),
      cashFlow: gymStorage.getCashFlow(),
      settings: gymStorage.getSettings(),
      packages: gymStorage.getPackages(),
    };

    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', jsonStr);
    dlAnchor.setAttribute('download', `AuroraGym_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const handleResetFactoryData = () => {
    if (confirm('Apakah Anda yakin ingin me-reset data ke kondisi awal (Seed Data)? Semua data baru akan direset.')) {
      gymStorage.resetToDefault();
      soundFx.playSuccessChime();
      alert('Sistem berhasil di-reset ke data bawaan.');
      loadData();
    }
  };

  return (
    <div className="space-y-4 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 leading-none">
              Pengaturan Sistem & Master Data
            </h2>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold font-mono border border-teal-200">
              Config
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Konfigurasi profil gym, jadwal sesi khusus, master paket, hardware integrasi, dan audit trail
          </p>
        </div>

        {savedNotice && (
          <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pengaturan Disimpan!
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
        {[
          { id: 'gym_info', label: 'Profil Gym', icon: Building2 },
          { id: 'sessions', label: 'Jadwal Sesi Khusus', icon: Clock },
          { id: 'packages', label: 'Master Paket Membership', icon: Sliders },
          { id: 'hardware', label: 'Hardware & Scanner', icon: Cpu },
          { id: 'audit', label: 'Audit Trail Staf', icon: ShieldCheck },
          { id: 'backup', label: 'Backup & Database', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFIL GYM */}
      {activeTab === 'gym_info' && (
        <form onSubmit={handleSaveSettings} className="max-w-2xl bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs text-xs">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="font-bold text-xs text-slate-800">Identitas & Kontak Gym</h3>
            <p className="text-[11px] text-slate-500">Informasi ini akan dicetak pada Kuitansi Struk dan Kartu Member Digital.</p>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold text-[11px]">Nama Bisnis Gym *</label>
            <input
              type="text"
              value={settings.gymName}
              onChange={(e) => setSettings({ ...settings, gymName: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold text-[11px]">Slogan / Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold text-[11px]">Nomor WhatsApp Resmi</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold text-[11px]">Email Pengelola</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold text-[11px]">Alamat Lengkap</label>
            <textarea
              rows={2}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold text-[11px]">Domain / Website URL</label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-teal-700 font-mono outline-none text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold text-[11px]">Pajak Transaksi Kasir (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded shadow-xs transition cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: JADWAL SESI KHUSUS */}
      {activeTab === 'sessions' && (
        <form onSubmit={handleSaveSettings} className="max-w-3xl bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-xs text-xs">
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                Pengaturan Jadwal Sesi Latihan Gym Berdasarkan Hari & Jam
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Atur ketentuan sesi per hari dan waktu operasional. Ketentuan saat ini: Khusus hari Sabtu dan Minggu dicampur antara perempuan dan laki-laki.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold self-start sm:self-auto">
              Sabtu & Minggu: Mixed All-Access
            </span>
          </div>

          {/* Banner Ketentuan Weekend */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <div className="font-bold text-amber-900 text-xs">
                Ketentuan Khusus Akhir Pekan (Sabtu & Minggu)
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Khusus latihan di hari <strong>Sabtu dan Minggu</strong>, sesi latihan <strong>dicampur (mixed) antara perempuan dan laki-laki</strong> sepanjang hari operasional. Check-in RFID scanner otomatis menerima semua gender tanpa pembatasan sesi pada akhir pekan.
              </p>
            </div>
          </div>

          {/* Matrix Hari & Waktu */}
          <div className="space-y-3">
            <div className="font-bold text-slate-700 text-xs uppercase tracking-wider">
              1. Jadwal Hari Kerja (Senin s/d Jumat)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                    🌸 Sesi Khusus Perempuan (Senin - Jumat)
                  </label>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded font-bold">Women Only</span>
                </div>
                <input
                  type="text"
                  value={settings.sessionSchedules.womenOnly}
                  onChange={(e) => setSettings({
                    ...settings,
                    sessionSchedules: { ...settings.sessionSchedules, womenOnly: e.target.value }
                  })}
                  placeholder="Contoh: 08:00 - 11:00 & 14:00 - 17:00 WIB"
                  className="w-full px-2.5 py-1.5 bg-white border border-rose-300 rounded text-slate-900 outline-none text-xs font-mono font-semibold"
                />
                <p className="text-[10px] text-rose-700">
                  Hari: <strong>Senin, Selasa, Rabu, Kamis, Jumat</strong>. Peringatan scanner aktif jika member pria check-in.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-sky-900 text-xs flex items-center gap-1.5">
                    ⚡ Sesi Khusus Laki-laki (Senin - Jumat)
                  </label>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-200 text-sky-800 rounded font-bold">Men Only</span>
                </div>
                <input
                  type="text"
                  value={settings.sessionSchedules.menOnly}
                  onChange={(e) => setSettings({
                    ...settings,
                    sessionSchedules: { ...settings.sessionSchedules, menOnly: e.target.value }
                  })}
                  placeholder="Contoh: 17:00 - 20:00 WIB"
                  className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded text-slate-900 outline-none text-xs font-mono font-semibold"
                />
                <p className="text-[10px] text-sky-700">
                  Hari: <strong>Senin, Selasa, Rabu, Kamis, Jumat</strong>. Area fokus angkat beban khusus pria.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  🌐 Sesi Gabungan Hari Kerja (Mixed Session)
                </label>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded font-bold">Mixed</span>
              </div>
              <input
                type="text"
                value={settings.sessionSchedules.mixed}
                onChange={(e) => setSettings({
                  ...settings,
                  sessionSchedules: { ...settings.sessionSchedules, mixed: e.target.value }
                })}
                placeholder="Contoh: 06:00 - 08:00 & 20:00 - 22:00 WIB"
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-slate-900 outline-none text-xs font-mono font-semibold"
              />
              <p className="text-[10px] text-emerald-700">
                Hari: <strong>Senin - Jumat</strong> pada jam pagi dan malam hari.
              </p>
            </div>

            <div className="font-bold text-slate-700 text-xs uppercase tracking-wider pt-2">
              2. Jadwal Akhir Pekan (Khusus Sabtu & Minggu)
            </div>

            <div className="p-3.5 rounded-lg bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                  🌟 Sesi Campur Akhir Pekan (Sabtu & Minggu - All Day Mixed)
                </label>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-200 text-indigo-800 rounded font-bold">
                  Sabtu & Minggu Full Mixed
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-indigo-800 font-semibold">Jam Buka Sabtu:</span>
                  <input
                    type="text"
                    defaultValue="07:00 - 21:00 WIB (Campur Perempuan & Laki-laki)"
                    className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-indigo-300 rounded text-slate-900 outline-none text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-indigo-800 font-semibold">Jam Buka Minggu:</span>
                  <input
                    type="text"
                    defaultValue="07:00 - 20:00 WIB (Campur Perempuan & Laki-laki)"
                    className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-indigo-300 rounded text-slate-900 outline-none text-xs font-mono"
                  />
                </div>
              </div>
              <p className="text-[10px] text-indigo-700">
                Pada hari Sabtu dan Minggu, tidak ada pembagian jam khusus gender. Semua member dapat berlatih bersama.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Perubahan jadwal langsung aktif di Terminal Scanner & RFID Check-In
            </span>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded shadow-xs transition cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Jadwal Sesi & Hari
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: MASTER PAKET */}
      {activeTab === 'packages' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-slate-800">Daftar Master Paket Membership</h3>
              <p className="text-[11px] text-slate-500">Paket yang dapat dipilih saat registrasi dan perpanjangan.</p>
            </div>
            <button
              onClick={() => setShowPackageModal(true)}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Paket
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2.5 flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs">{pkg.name}</h4>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200">
                      {pkg.durationMonths} Bulan
                    </span>
                  </div>

                  <div className="text-lg font-black text-teal-700 font-mono">
                    {formatRupiah(pkg.price)}
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-slate-100 text-slate-600 text-[11px]">
                    {pkg.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer border border-rose-200"
                    title="Hapus Paket"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Package Modal */}
          {showPackageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="font-bold text-slate-800 text-xs">Tambah Paket Membership Baru</div>
                  <button onClick={() => setShowPackageModal(false)} className="p-1 rounded hover:bg-slate-200 text-slate-500"><X className="w-4 h-4" /></button>
                </div>

                <form onSubmit={handleAddPackage} className="p-4 space-y-2.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-semibold text-[11px]">Nama Paket *</label>
                    <input
                      type="text"
                      required
                      value={pkgName}
                      onChange={(e) => setPkgName(e.target.value)}
                      placeholder="Contoh: Paket 6 Bulan Golden Pass"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-semibold text-[11px]">Harga Paket (Rp) *</label>
                      <input
                        type="number"
                        required
                        min={10000}
                        value={pkgPrice}
                        onChange={(e) => setPkgPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-teal-700 font-mono font-bold outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-semibold text-[11px]">Durasi (Bulan) *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={36}
                        value={pkgDuration}
                        onChange={(e) => setPkgDuration(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-semibold text-[11px]">Benefit & Fasilitas (Pisahkan Koma)</label>
                    <textarea
                      rows={2}
                      value={pkgBenefits}
                      onChange={(e) => setPkgBenefits(e.target.value)}
                      placeholder="Akses Gym 24/7, Free Locker, Sesi Khusus, Free Handuk"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPackageModal(false)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer border border-slate-200 text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded shadow-xs cursor-pointer text-xs"
                    >
                      Simpan Paket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HARDWARE & SCANNER CONFIG */}
      {activeTab === 'hardware' && (
        <form onSubmit={handleSaveSettings} className="max-w-2xl bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs text-xs">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-teal-600" />
              Konfigurasi Hardware & Access Control
            </h3>
            <p className="text-[11px] text-slate-500">
              Integrasi barcode scanner, RFID reader, turnstile gate barrier relay, dan printer kuitansi.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Scanner Barcode / RFID Otomatis</div>
                <div className="text-[10px] text-slate-500">Menerima input USB HID Keyboard Emulation dengan trigger otomatis</div>
              </div>
              <input
                type="checkbox"
                checked={settings.hardware.barcodeScannerEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  hardware: { ...settings.hardware, barcodeScannerEnabled: e.target.checked }
                })}
                className="w-4 h-4 accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Integrasi Smart Turnstile Gate / Barrier Gate</div>
                <div className="text-[10px] text-slate-500">Kirim pulsa buka pintu (Pulse Relay {settings.hardware.relayPulseDurationMs}ms) saat check-in sukses</div>
              </div>
              <input
                type="checkbox"
                checked={settings.hardware.turnstileGateIntegration}
                onChange={(e) => setSettings({
                  ...settings,
                  hardware: { ...settings.hardware, turnstileGateIntegration: e.target.checked }
                })}
                className="w-4 h-4 accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Efek Suara Terminal (Chime / Beep)</div>
                <div className="text-[10px] text-slate-500">Synthesizer audio notifikasi berhasil / gagal check-in</div>
              </div>
              <input
                type="checkbox"
                checked={settings.hardware.soundEffectsEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  hardware: { ...settings.hardware, soundEffectsEnabled: e.target.checked }
                })}
                className="w-4 h-4 accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold text-[11px]">Tipe Printer Thermal Kuitansi</label>
              <select
                value={settings.hardware.receiptPrinterType}
                onChange={(e) => setSettings({
                  ...settings,
                  hardware: { ...settings.hardware, receiptPrinterType: e.target.value as any }
                })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none cursor-pointer text-xs"
              >
                <option value="58mm">Thermal Printer 58mm (Kompak)</option>
                <option value="80mm">Thermal Printer 80mm (Standar Kasir)</option>
                <option value="none">Tanpa Printer Fisik (Digital WA Saja)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded shadow-xs transition cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Hardware
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: AUDIT TRAIL LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Audit Trail & Catatan Aktivitas Staf
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{auditLogs.length} Log Aktivitas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Aksi / Operasi</th>
                  <th className="py-2.5 px-3">Detail Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap text-[10px]">
                      {formatDateTimeID(log.timestamp)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: BACKUP & DATABASE */}
      {activeTab === 'backup' && (
        <div className="max-w-2xl bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-xs text-xs">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-teal-600" />
              Manajemen Data & Backup
            </h3>
            <p className="text-[11px] text-slate-500">
              Unduh cadangan data gym dalam format JSON atau reset sistem.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="font-bold text-slate-800">Unduh Backup Data JSON</div>
              <div className="text-[10px] text-slate-500">Ekspor seluruh member, transaksi kasir, inventaris, dan arus kas</div>
            </div>
            <button
              onClick={handleExportBackup}
              className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Backup
            </button>
          </div>

          <div className="p-3 rounded bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="font-bold text-rose-900">Reset Data Bawaan (Factory Seed)</div>
              <div className="text-[10px] text-rose-700">Kembalikan semua data ke sampel awal Aurora Gym</div>
            </div>
            <button
              onClick={handleResetFactoryData}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Database
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
