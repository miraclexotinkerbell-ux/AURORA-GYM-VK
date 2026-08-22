import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Dumbbell, 
  Calendar, 
  Clock, 
  CreditCard,
  Phone
} from 'lucide-react';
import { Transaction } from '../types/gym';
import { formatDateID, formatDateTimeID, formatRupiah, createWhatsAppReceiptLink } from '../utils/helpers';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppSend = () => {
    if (!transaction.customerPhone && !transaction.memberId) {
      alert('Nomor WhatsApp pelanggan belum tercatat.');
      return;
    }
    const phone = transaction.customerPhone || '081234567890';
    const waUrl = createWhatsAppReceiptLink(
      phone,
      transaction.invoiceNumber,
      transaction.customerName,
      transaction.total
    );
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Actions */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            Kuitansi / Struk Pembayaran
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal Receipt (58mm / 80mm styled) */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-50 flex justify-center">
          <div 
            id="printable-area"
            className="w-full max-w-[320px] bg-white text-slate-950 p-4 rounded-lg shadow-xs font-mono text-xs border border-slate-200"
          >
            {/* Gym Brand Header */}
            <div className="text-center pb-3 border-b-2 border-dashed border-slate-300 space-y-1">
              <h3 className="font-bold text-xs tracking-wider uppercase text-slate-900">
                AURORA GYM & FITNESS
              </h3>
              <p className="text-[10px] text-slate-500">
                Jl. Soekarno-Hatta No. 88, Malang<br />
                Telp/WA: 0812-8888-9999 • auroragym.id
              </p>
              <div className="text-[10px] font-bold bg-slate-100 py-0.5 rounded text-slate-700">
                BUKTI PEMBAYARAN RESMI (LUNAS)
              </div>
            </div>

            {/* Invoice Info */}
            <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>No. Invoice:</span>
                <span className="font-bold text-slate-900">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatDateTimeID(transaction.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-semibold text-slate-900">{transaction.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{transaction.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-bold uppercase text-slate-800">{transaction.paymentMethod}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="py-2.5 border-b-2 border-dashed border-slate-300 space-y-1.5">
              <div className="flex justify-between font-bold text-[10px] text-slate-400 uppercase">
                <span>Item</span>
                <span>Qty x Harga</span>
                <span>Total</span>
              </div>
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-xs">
                    {item.name}
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{item.quantity}x @ {formatRupiah(item.price)}</span>
                    <span className="font-semibold text-slate-900">{formatRupiah(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Calculation */}
            <div className="py-2 border-b-2 border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(transaction.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs text-slate-950 pt-1 border-t border-slate-200">
                <span>TOTAL BAYAR:</span>
                <span className="text-teal-700 font-mono font-bold">{formatRupiah(transaction.total)}</span>
              </div>
            </div>

            {/* Thermal Footer Notice */}
            <div className="pt-2.5 text-center space-y-0.5 text-[10px] text-slate-400">
              <p className="font-semibold text-slate-600">
                Terima kasih atas kunjungan Anda!
              </p>
              <p>
                Barang yang sudah dibeli tidak dapat ditukar/dikembalikan kecuali cacat pabrik.
              </p>
              <p className="font-mono text-[9px] text-slate-400 pt-0.5">
                Generated by Aurora Gym POS Cloud
              </p>
            </div>

          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 no-print">
          <button
            onClick={handleWhatsAppSend}
            className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Kirim WA
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-1.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Struk
          </button>
        </div>

      </div>
    </div>
  );
};
