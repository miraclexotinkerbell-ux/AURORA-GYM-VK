import React, { useState } from 'react';
import { 
  Dumbbell, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  UserCheck, 
  Clock, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import { AuthUser, UserRole } from '../types/gym';
import { DEFAULT_USERS, gymStorage } from '../utils/gymStorage';
import { ROLE_PERMISSIONS } from '../utils/helpers';
import { soundFx } from '../utils/audio';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'screening' | 'credentials'>('screening');
  const [email, setEmail] = useState<string>('owner@auroragym.id');
  const [password, setPassword] = useState<string>('owner123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = gymStorage.login(email, password);
      setIsLoading(false);

      if (res.success && res.user) {
        soundFx.playSuccessChime();
        onLoginSuccess(res.user);
      } else {
        soundFx.playDeniedBuzz();
        setErrorMessage(res.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
      }
    }, 400);
  };

  const handleQuickRoleLogin = (user: AuthUser) => {
    soundFx.playSuccessChime();
    gymStorage.setCurrentUser(user);
    gymStorage.addAuditLog('Login Cepat (Screening Posisi)', `User ${user.name} masuk melalui screening posisi [${user.role.toUpperCase()}]`);
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-teal-500 selection:text-slate-950 relative overflow-hidden font-sans">
      
      {/* Background Ambience / Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Brand */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Dumbbell className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">AURORA GYM</span>
              <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold uppercase border border-teal-500/30">
                v2.4 Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Sistem Manajemen Gym & POS Kasir Multi-Shift</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Screening Posisi & RBAC Terintegrasi</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Header Banner inside Box */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-800/50 to-transparent border-b border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold border border-teal-500/20 mb-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  Portal Autentikasi Staf & Manajemen
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Screening Posisi Pengguna
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Pilih posisi jabatan Anda atau masuk dengan akun terdaftar untuk mengaktifkan batasan hak akses (RBAC) dan pencatatan shift kasir mandiri.
                </p>
              </div>

              {/* Mode Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  id="tab-screening"
                  onClick={() => setActiveTab('screening')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'screening'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Screening Posisi
                </button>
                <button
                  type="button"
                  id="tab-credentials"
                  onClick={() => setActiveTab('credentials')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'credentials'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email & Password
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: SCREENING POSISI (ONE-CLICK QUICK SELECTION) */}
          {activeTab === 'screening' && (
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  Pilih Akun Berdasarkan Posisi / Shift Aktif
                </div>
                <span className="text-[11px] text-teal-400 font-mono">5 Akun Siap Screening</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {DEFAULT_USERS.map((u) => {
                  const perm = ROLE_PERMISSIONS[u.role];
                  const isOwner = u.role === 'owner';
                  const isManager = u.role === 'manager';
                  const isCashier = u.role === 'cashier';
                  const isTrainer = u.role === 'trainer';

                  return (
                    <div
                      key={u.id}
                      id={`btn-screen-role-${u.role}-${u.id}`}
                      onClick={() => handleQuickRoleLogin(u)}
                      className="group p-4 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-teal-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-teal-500/5"
                    >
                      {/* Top info */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-teal-400 transition shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition truncate">
                              {u.name}
                            </h3>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                                isOwner
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : isManager
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : isCashier
                                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              }`}
                            >
                              {perm.title.split(' ')[0]}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                            {u.email}
                          </div>

                          {u.shift && (
                            <div className="flex items-center gap-1 text-[11px] text-teal-400/90 mt-1.5 font-medium">
                              <Clock className="w-3 h-3 text-teal-400" />
                              <span>{u.shift}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Permissions Description & Action Button */}
                      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {perm.description}
                        </p>
                        <button
                          type="button"
                          className="px-3 py-1 bg-slate-800 group-hover:bg-teal-500 group-hover:text-slate-950 text-slate-200 rounded text-xs font-bold transition flex items-center gap-1 shrink-0"
                        >
                          <span>Masuk</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notice */}
              <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-start gap-2.5 text-xs text-teal-200">
                <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Sistem Screening Otomatis:</strong> Setiap posisi pengguna akan langsung dialihkan ke menu yang sesuai dengan hak aksesnya. Kasir akan mendapatkan rekap shift mandiri untuk mencegah perselisihan data antar staf.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL EMAIL & PASSWORD LOGIN */}
          {activeTab === 'credentials' && (
            <div className="p-6 sm:p-8 max-w-md mx-auto">
              <form onSubmit={handleCredentialLogin} className="space-y-4">
                
                {errorMessage && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg flex items-start gap-2 text-xs text-rose-300 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    Alamat Email Staf
                  </label>
                  <input
                    type="email"
                    required
                    id="input-login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@auroragym.id"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 rounded-lg text-white text-sm outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-teal-400" />
                      Kata Sandi
                    </label>
                    <span className="text-[11px] text-slate-400">Default: password peran</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      id="input-login-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 rounded-lg text-white text-sm outline-none transition pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Auto-Fill Demo */}
                <div className="pt-1">
                  <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Contoh Akun Cepat:</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setEmail('owner@auroragym.id'); setPassword('owner123'); }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold rounded border border-slate-700 cursor-pointer"
                    >
                      Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmail('manager@auroragym.id'); setPassword('manager123'); }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 text-[10px] font-bold rounded border border-slate-700 cursor-pointer"
                    >
                      Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmail('kasir.pagi@auroragym.id'); setPassword('kasir123'); }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 text-[10px] font-bold rounded border border-slate-700 cursor-pointer"
                    >
                      Kasir Pagi
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmail('kasir.sore@auroragym.id'); setPassword('kasir123'); }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 text-[10px] font-bold rounded border border-slate-700 cursor-pointer"
                    >
                      Kasir Sore
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  id="btn-login-submit"
                  className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-400 active:scale-98 text-slate-950 font-bold rounded-lg transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-3 border-t border-slate-800/80 bg-slate-950/70 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-teal-400" />
          <span>Pusat Kendali Aurora Gym • Proteksi Keamanan Kasir & RBAC</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Enkripsi Sesi Lokal • Shift Accounting Enabled
        </div>
      </footer>

    </div>
  );
};
