import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  Share2, 
  Download, 
  Dumbbell, 
  Calendar, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  QrCode
} from 'lucide-react';
import { Member } from '../types/gym';
import { formatDateID, formatRupiah, getDaysRemaining, getSessionBadge } from '../utils/helpers';

interface MemberCardModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (member) {
      QRCode.toDataURL(
        `AURORA-MEMBER:${member.id}:${member.barcode}:${member.name}`,
        { width: 200, margin: 1, color: { dark: '#020617', light: '#ffffff' } },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const badge = getSessionBadge(member.sessionCategory);
  const daysRemaining = getDaysRemaining(member.endDate);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = (member.phone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : (cleanPhone || '6281200000000');
    const msg = `Halo Kak ${member.name}!\n\nBerikut adalah Kartu Digital Member resmi Anda di *Aurora Gym*:\n*ID Member:* ${member.id}\n*Barcode:* ${member.barcode}\n*Paket:* ${member.packageName}\n*Kategori Sesi:* ${badge.label}\n*Masa Aktif:* ${formatDateID(member.startDate)} s/d ${formatDateID(member.endDate)}\n\nTunjukkan barcode/QR code ini saat check-in di terminal gym!\n\n_Salam Sehat,_\n*Aurora Gym*`;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Kartu Keanggotaan Digital
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="p-4 flex flex-col items-center justify-center bg-slate-100/60">
          <div 
            id="printable-area"
            className="w-full max-w-sm rounded-xl bg-slate-900 border-2 border-teal-500/50 p-4 shadow-xl relative overflow-hidden text-white"
          >
            {/* Background Glow Accents */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-teal-500/15 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />

            {/* Card Brand Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-xs">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs tracking-wider text-teal-400 leading-none">
                    AURORA GYM
                  </h3>
                  <span className="text-[9px] text-slate-400 font-mono tracking-tight">
                    OFFICIAL MEMBER PASS
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                {member.id}
              </span>
            </div>

            {/* Member Profile Body */}
            <div className="py-3 flex items-center gap-3 relative z-10">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-16 h-16 rounded-lg object-cover border-2 border-teal-400/60 shadow-md shrink-0"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="font-bold text-sm text-white truncate">
                  {member.name}
                </h4>
                <div className="text-[11px] text-teal-400 font-medium truncate">
                  {member.packageName}
                </div>
                <div className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                  {badge.label}
                </div>
              </div>
            </div>

            {/* Validity Details */}
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] space-y-1 relative z-10 mb-3">
              <div className="flex justify-between text-slate-400">
                <span>Mulai:</span>
                <span className="text-slate-200 font-medium">{formatDateID(member.startDate)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Berlaku Hingga:</span>
                <span className="text-teal-400 font-bold">{formatDateID(member.endDate)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sisa Masa Aktif:</span>
                <span className={`font-semibold ${daysRemaining <= 3 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} Hari`}
                </span>
              </div>
            </div>

            {/* Barcode & QR Code Section */}
            <div className="flex items-center justify-between gap-2.5 pt-2.5 border-t border-slate-800 relative z-10 bg-slate-950/60 p-2 rounded-lg">
              <div className="space-y-0.5">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">
                  RFID / Barcode ID
                </div>
                <div className="font-mono text-xs font-bold tracking-widest text-teal-300">
                  {member.barcode}
                </div>
                <div className="text-[8px] text-slate-500 font-mono">
                  Scan untuk akses gerbang masuk
                </div>
              </div>

              {qrDataUrl && (
                <div className="p-1 bg-white rounded shadow-xs shrink-0">
                  <img src={qrDataUrl} alt="QR Code Member" className="w-12 h-12" />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2 no-print">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-teal-600" />
            WhatsApp
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-1.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Kartu
          </button>
        </div>

      </div>
    </div>
  );
};
