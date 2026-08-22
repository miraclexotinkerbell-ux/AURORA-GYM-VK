import React, { useRef } from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  DollarSign, 
  CreditCard, 
  QrCode, 
  Building2,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  ArrowRightLeft,
  Receipt
} from 'lucide-react';
import { CashierShift, Transaction } from '../types/gym';
import { formatDateTimeID, formatRupiah } from '../utils/helpers';
import { gymStorage } from '../utils/gymStorage';

interface ShiftReportModalProps {
  shift: CashierShift | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({
  shift,
  isOpen,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !shift) return null;

  const settings = gymStorage.getSettings();
  const allTxns = gymStorage.getTransactions();
  
  // Transactions associated with this shift
  const shiftTxns: Transaction[] = allTxns.filter(t => {
    if (t.shiftId && t.shiftId === shift.id) return true;
    if (shift.transactions && shift.transactions.includes(t.id)) return true;
    // Fallback: match by cashier and time range
    const tTime = new Date(t.date).getTime();
    const sStart = new Date(shift.startTime).getTime();
    const sEnd = shift.endTime ? new Date(shift.endTime).getTime() : Date.now();
    return t.cashierName === shift.cashierName && tTime >= sStart && tTime <= sEnd;
  });

  const handlePrint = () => {
    window.print();
  };

  const isClosed = shift.status === 'closed';
  const diff = shift.cashDifference ?? 0;
  const isBalanced = diff === 0;
  const isShortage = diff < 0;
  const isSurplus = diff > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Actions Header */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-xs">Laporan Rekapitulasi Shift Kasir</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isClosed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
              {isClosed ? 'Shift Selesai (Closed)' : 'Shift Aktif (Open)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rekap</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div ref={printRef} className="p-5 sm:p-6 overflow-y-auto space-y-4 font-sans text-xs text-slate-800 print:p-0 print:m-0">
          
          {/* Gym Header */}
          <div className="text-center border-b border-slate-200 pb-3">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">{settings.gymName}</h1>
            <p className="text-[11px] text-slate-500">{settings.address}</p>
            <p className="text-[10px] text-slate-400 font-mono">Telp: {settings.phone} • Shift Management System</p>
            <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-slate-800 text-[11px]">
              BERITA ACARA PENUTUPAN & REKAP KASIR (Z-REPORT)
            </div>
          </div>

          {/* Shift Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">No. Registrasi Shift</span>
              <span className="font-mono font-bold text-slate-900 text-[11px]">{shift.shiftNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Nama Kasir</span>
              <span className="font-bold text-slate-900">{shift.cashierName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Tipe Shift</span>
              <span className="font-medium text-teal-700">{shift.shiftType}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Waktu Mulai</span>
              <span className="font-mono text-slate-700 text-[11px]">{formatDateTimeID(shift.startTime)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Waktu Selesai</span>
              <span className="font-mono text-slate-700 text-[11px]">
                {shift.endTime ? formatDateTimeID(shift.endTime) : 'Masih Berjalan'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Diserahkan Kepada</span>
              <span className="font-medium text-slate-800">{shift.handoverTo || '-'}</span>
            </div>
          </div>

          {/* Cash Drawer Reconciliation Box */}
          <div className="border border-slate-300 rounded-lg p-3.5 bg-white space-y-2">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1 flex items-center justify-between">
              <span>Rekapitulasi Fisik Kas di Laci (Cash Reconciliation)</span>
              <span className="text-[10px] text-slate-400 font-normal">Audit Kasir Mandiri</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Modal Awal Kas (Starting Float):</span>
                <span className="font-mono font-semibold text-slate-900">{formatRupiah(shift.startingCash)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Penerimaan Tunai (Cash Sales):</span>
                <span className="font-mono font-semibold text-emerald-700">+{formatRupiah(shift.paymentSummary.cash)}</span>
              </div>
              {shift.cashIn > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Kas Masuk Non-Penjualan:</span>
                  <span className="font-mono font-semibold text-emerald-700">+{formatRupiah(shift.cashIn)}</span>
                </div>
              )}
              {shift.cashOut > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Pengeluaran Kas Kecil / Petty Cash:</span>
                  <span className="font-mono font-semibold text-rose-600">-{formatRupiah(shift.cashOut)}</span>
                </div>
              )}

              <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Total Ekspektasi Kas Sistem:</span>
                <span className="font-mono text-teal-800">{formatRupiah(shift.expectedCash)}</span>
              </div>

              {isClosed && (
                <>
                  <div className="flex justify-between font-bold text-slate-900 bg-slate-50 p-1.5 rounded">
                    <span>Uang Tunai Fisik Dihitung Kasir:</span>
                    <span className="font-mono text-sm">{formatRupiah(shift.actualCash || 0)}</span>
                  </div>

                  <div className={`p-2 rounded flex items-center justify-between font-bold ${
                    isBalanced
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : isShortage
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {isBalanced ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                      <span>
                        {isBalanced ? 'Status Kas: PAS / BALANCE (Rp 0)' : isShortage ? `Status Kas: SELISIH KURANG (MINUS)` : `Status Kas: SELISIH LEBIH (SURPLUS)`}
                      </span>
                    </div>
                    <span className="font-mono text-sm">
                      {diff > 0 ? `+${formatRupiah(diff)}` : diff < 0 ? formatRupiah(diff) : 'Rp 0'}
                    </span>
                  </div>

                  {shift.differenceReason && (
                    <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
                      <strong>Keterangan Kasir:</strong> {shift.differenceReason}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* By Payment Method */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <h4 className="font-bold text-[11px] text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1">
                Rincian Metode Pembayaran
              </h4>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tunai (Cash):</span>
                  <span className="font-mono font-semibold">{formatRupiah(shift.paymentSummary.cash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">QRIS (Digital):</span>
                  <span className="font-mono font-semibold">{formatRupiah(shift.paymentSummary.qris)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Transfer Bank:</span>
                  <span className="font-mono font-semibold">{formatRupiah(shift.paymentSummary.bank_transfer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kartu Debit / EDC:</span>
                  <span className="font-mono font-semibold">{formatRupiah(shift.paymentSummary.debit_card)}</span>
                </div>
                <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-teal-800 text-xs">
                  <span>Total Omzet Shift:</span>
                  <span className="font-mono">{formatRupiah(shift.paymentSummary.totalSales)}</span>
                </div>
              </div>
            </div>

            {/* By Sales Category */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <h4 className="font-bold text-[11px] text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1">
                Kategori Penjualan
              </h4>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Membership / Paket:</span>
                  <span className="font-mono font-semibold">{formatRupiah(shift.categorySummary.membership)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">POS Retail & Minuman:</span>
                  <span className="font-mono font-semibold">{formatRupiah(shift.categorySummary.retail)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Personal Trainer (PT):</span>
                  <span className="font-mono font-semibold">{formatRupiah(shift.categorySummary.pt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Transaksi:</span>
                  <span className="font-mono font-bold text-slate-900">{shift.totalTransactions} Transaksi</span>
                </div>
              </div>
            </div>

          </div>

          {/* List of Shift Transactions */}
          {shiftTxns.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-[11px] text-slate-800 uppercase tracking-wide">
                Daftar Transaksi Selama Shift ({shiftTxns.length} Transaksi)
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-1.5">No. Invoice</th>
                      <th className="p-1.5">Waktu</th>
                      <th className="p-1.5">Pelanggan</th>
                      <th className="p-1.5">Metode</th>
                      <th className="p-1.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shiftTxns.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-1.5 font-mono font-semibold text-slate-800">{t.invoiceNumber}</td>
                        <td className="p-1.5 text-slate-500">{new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-1.5 text-slate-700 truncate max-w-[100px]">{t.customerName}</td>
                        <td className="p-1.5 uppercase font-medium text-teal-700">{t.paymentMethod}</td>
                        <td className="p-1.5 text-right font-mono font-semibold">{formatRupiah(t.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Signatures / Handover Validation */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 text-center text-[10px]">
            <div className="space-y-8">
              <span className="text-slate-500">Kasir Bertugas,</span>
              <div>
                <p className="font-bold text-slate-900 border-b border-slate-300 inline-block px-4 pb-0.5">{shift.cashierName}</p>
                <p className="text-[9px] text-slate-400">Staff Kasir</p>
              </div>
            </div>
            <div className="space-y-8">
              <span className="text-slate-500">Petugas Penerima / Manager,</span>
              <div>
                <p className="font-bold text-slate-900 border-b border-slate-300 inline-block px-4 pb-0.5">
                  {shift.handoverTo || 'Manager Operasional'}
                </p>
                <p className="text-[9px] text-slate-400">Supervisor / Frontdesk</p>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-400 font-mono pt-2">
            Dokumen ini sah dicetak otomatis dari Aurora Gym Management OS • Shift Accountability Protocol
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded text-xs transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Struk Rekap
          </button>
        </div>

      </div>
    </div>
  );
};
