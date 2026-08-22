import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Clock, 
  DollarSign, 
  User, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';
import { AuthUser, CashierShift } from '../types/gym';
import { formatRupiah } from '../utils/helpers';
import { gymStorage } from '../utils/gymStorage';
import { soundFx } from '../utils/audio';

interface OpenShiftModalProps {
  isOpen: boolean;
  currentUser: AuthUser | null;
  onClose: () => void;
  onShiftOpened: (newShift: CashierShift) => void;
}

export const OpenShiftModal: React.FC<OpenShiftModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onShiftOpened,
}) => {
  const [shiftType, setShiftType] = useState<CashierShift['shiftType']>(() => {
    const hour = new Date().getHours();
    return hour < 14 ? 'Pagi (06:00 - 14:00)' : 'Sore (14:00 - 22:00)';
  });
  const [startingCash, setStartingCash] = useState<number>(300000);

  if (!isOpen) return null;

  const cashierName = currentUser?.name || 'Staff Kasir';
  const cashierId = currentUser?.id || 'usr-cashier';

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();

    const newShift = gymStorage.openShift({
      cashierId,
      cashierName,
      shiftType,
      startingCash,
    });

    soundFx.playSuccessChime();
    onShiftOpened(newShift);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="font-bold text-sm leading-tight">Buka Shift Kasir Baru</h2>
              <p className="text-[11px] text-slate-400">Inisialisasi Laci Kas & Pencatatan Transaksi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleOpenShift} className="p-5 space-y-4 font-sans text-xs text-slate-800">
          
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {cashierName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] text-teal-700 uppercase font-semibold block">Kasir Bertugas</span>
              <span className="font-bold text-slate-900 text-sm">{cashierName}</span>
              <span className="text-[11px] text-slate-500 block">{currentUser?.email || 'kasir@auroragym.id'}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              Pilih Periode / Tipe Shift
            </label>
            <select
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded-lg text-slate-900 outline-none text-xs font-semibold"
            >
              <option value="Pagi (06:00 - 14:00)">Pagi (06:00 - 14:00 WIB)</option>
              <option value="Sore (14:00 - 22:00)">Sore (14:00 - 22:00 WIB)</option>
              <option value="Full Day (06:00 - 22:00)">Full Day (06:00 - 22:00 WIB)</option>
              <option value="Custom">Custom / Shift Tambahan</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-teal-600" />
              Modal Awal Kas di Laci (Float)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">Rp</span>
              <input
                type="number"
                min={0}
                required
                value={startingCash}
                onChange={(e) => setStartingCash(Number(e.target.value))}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded-lg text-base font-mono font-bold text-slate-900 outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Uang pecahan modal kembalian awal yang dihitung sebelum melayani transaksi.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Buka Shift Sekarang</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
