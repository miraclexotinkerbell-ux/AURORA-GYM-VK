import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Edit3, 
  RefreshCw, 
  DollarSign, 
  Sparkles, 
  CheckCircle2,
  Trash2,
  Boxes,
  Barcode
} from 'lucide-react';
import { RetailProduct, UserRole } from '../types/gym';
import { gymStorage } from '../utils/gymStorage';
import { soundFx } from '../utils/audio';
import { formatRupiah, ROLE_PERMISSIONS } from '../utils/helpers';

interface InventoryViewProps {
  activeRole: UserRole;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ activeRole }) => {
  const [products, setProducts] = useState<RetailProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<RetailProduct | null>(null);
  const [restockProduct, setRestockProduct] = useState<RetailProduct | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockSupplierNote, setRestockSupplierNote] = useState<string>('Restock rutin supplier');

  // Form State
  const [formData, setFormData] = useState<{
    sku: string;
    name: string;
    category: RetailProduct['category'];
    buyPrice: number;
    sellPrice: number;
    stock: number;
    minStockAlert: number;
    barcode: string;
    image: string;
  }>({
    sku: `AUR-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    category: 'Beverages',
    buyPrice: 10000,
    sellPrice: 15000,
    stock: 20,
    minStockAlert: 5,
    barcode: `899${Math.floor(1000000 + Math.random() * 9000000)}`,
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=150&auto=format&fit=crop&q=80',
  });

  const perm = ROLE_PERMISSIONS[activeRole];

  useEffect(() => {
    loadData();
    window.addEventListener('aurora_storage_updated', loadData);
    return () => window.removeEventListener('aurora_storage_updated', loadData);
  }, []);

  const loadData = () => {
    setProducts(gymStorage.getProducts());
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      sku: `AUR-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Beverages',
      buyPrice: 10000,
      sellPrice: 15000,
      stock: 20,
      minStockAlert: 5,
      barcode: `899${Math.floor(1000000 + Math.random() * 9000000)}`,
      image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=150&auto=format&fit=crop&q=80',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: RetailProduct) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      category: p.category,
      buyPrice: p.buyPrice,
      sellPrice: p.sellPrice,
      stock: p.stock,
      minStockAlert: p.minStockAlert,
      barcode: p.barcode,
      image: p.image,
    });
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingProduct) {
      const updated: RetailProduct = {
        ...editingProduct,
        ...formData,
      };
      const list = products.map(p => p.id === editingProduct.id ? updated : p);
      gymStorage.saveProducts(list);
      gymStorage.addAuditLog('Update Produk Inventaris', `Memperbarui data produk ${formData.name} (${formData.sku})`);
    } else {
      const newProduct: RetailProduct = {
        id: `prd-${Date.now()}`,
        ...formData,
        soldCount: 0,
      };
      gymStorage.saveProducts([...products, newProduct]);
      gymStorage.addAuditLog('Tambah Produk Baru', `Menambahkan produk baru ${formData.name} (${formData.sku})`);
      soundFx.playSuccessChime();
    }

    setShowAddModal(false);
    loadData();
  };

  const handleProcessRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct || restockQty <= 0) return;

    const totalExpense = restockProduct.buyPrice * restockQty;

    gymStorage.updateProductStock(restockProduct.id, restockQty);

    gymStorage.addCashFlow({
      id: `cf-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'expense',
      category: 'Restock Barang',
      amount: totalExpense,
      description: `Restock ${restockQty}x ${restockProduct.name} (${restockSupplierNote})`,
      performedBy: perm.title,
    });

    gymStorage.addAuditLog('Restock Barang', `Menambah ${restockQty} pcs ${restockProduct.name} senilai ${formatRupiah(totalExpense)}`);
    soundFx.playSuccessChime();
    setRestockProduct(null);
    loadData();
  };

  // Metrics
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const totalStockAssetValue = products.reduce((sum, p) => sum + (p.buyPrice * p.stock), 0);
  const totalSoldItems = products.reduce((sum, p) => sum + p.soldCount, 0);
  const lowStockList = products.filter(p => p.stock <= p.minStockAlert);

  const categories = ['All', 'Beverages', 'Supplements', 'Snacks', 'Merchandise', 'Accessories'];

  const filteredProducts = products.filter(p => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.barcode.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-4 pb-8 font-sans">
      
      {/* Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              Manajemen Inventaris & Stok
            </h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold font-mono border border-slate-200">
              {products.length} SKU
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kontrol stok real-time, sinkronisasi kasir retail, peringatan stok menipis, dan margin profit
          </p>
        </div>

        {perm.canEditInventory && (
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Produk
          </button>
        )}
      </div>

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Total Unit Stok</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {totalStockItems} <span className="text-xs text-slate-400 font-normal font-sans">Pcs</span>
          </div>
          <div className="text-[10px] text-slate-400">Dari {products.length} varian SKU produk</div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Nilai Modal Stok</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatRupiah(totalStockAssetValue)}
          </div>
          <div className="text-[10px] text-slate-400">Berdasarkan harga beli gudang</div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Total Terjual (Sales)</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {totalSoldItems} <span className="text-xs text-slate-400 font-normal font-sans">Pcs</span>
          </div>
          <div className="text-[10px] text-slate-400">Penjualan kasir POS retail</div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Alert Stok Menipis</span>
          <div className={`text-xl font-bold font-mono ${lowStockList.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {lowStockList.length} <span className="text-xs text-slate-400 font-normal font-sans">Produk</span>
          </div>
          <div className="text-[10px] text-slate-400">Perlu restock segera</div>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockList.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">
                Peringatan Stok Rendah: {lowStockList.map(p => `${p.name} (${p.stock} pcs)`).join(', ')}
              </div>
              <div className="text-[11px] text-slate-600">
                Stok berada di bawah batas minimum pemesanan. Segera lakukan restock untuk kasir.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs space-y-2">
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari SKU, nama barang, atau barcode..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-xs text-slate-800 placeholder:text-slate-400 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Kategori:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-2.5 py-1.5 outline-none focus:bg-white focus:border-teal-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Products Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4">Produk & SKU</th>
                <th className="py-2.5 px-4">Kategori</th>
                <th className="py-2.5 px-4">Harga Modal</th>
                <th className="py-2.5 px-4">Harga Jual</th>
                <th className="py-2.5 px-4">Margin Laba</th>
                <th className="py-2.5 px-4">Sisa Stok</th>
                <th className="py-2.5 px-4">Terjual</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const margin = p.sellPrice - p.buyPrice;
                const marginPct = Math.round((margin / p.sellPrice) * 100);
                const isLow = p.stock <= p.minStockAlert;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Product Name & SKU */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 text-xs truncate max-w-[200px]">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.2">
                            <span>{p.sku}</span>
                            <span>•</span>
                            <span className="text-slate-400">{p.barcode}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-4">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>

                    {/* Buy Price */}
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      {formatRupiah(p.buyPrice)}
                    </td>

                    {/* Sell Price */}
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {formatRupiah(p.sellPrice)}
                    </td>

                    {/* Margin */}
                    <td className="py-2.5 px-4">
                      <div className="font-mono text-xs font-semibold text-slate-800">+{formatRupiah(margin)}</div>
                      <div className="text-[10px] text-teal-600 font-medium">{marginPct}% Margin</div>
                    </td>

                    {/* Stock Quantity */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold text-xs ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                          {p.stock} Pcs
                        </span>
                        {isLow && (
                          <span className="px-1 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-bold">
                            LOW
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">Min: {p.minStockAlert} pcs</div>
                    </td>

                    {/* Sold Count */}
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {p.soldCount} Pcs
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Restock Action */}
                        <button
                          onClick={() => {
                            setRestockProduct(p);
                            setRestockQty(10);
                          }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold border border-slate-200 transition cursor-pointer flex items-center gap-1"
                          title="Restock Barang"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          Restock
                        </button>

                        {/* Edit Action */}
                        {perm.canEditInventory && (
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTOCK MODAL */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                Restock Stok Barang
              </div>
              <button
                onClick={() => setRestockProduct(null)}
                className="p-1 rounded hover:bg-slate-200 text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessRestock} className="p-4 space-y-3 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <img
                  src={restockProduct.image}
                  alt={restockProduct.name}
                  className="w-10 h-10 rounded object-cover border border-slate-200"
                />
                <div className="min-w-0 space-y-0.5">
                  <div className="font-semibold text-slate-900 text-xs truncate">
                    {restockProduct.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Stok: {restockProduct.stock} Pcs • Modal: {formatRupiah(restockProduct.buyPrice)}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold">Jumlah Tambahan Stok (Pcs) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-900 font-mono font-bold outline-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold">Catatan Supplier / Invoice</label>
                <input
                  type="text"
                  value={restockSupplierNote}
                  onChange={(e) => setRestockSupplierNote(e.target.value)}
                  placeholder="Contoh: Supplier CV Sejahtera - Faktur #9921"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-800 outline-none text-xs"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500">Pengeluaran Kas:</span>
                <span className="font-mono font-bold text-rose-600 text-xs">
                  -{formatRupiah(restockProduct.buyPrice * restockQty)}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded shadow-xs cursor-pointer text-xs"
                >
                  Konfirmasi Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-teal-600" />
                {editingProduct ? 'Edit Data Produk Retail' : 'Tambah Produk Retail Baru'}
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-slate-200 text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 overflow-y-auto space-y-2.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">SKU / Kode Barang *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-900 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">Barcode EAN/UPC *</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-900 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: IsoFlex Whey Shake 400ml"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">Kategori Produk</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Beverages">Beverages (Minuman)</option>
                    <option value="Supplements">Supplements (Suplemen)</option>
                    <option value="Snacks">Snacks (Camilan Sehat)</option>
                    <option value="Merchandise">Merchandise (Botol/Shaker)</option>
                    <option value="Accessories">Accessories (Strap/Handuk)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">Stok Awal</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-900 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">Harga Beli Modal (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-900 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">Harga Jual Kasir (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-900 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">Batas Minimum Alert Stok</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-900 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">URL Foto Produk</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-700 outline-none truncate"
                  />
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded shadow-xs cursor-pointer"
                >
                  Simpan Produk
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
