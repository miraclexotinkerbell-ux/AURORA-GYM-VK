import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  QrCode, 
  DollarSign, 
  Receipt, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  Package, 
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { CartItem, CashierShift, Member, MembershipPackage, RetailProduct, Transaction, UserRole } from '../types/gym';
import { gymStorage } from '../utils/gymStorage';
import { soundFx } from '../utils/audio';
import { formatDateID, formatDateTimeID, formatRupiah, getDaysRemaining } from '../utils/helpers';
import { ReceiptModal } from './ReceiptModal';
import { OpenShiftModal } from './OpenShiftModal';
import { CloseShiftModal } from './CloseShiftModal';
import { ShiftReportModal } from './ShiftReportModal';

interface POSViewProps {
  activeRole: UserRole;
  preselectedRenewMemberId?: string | null;
}

export const POSView: React.FC<POSViewProps> = ({
  activeRole,
  preselectedRenewMemberId,
}) => {
  const [activeTab, setActiveTab] = useState<'retail' | 'renewal' | 'history' | 'shifts'>('retail');
  const [products, setProducts] = useState<RetailProduct[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shifts, setShifts] = useState<CashierShift[]>([]);

  // Shift state
  const currentUser = gymStorage.getCurrentUser();
  const [activeShift, setActiveShift] = useState<CashierShift | null>(gymStorage.getActiveShift());
  const [showOpenShiftModal, setShowOpenShiftModal] = useState<boolean>(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState<boolean>(false);
  const [showShiftReportModal, setShowShiftReportModal] = useState<boolean>(false);
  const [selectedShiftForReport, setSelectedShiftForReport] = useState<CashierShift | null>(null);

  // Retail POS Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchProduct, setSearchProduct] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Renewal POS State
  const [renewMemberId, setRenewMemberId] = useState<string>('');
  const [renewPackageId, setRenewPackageId] = useState<string>('');
  const [renewPaymentMethod, setRenewPaymentMethod] = useState<'cash' | 'qris' | 'bank_transfer' | 'debit_card'>('qris');

  // Checkout Payment Modal
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'bank_transfer' | 'debit_card'>('qris');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [customerNameManual, setCustomerNameManual] = useState<string>('Pelanggan Umum');

  // Completed Receipt Modal
  const [activeReceiptTxn, setActiveReceiptTxn] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  useEffect(() => {
    loadData();
    window.addEventListener('aurora_storage_updated', loadData);
    return () => window.removeEventListener('aurora_storage_updated', loadData);
  }, []);

  useEffect(() => {
    if (preselectedRenewMemberId) {
      setActiveTab('renewal');
      setRenewMemberId(preselectedRenewMemberId);
    }
  }, [preselectedRenewMemberId]);

  const loadData = () => {
    setProducts(gymStorage.getProducts());
    setMembers(gymStorage.getMembers());
    const pkgs = gymStorage.getPackages();
    setPackages(pkgs);
    setTransactions(gymStorage.getTransactions());
    setShifts(gymStorage.getShifts());
    setActiveShift(gymStorage.getActiveShift());
    if (pkgs.length > 0 && !renewPackageId) {
      setRenewPackageId(pkgs[0].id);
    }
  };

  // Cart operations
  const handleAddToCart = (product: RetailProduct) => {
    if (product.stock <= 0) {
      soundFx.playDeniedBuzz();
      alert(`Stok ${product.name} habis!`);
      return;
    }

    soundFx.playScanBeep();
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Jumlah melebihi stok yang tersedia (${product.stock} pcs)`);
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stock) {
              alert(`Jumlah melebihi stok yang tersedia (${item.product.stock} pcs)`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0);
    });
  };

  const handleClearCart = () => {
    setCart([]);
    setSelectedMember(null);
    setDiscountPercent(0);
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0);
  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Quick cash calculations
  const cashChange = Math.max(0, cashGiven - cartTotal);

  // Process Retail Checkout
  const handleProcessRetailPayment = () => {
    if (cart.length === 0) return;

    const currentCashierName = currentUser?.name || 'Kasir Aurora';
    const currentCashierId = currentUser?.id || 'usr-cashier';

    const invoiceNum = `INV/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${Math.floor(100 + Math.random() * 900)}`;
    const custName = selectedMember ? selectedMember.name : customerNameManual || 'Pelanggan Umum';
    const custPhone = selectedMember ? selectedMember.phone : undefined;

    const txnItems = cart.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.sellPrice,
      quantity: item.quantity,
      subtotal: item.product.sellPrice * item.quantity,
      category: item.product.category,
    }));

    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      invoiceNumber: invoiceNum,
      date: new Date().toISOString(),
      type: 'pos_retail',
      customerName: custName,
      customerPhone: custPhone,
      memberId: selectedMember?.id,
      items: txnItems,
      subtotal: cartSubtotal,
      discount: discountAmount,
      tax: 0,
      total: cartTotal,
      paymentMethod,
      cashierName: currentCashierName,
      cashierId: currentCashierId,
      shiftId: activeShift?.id,
      status: 'paid',
    };

    // Save transaction
    gymStorage.addTransaction(newTxn);

    // Deduct stock
    cart.forEach(item => {
      gymStorage.updateProductStock(item.product.id, -item.quantity);
    });

    // Record cash flow income
    gymStorage.addCashFlow({
      id: `cf-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'income',
      category: 'Retail POS',
      amount: cartTotal,
      description: `POS Retail: ${txnItems.map(i => `${i.name} (${i.quantity}x)`).join(', ')}`,
      performedBy: currentCashierName,
      referenceId: newTxn.id,
    });

    soundFx.playSuccessChime();
    setShowCheckoutModal(false);
    handleClearCart();

    // Show receipt
    setActiveReceiptTxn(newTxn);
    setShowReceiptModal(true);
    loadData();
  };

  // Process Membership Renewal
  const handleProcessRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewMemberId || !renewPackageId) {
      alert('Pilih member dan paket perpanjangan.');
      return;
    }

    const pkg = packages.find(p => p.id === renewPackageId);
    if (!pkg) return;

    const currentCashierName = currentUser?.name || 'Kasir Aurora';
    gymStorage.renewMember(renewMemberId, pkg, renewPaymentMethod, currentCashierName);
    soundFx.playSuccessChime();

    const lastTxn = gymStorage.getTransactions()[0];
    if (lastTxn) {
      setActiveReceiptTxn(lastTxn);
      setShowReceiptModal(true);
    }
    loadData();
  };

  const categories = ['All', 'Beverages', 'Supplements', 'Snacks', 'Merchandise', 'Accessories'];

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.barcode.includes(searchProduct);
    return matchCat && matchSearch;
  });

  const renewMemberTarget = members.find(m => m.id === renewMemberId);
  const renewPackageTarget = packages.find(p => p.id === renewPackageId);

  return (
    <div className="space-y-4 pb-8 font-sans">
      
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              Kasir & Point of Sales (POS)
            </h2>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono border border-emerald-200">
              Terminal Aktif
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Penjualan retail F&B, suplemen, perpanjangan keanggotaan, dan cetak kuitansi digital instan
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200 shrink-0 flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('retail')}
            className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'retail'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            POS Retail F&B
          </button>
          <button
            onClick={() => setActiveTab('renewal')}
            className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'renewal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Perpanjangan Paket
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Riwayat Struk
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'shifts'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            Laporan Shift ({shifts.length})
          </button>
        </div>
      </div>

      {/* CASHIER SHIFT STATUS / CONTROL BAR */}
      <div className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
        activeShift 
          ? 'bg-teal-50/70 border-teal-200 text-teal-950' 
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            activeShift ? 'bg-teal-600 text-white shadow-xs' : 'bg-amber-500 text-white'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs">
                {activeShift ? `Shift Aktif: ${activeShift.shiftType}` : 'Shift Kasir Belum Dibuka'}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                activeShift ? 'bg-teal-200 text-teal-800' : 'bg-amber-200 text-amber-900'
              }`}>
                {activeShift ? activeShift.shiftNumber : 'Status Kasir: Offline / Closed'}
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {activeShift 
                ? `Kasir: ${activeShift.cashierName} • Mulai: ${formatDateTimeID(activeShift.startTime)} • Modal Awal: ${formatRupiah(activeShift.startingCash)}`
                : 'Buka shift untuk memasukkan modal awal laci kasir dan memulai rekapitulasi penjualan mandiri.'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {activeShift ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedShiftForReport(activeShift);
                  setShowShiftReportModal(true);
                }}
                className="px-3 py-1.5 bg-white hover:bg-teal-100 text-teal-900 font-bold rounded text-xs border border-teal-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Lihat Rekap Shift</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCloseShiftModal(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Tutup Shift & Rekap Kas</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowOpenShiftModal(true)}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buka Shift Sekarang</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: POS RETAIL */}
      {activeTab === 'retail' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Products Catalog (Left 7 or 8 Cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-3">
            
            {/* Search & Category Filter */}
            <div className="bg-white border border-slate-200 p-3.5 rounded-lg shadow-xs space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  placeholder="Cari produk / scan barcode (e.g. Whey, Pocari, Shaker, 8991001001)..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-xs text-slate-800 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= p.minStockAlert;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(p)}
                    className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      isOutOfStock
                        ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-teal-500 shadow-xs active:scale-98'
                    }`}
                  >
                    {isLowStock && (
                      <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        Sisa {p.stock}
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200">
                        Habis
                      </span>
                    )}

                    <div className="space-y-1.5 w-full">
                      <div className="w-full h-20 rounded bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">
                          {p.category}
                        </div>
                        <div className="font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-teal-600 transition">
                          {p.name}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between w-full">
                      <span className="font-bold text-slate-900 text-xs">
                        {formatRupiah(p.sellPrice)}
                      </span>
                      <div className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition">
                        <Plus className="w-3 h-3" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Cart & Checkout Panel (Right 5 or 4 Cols) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3.5 shadow-xs">
            
            <div className="space-y-3">
              {/* Cart Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <ShoppingCart className="w-4 h-4 text-teal-600" />
                  Keranjang Kasir ({cart.reduce((sum, i) => sum + i.quantity, 0)} Item)
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* Member Selector for Discount */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                  <span>Pilih Member (Diskon Khusus):</span>
                  {selectedMember && (
                    <span className="text-teal-600 text-[10px] font-bold">Diskon Member 5%</span>
                  )}
                </label>
                <select
                  value={selectedMember?.id || ''}
                  onChange={(e) => {
                    const m = members.find(mem => mem.id === e.target.value);
                    setSelectedMember(m || null);
                    setDiscountPercent(m ? 5 : 0);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-xs text-slate-800 outline-none cursor-pointer"
                >
                  <option value="">-- Non-Member / Pelanggan Umum --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id}) - {m.packageName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <Package className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                    Keranjang masih kosong.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs text-slate-800 truncate">
                          {item.product.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatRupiah(item.product.sellPrice)}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                          className="w-5 h-5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="font-mono font-bold text-xs text-slate-800 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
                          className="w-5 h-5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="text-right shrink-0 w-16">
                        <div className="font-bold text-xs text-slate-900 font-mono">
                          {formatRupiah(item.product.sellPrice * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Checkout Button */}
            <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-slate-800 font-mono">{formatRupiah(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Diskon ({discountPercent}%):</span>
                    <span className="font-mono">-{formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total Tagihan:</span>
                  <span className="text-teal-600 font-mono text-base font-black">{formatRupiah(cartTotal)}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setCashGiven(cartTotal);
                  setShowCheckoutModal(true);
                }}
                className={`w-full py-2 rounded font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                  cart.length > 0
                    ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 active:scale-98'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Bayar & Cetak Struk ({formatRupiah(cartTotal)})
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: MEMBERSHIP RENEWAL (PERPANJANGAN) */}
      {activeTab === 'renewal' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-teal-600" />
              Proses Perpanjangan Paket Keanggotaan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih member, pilih paket baru/perpanjangan, dan terbitkan kuitansi pembayaran instan
            </p>
          </div>

          <form onSubmit={handleProcessRenewal} className="space-y-3.5 text-xs text-slate-700">
            
            {/* Select Member */}
            <div className="space-y-1">
              <label className="text-slate-600 font-semibold">Pilih Member Yang Akan Diperpanjang *</label>
              <select
                required
                value={renewMemberId}
                onChange={(e) => setRenewMemberId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-800 outline-none cursor-pointer"
              >
                <option value="">-- Pilih Member --</option>
                {members.map((m) => {
                  const days = getDaysRemaining(m.endDate);
                  return (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id}) • {m.packageName} • {days <= 0 ? 'EXPIRED' : `Sisa ${days} Hari`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Target Member Card Preview */}
            {renewMemberTarget && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                <img
                  src={renewMemberTarget.avatar}
                  alt={renewMemberTarget.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-900 text-xs truncate">
                    {renewMemberTarget.name} ({renewMemberTarget.id})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Paket Saat Ini: <span className="text-slate-700 font-medium">{renewMemberTarget.packageName}</span>
                  </div>
                  <div className="text-[10px] text-amber-700 font-medium">
                    Berlaku s/d: {formatDateID(renewMemberTarget.endDate)}
                  </div>
                </div>
              </div>
            )}

            {/* Select Package */}
            <div className="space-y-1">
              <label className="text-slate-600 font-semibold">Pilih Paket Perpanjangan Baru *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {packages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition flex flex-col justify-between ${
                      renewPackageId === pkg.id
                        ? 'bg-teal-50 border-teal-400 text-teal-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="renewPackage"
                      value={pkg.id}
                      checked={renewPackageId === pkg.id}
                      onChange={() => setRenewPackageId(pkg.id)}
                      className="hidden"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{pkg.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Durasi {pkg.durationMonths} Bulan
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-xs mt-2">
                      {formatRupiah(pkg.price)}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1 pt-1">
              <label className="text-slate-600 font-semibold">Metode Pembayaran</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'qris', label: 'QRIS' },
                  { id: 'cash', label: 'Tunai (Cash)' },
                  { id: 'bank_transfer', label: 'Transfer Bank' },
                  { id: 'debit_card', label: 'Kartu Debit' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setRenewPaymentMethod(m.id as any)}
                    className={`py-1.5 px-2 rounded border text-xs font-semibold transition cursor-pointer ${
                      renewPaymentMethod === m.id
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Calculation & Action */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500">Total Biaya Perpanjangan:</div>
                <div className="text-base font-black text-slate-900 font-mono">
                  {formatRupiah(renewPackageTarget?.price || 0)}
                </div>
              </div>

              <button
                type="submit"
                disabled={!renewMemberId}
                className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                Proses Perpanjangan
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TAB 3: TRANSACTION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-teal-600" />
              Riwayat Transaksi Kasir & Kuitansi Digital
            </h3>
            <span className="text-[11px] text-slate-400">
              Total {transactions.length} Transaksi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">No. Invoice & Waktu</th>
                  <th className="py-2.5 px-4">Tipe Transaksi</th>
                  <th className="py-2.5 px-4">Pelanggan</th>
                  <th className="py-2.5 px-4">Item Transaksi</th>
                  <th className="py-2.5 px-4">Metode</th>
                  <th className="py-2.5 px-4 text-right">Total Bayar</th>
                  <th className="py-2.5 px-4 text-right">Kuitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">{txn.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400">{formatDateTimeID(txn.date)}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        txn.type.includes('membership')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {txn.type === 'pos_retail' ? 'Retail F&B' : 'Membership'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {txn.customerName}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px] max-w-[200px] truncate">
                      {txn.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                    </td>
                    <td className="py-2.5 px-4 uppercase font-bold text-[10px] text-slate-600">
                      {txn.paymentMethod}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold font-mono text-slate-900">
                      {formatRupiah(txn.total)}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveReceiptTxn(txn);
                          setShowReceiptModal(true);
                        }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition cursor-pointer"
                      >
                        Buka Struk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SHIFT HISTORY & AUDIT */}
      {activeTab === 'shifts' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Daftar & Rekapitulasi Shift Kasir
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan shift terpisah untuk mencegah perselisihan kas dan laporan yang merugikan staf kasir.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!activeShift && (
                <button
                  type="button"
                  onClick={() => setShowOpenShiftModal(true)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Buka Shift Baru</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. Shift</th>
                  <th className="py-2.5 px-3">Kasir</th>
                  <th className="py-2.5 px-3">Tipe Shift</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3 text-right">Modal Awal</th>
                  <th className="py-2.5 px-3 text-right">Penjualan Tunai</th>
                  <th className="py-2.5 px-3 text-right">Total Omzet</th>
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
                          <div className="text-[10px] text-slate-400">→ {s.handoverTo}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {s.shiftType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 font-mono">
                        <div>{formatDateTimeID(s.startTime)}</div>
                        <div className="text-slate-400">{s.endTime ? formatDateTimeID(s.endTime) : 'Masih Berjalan'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatRupiah(s.startingCash)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                        +{formatRupiah(s.paymentSummary.cash)}
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
                            {isBalanced ? 'Selesai (Pas)' : diff < 0 ? `Minus ${formatRupiah(Math.abs(diff))}` : `Plus ${formatRupiah(diff)}`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold animate-pulse">
                            Sedang Aktif
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedShiftForReport(s);
                            setShowShiftReportModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-xs transition cursor-pointer"
                        >
                          Cetak Rekap
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

      {/* RETAIL CHECKOUT PAYMENT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-teal-600" />
                Pembayaran Transaksi Retail
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 rounded hover:bg-slate-200 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs text-slate-700">
              
              {/* Grand Total Display */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-0.5">
                <div className="text-slate-500 text-xs">Total Tagihan Kasir:</div>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {formatRupiah(cartTotal)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {cart.length} Jenis Produk • {selectedMember ? `Member: ${selectedMember.name}` : 'Pelanggan Umum'}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold">Pilih Cara Pembayaran:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2 rounded border font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'qris'
                        ? 'bg-teal-50 border-teal-400 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" /> QRIS Instant
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2 rounded border font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'cash'
                        ? 'bg-teal-50 border-teal-400 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Tunai (Cash)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-2 rounded border font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-teal-50 border-teal-400 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Transfer Bank
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('debit_card')}
                    className={`p-2 rounded border font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'debit_card'
                        ? 'bg-teal-50 border-teal-400 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Kartu Debit
                  </button>
                </div>
              </div>

              {/* QRIS Mockup */}
              {paymentMethod === 'qris' && (
                <div className="p-3 bg-slate-50 text-slate-800 rounded-lg text-center space-y-1 border border-slate-200">
                  <div className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                    Scan QRIS Aurora Gym
                  </div>
                  <div className="w-28 h-28 mx-auto bg-white p-2 rounded flex items-center justify-center border border-slate-200">
                    <QrCode className="w-20 h-20 text-slate-900" />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    BCA, GoPay, OVO, Dana, ShopeePay, Mandiri Livin
                  </div>
                </div>
              )}

              {/* Cash Given & Change Input */}
              {paymentMethod === 'cash' && (
                <div className="space-y-1.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Uang Diterima:</span>
                    <input
                      type="number"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(Number(e.target.value))}
                      className="w-28 px-2 py-1 bg-white border border-slate-200 rounded text-right font-mono font-bold text-slate-900 text-xs"
                    />
                  </div>
                  <div className="flex gap-1">
                    {[cartTotal, 50000, 100000, 200000, 500000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashGiven(amt)}
                        className="px-1.5 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-[10px] font-mono cursor-pointer"
                      >
                        {formatRupiah(amt)}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 text-xs">
                    <span className="text-slate-600 font-medium">Kembalian:</span>
                    <span className="font-bold text-teal-700 font-mono">
                      {formatRupiah(cashChange)}
                    </span>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleProcessRetailPayment}
                  className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded shadow-xs transition cursor-pointer active:scale-98"
                >
                  Selesaikan Transaksi & Cetak Struk
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      <ReceiptModal
        transaction={activeReceiptTxn}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />

      {/* OPEN SHIFT MODAL */}
      <OpenShiftModal
        isOpen={showOpenShiftModal}
        currentUser={currentUser}
        onClose={() => setShowOpenShiftModal(false)}
        onShiftOpened={(newShift) => {
          setShowOpenShiftModal(false);
          setActiveShift(newShift);
          loadData();
        }}
      />

      {/* CLOSE SHIFT MODAL */}
      <CloseShiftModal
        isOpen={showCloseShiftModal}
        shift={activeShift}
        onClose={() => setShowCloseShiftModal(false)}
        onShiftClosed={(closedShift) => {
          setShowCloseShiftModal(false);
          setActiveShift(null);
          loadData();
          setSelectedShiftForReport(closedShift);
          setShowShiftReportModal(true);
        }}
      />

      {/* SHIFT REPORT MODAL */}
      <ShiftReportModal
        shift={selectedShiftForReport}
        isOpen={showShiftReportModal}
        onClose={() => {
          setShowShiftReportModal(false);
          setSelectedShiftForReport(null);
        }}
      />

    </div>
  );
};
