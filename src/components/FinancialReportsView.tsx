import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Download, 
  Printer, 
  Calendar, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Receipt,
  Sparkles,
  X,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CashFlowEntry, CashierShift, Transaction, UserRole } from '../types/gym';
import { gymStorage } from '../utils/gymStorage';
import { soundFx } from '../utils/audio';
import { formatDateID, formatDateTimeID, formatRupiah, ROLE_PERMISSIONS } from '../utils/helpers';
import { ShiftReportModal } from './ShiftReportModal';

interface FinancialReportsViewProps {
  activeRole: UserRole;
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({ activeRole }) => {
  const [activeReportTab, setActiveReportTab] = useState<'cashflow' | 'shifts'>('cashflow');
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shifts, setShifts] = useState<CashierShift[]>([]);
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedShiftForReport, setSelectedShiftForReport] = useState<CashierShift | null>(null);

  // Add Expense Modal
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [expenseCategory, setExpenseCategory] = useState<CashFlowEntry['category']>('Maintenance Alat');
  const [expenseAmount, setExpenseAmount] = useState<number>(250000);
  const [expenseDescription, setExpenseDescription] = useState<string>('');

  const perm = ROLE_PERMISSIONS[activeRole];

  useEffect(() => {
    loadData();
    window.addEventListener('aurora_storage_updated', loadData);
    return () => window.removeEventListener('aurora_storage_updated', loadData);
  }, []);

  const loadData = () => {
    setCashFlow(gymStorage.getCashFlow());
    setTransactions(gymStorage.getTransactions());
    setShifts(gymStorage.getShifts());
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDescription) return;

    const newEntry: CashFlowEntry = {
      id: `cf-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'expense',
      category: expenseCategory,
      amount: expenseAmount,
      description: expenseDescription,
      performedBy: perm.title,
    };

    gymStorage.addCashFlow(newEntry);
    gymStorage.addAuditLog('Catat Pengeluaran Kas', `Mencatat pengeluaran ${expenseCategory} sebesar ${formatRupiah(expenseAmount)} (${expenseDescription})`);
    soundFx.playSuccessChime();

    setShowAddExpenseModal(false);
    setExpenseDescription('');
    setExpenseAmount(250000);
    loadData();
  };

  // Calculations
  const totalIncome = cashFlow
    .filter(c => c.type === 'income')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalExpense = cashFlow
    .filter(c => c.type === 'expense')
    .reduce((sum, c) => sum + c.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Breakdown by revenue stream
  const membershipIncome = cashFlow
    .filter(c => c.type === 'income' && c.category === 'Membership')
    .reduce((sum, c) => sum + c.amount, 0);

  const retailIncome = cashFlow
    .filter(c => c.type === 'income' && c.category === 'Retail POS')
    .reduce((sum, c) => sum + c.amount, 0);

  const ptIncome = cashFlow
    .filter(c => c.type === 'income' && c.category === 'PT Session')
    .reduce((sum, c) => sum + c.amount, 0);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID,Tanggal,Tipe,Kategori,Jumlah (Rp),Deskripsi,Oleh'];
    const rows = cashFlow.map(c => 
      `"${c.id}","${c.date}","${c.type}","${c.category}","${c.amount}","${c.description.replace(/"/g, '""')}","${c.performedBy}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_AuroraGym_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCashFlow = cashFlow.filter(c => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 font-sans">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 leading-none">
              Laporan Keuangan & Arus Kas (P&L)
            </h2>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold font-mono border border-teal-200">
              Otomatis
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Rekapitulasi pemasukan membership, POS kasir, sesi PT, per shift kasir serta beban operasional gym
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sub-tab Switcher */}
          <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              onClick={() => setActiveReportTab('cashflow')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                activeReportTab === 'cashflow' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Arus Kas & P&L
            </button>
            <button
              onClick={() => setActiveReportTab('shifts')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                activeReportTab === 'shifts' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Laporan Per Shift ({shifts.length})
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition border border-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={() => window.print()}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition border border-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Cetak Laporan
          </button>

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Pengeluaran
          </button>
        </div>
      </div>

      {activeReportTab === 'cashflow' && (
        <>
          {/* 3 Core Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Total Income */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold">Total Pemasukan Kas</span>
                <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl font-black text-emerald-600 font-mono">
                {formatRupiah(totalIncome)}
              </div>
              <div className="text-[10px] text-slate-400">
                Membership, Retail POS, dan Sesi PT
              </div>
            </div>

            {/* Total Expense */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold">Total Pengeluaran Kas</span>
                <div className="w-6 h-6 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl font-black text-rose-600 font-mono">
                {formatRupiah(totalExpense)}
              </div>
              <div className="text-[10px] text-slate-400">
                Restock inventaris, maintenance alat & operasional
              </div>
            </div>

            {/* Net Profit */}
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 shadow-xs space-y-1.5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-semibold">Laba Bersih (Net Profit)</span>
                <div className="w-6 h-6 rounded bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className={`text-xl font-black font-mono ${netProfit >= 0 ? 'text-teal-300' : 'text-rose-400'}`}>
                {formatRupiah(netProfit)}
              </div>
              <div className="text-[10px] text-teal-400 font-medium">
                Margin Laba: {totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0}%
              </div>
            </div>

          </div>

      {/* Revenue Breakdown by Stream */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-500">Pemasukan Membership</div>
            <div className="text-sm font-bold text-slate-800 font-mono">{formatRupiah(membershipIncome)}</div>
          </div>
          <div className="w-8 h-8 rounded bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-[11px]">
            {totalIncome > 0 ? Math.round((membershipIncome / totalIncome) * 100) : 0}%
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-500">Pemasukan Retail F&B</div>
            <div className="text-sm font-bold text-slate-800 font-mono">{formatRupiah(retailIncome)}</div>
          </div>
          <div className="w-8 h-8 rounded bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-[11px]">
            {totalIncome > 0 ? Math.round((retailIncome / totalIncome) * 100) : 0}%
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-500">Pemasukan Sesi Trainer</div>
            <div className="text-sm font-bold text-slate-800 font-mono">{formatRupiah(ptIncome)}</div>
          </div>
          <div className="w-8 h-8 rounded bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-[11px]">
            {totalIncome > 0 ? Math.round((ptIncome / totalIncome) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Cash Flow Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
            <FileText className="w-4 h-4 text-teal-600" />
            Buku Jurnal Arus Kas Masuk & Keluar
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                typeFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                typeFilter === 'income' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                typeFilter === 'expense' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Keluar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Waktu & Tanggal</th>
                <th className="py-2.5 px-3">Tipe</th>
                <th className="py-2.5 px-3">Kategori Akun</th>
                <th className="py-2.5 px-3">Keterangan / Referensi</th>
                <th className="py-2.5 px-3">Oleh Petugas</th>
                <th className="py-2.5 px-3 text-right">Nominal Arus Kas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCashFlow.map((cf) => {
                const isIncome = cf.type === 'income';

                return (
                  <tr key={cf.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">
                      {formatDateTimeID(cf.date)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {isIncome ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                        {isIncome ? 'Kas Masuk' : 'Kas Keluar'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {cf.category}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[260px] truncate">
                      {cf.description}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[10px]">
                      {cf.performedBy}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-bold text-xs ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isIncome ? '+' : '-'}{formatRupiah(cf.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* SHIFT BASED REPORTING */}
      {activeReportTab === 'shifts' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Rekapitulasi Laporan Keuangan Per Shift Kasir
              </h3>
              <p className="text-xs text-slate-500">
                Memastikan akuntabilitas kasir secara mandiri untuk menghindari saling tuding selisih kas fisik.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Total {shifts.length} Sesi Shift Tercatat
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. Shift</th>
                  <th className="py-2.5 px-3">Kasir</th>
                  <th className="py-2.5 px-3">Tipe Shift</th>
                  <th className="py-2.5 px-3">Waktu Mulai & Selesai</th>
                  <th className="py-2.5 px-3 text-right">Modal Awal</th>
                  <th className="py-2.5 px-3 text-right">Uang Tunai Laci</th>
                  <th className="py-2.5 px-3 text-right">Total Penjualan</th>
                  <th className="py-2.5 px-3 text-center">Status & Selisih</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map((s) => {
                  const isClosed = s.status === 'closed';
                  const diff = s.cashDifference ?? 0;
                  const isBalanced = diff === 0;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {s.shiftNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{s.cashierName}</div>
                        {s.handoverTo && (
                          <div className="text-[10px] text-slate-400">Serah terima: {s.handoverTo}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {s.shiftType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 font-mono">
                        <div>{formatDateTimeID(s.startTime)}</div>
                        <div className="text-slate-400">{s.endTime ? formatDateTimeID(s.endTime) : 'Sedang Aktif'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatRupiah(s.startingCash)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                        {formatRupiah(s.actualCash ?? s.expectedCash)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-800">
                        {formatRupiah(s.paymentSummary.totalSales)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isClosed ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBalanced
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : diff < 0
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {isBalanced ? 'Pas (Rp 0)' : diff < 0 ? `Minus ${formatRupiah(Math.abs(diff))}` : `Plus ${formatRupiah(diff)}`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold animate-pulse">
                            Sedang Berjalan
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedShiftForReport(s);
                          }}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-semibold rounded text-xs transition cursor-pointer"
                        >
                          Lihat Z-Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-rose-600" />
                Catat Pengeluaran Operasional Gym
              </div>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold text-[11px]">Kategori Pengeluaran *</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none cursor-pointer text-xs"
                >
                  <option value="Maintenance Alat">Maintenance Alat & Treadmill</option>
                  <option value="Listrik & Utilitas">Listrik, Air & Internet</option>
                  <option value="Gaji Karyawan">Gaji Karyawan & Bonus PT</option>
                  <option value="Sewa Tempat">Sewa Tempat & Gedung</option>
                  <option value="Restock Barang">Restock Produk Retail</option>
                  <option value="Lain-lain">Biaya Kebersihan & Lain-lain</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold text-[11px]">Nominal Pengeluaran (Rp) *</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-rose-600 font-mono font-bold text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold text-[11px]">Deskripsi / Keterangan Pembayaran *</label>
                <textarea
                  required
                  rows={2}
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Contoh: Perbaikan kabel pulley station nomor 4 dan pelumasan bearing"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer border border-slate-200 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded shadow-xs cursor-pointer text-xs"
                >
                  Simpan Pengeluaran
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SHIFT REPORT MODAL */}
      <ShiftReportModal
        shift={selectedShiftForReport}
        isOpen={Boolean(selectedShiftForReport)}
        onClose={() => setSelectedShiftForReport(null)}
      />

    </div>
  );
};
