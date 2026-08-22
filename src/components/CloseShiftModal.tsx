import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  User, 
  ShieldCheck, 
  Calculator, 
  Receipt,
  ArrowRight
} from 'lucide-react';
import { CashierShift } from '../types/gym';
import { formatRupiah, formatDateTimeID } from '../utils/helpers';
import { gymStorage } from '../utils/gymStorage';
import { soundFx } from '../utils/audio';

interface CloseShiftModalProps {
  isOpen: boolean;
  shift: CashierShift | null;
  onClose: () => void;
  onShiftClosed: (closedShift: CashierShift) => void;
}

export const CloseShiftModal: React.FC<CloseShiftModalProps> = ({
  isOpen,
  shift,
  onClose,
  onShiftClosed,
}) => {
  const [actualCash, setActualCash] = useState<number>(0);
  const [handoverTo, setHandoverTo] = useState<string>('Budi Santoso (Kasir Shift Sore)');
  const [notes, setNotes] = useState<string>('');
  const [differenceReason, setDifferenceReason] = useState<string>('');
  const [showDenominations, setShowDenominations] = useState<boolean>(false);

  // Denominations count
  const [counts, setCounts] = useState<{ [key: number]: number }>({
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0,
  });

  useEffect(() => {
    if (shift) {
      setActualCash(shift.expectedCash);
      setNotes('Semua transaksi kasir telah tercatat dan laci kas rapi.');
    }
  }, [shift]);

  // Update actual cash from denominations
  const updateFromDenominations = (newCounts: { [key: number]: number }) => {
    setCounts(newCounts);
    const sum = Object.entries(newCounts).reduce((acc, [denom, count]) => {
      return acc + (Number(denom) * (Number(count) || 0));
    }, 0);
    setActualCash(sum);
  };

  if (!isOpen || !shift) return null;

  const expectedCash = shift.expectedCash;
  const diff = actualCash - expectedCash;
  const isBalanced = diff === 0;
  const isShortage = diff < 0;
  const isSurplus = diff > 0;

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();

    if (diff !== 0 && !differenceReason) {
      alert('Terdapat selisih kas fisik. Harap masukkan keterangan/alasan selisih kas untuk laporan pertanggungjawaban.');
      return;
    }

    const closed = gymStorage.closeShift(shift.id, {
      actualCash,
      handoverTo,
      notes,
      differenceReason: diff !== 0 ? differenceReason : 'Kas Pas (Balance)',
      closedBy: shift.cashierName,
    });

    if (closed) {
      soundFx.playSuccessChime();
      onShiftClosed(closed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="font-bold text-sm leading-tight">Tutup Shift & Rekap Kas Laci</h2>
              <p className="text-[11px] text-slate-400">{shift.shiftNumber} • {shift.cashierName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmClose} className="p-4 sm:p-5 overflow-y-auto space-y-4 font-sans text-xs text-slate-800">
          
          {/* Summary Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Modal Awal Kas:</span>
              <span className="font-mono font-semibold text-slate-900">{formatRupiah(shift.startingCash)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Penjualan Tunai (Cash):</span>
              <span className="font-mono font-semibold text-emerald-700">+{formatRupiah(shift.paymentSummary.cash)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Penjualan Non-Tunai (QRIS/EDC/Transfer):</span>
              <span className="font-mono font-semibold text-teal-700">
                {formatRupiah(shift.paymentSummary.qris + shift.paymentSummary.debit_card + shift.paymentSummary.bank_transfer)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
              <span>Total Ekspektasi Kas Tunai:</span>
              <span className="font-mono text-teal-800">{formatRupiah(expectedCash)}</span>
            </div>
          </div>

          {/* Actual Cash Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                Jumlah Uang Tunai Fisik di Laci (Hasil Hitung)
              </label>
              <button
                type="button"
                onClick={() => setShowDenominations(!showDenominations)}
                className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Calculator className="w-3 h-3" />
                {showDenominations ? 'Sembunyikan Kalkulator Pecahan' : 'Hitung Pecahan Uang'}
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">Rp</span>
              <input
                type="number"
                min={0}
                required
                value={actualCash || ''}
                onChange={(e) => setActualCash(Number(e.target.value))}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded-lg text-base font-mono font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Denominations Helper */}
          {showDenominations && (
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg space-y-2 animate-in fade-in">
              <span className="font-bold text-[11px] text-teal-900 block">Kalkulator Lembar Pecahan Uang Kertas & Logam:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {[100000, 50000, 20000, 10000, 5000, 2000, 1000].map((denom) => (
                  <div key={denom} className="flex items-center gap-1">
                    <span className="w-12 text-slate-600 font-mono text-[10px]">{denom >= 1000 ? `${denom/1000}k` : denom}:</span>
                    <input
                      type="number"
                      min={0}
                      value={counts[denom] || ''}
                      onChange={(e) => updateFromDenominations({ ...counts, [denom]: Number(e.target.value) })}
                      placeholder="0"
                      className="w-14 px-1.5 py-1 bg-white border border-teal-300 rounded text-center text-xs font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Difference Status Box */}
          <div className={`p-3 rounded-lg border flex items-center justify-between ${
            isBalanced
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : isShortage
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <span className="font-bold text-xs block">
                  {isBalanced ? 'Kas Pas & Akurat (Rp 0)' : isShortage ? 'Peringatan: Kas Kurang (Minus)' : 'Peringatan: Kas Lebih (Surplus)'}
                </span>
                <span className="text-[10px] opacity-80">
                  {isBalanced ? 'Tidak ada selisih kas' : `Selisih: ${formatRupiah(Math.abs(diff))}`}
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-sm">
              {diff > 0 ? `+${formatRupiah(diff)}` : diff < 0 ? formatRupiah(diff) : 'Rp 0'}
            </span>
          </div>

          {/* Explanation if Difference */}
          {!isBalanced && (
            <div className="space-y-1">
              <label className="font-bold text-rose-800 text-xs">
                Keterangan / Alasan Selisih Kas *
              </label>
              <input
                type="text"
                required
                value={differenceReason}
                onChange={(e) => setDifferenceReason(e.target.value)}
                placeholder="Contoh: Salah kembalian transaksi #INV-102 / Uang tip pelanggan"
                className="w-full px-3 py-1.5 bg-rose-50/40 border border-rose-300 rounded text-slate-900 outline-none text-xs"
              />
            </div>
          )}

          {/* Handover staff */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 text-xs">
              Serah Terima Kas Kepada (Staff Pengganti / Manager)
            </label>
            <input
              type="text"
              required
              value={handoverTo}
              onChange={(e) => setHandoverTo(e.target.value)}
              placeholder="Nama staf penerima laci kas..."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 outline-none text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 text-xs">
              Catatan Penutupan Shift
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan inventaris POS, kondisi kasir, atau titipan pesan..."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 outline-none text-xs"
            />
          </div>

          {/* Submit */}
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
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Tutup Shift</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
