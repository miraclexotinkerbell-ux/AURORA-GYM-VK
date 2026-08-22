import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Star, 
  Calendar, 
  Clock, 
  Phone, 
  Award, 
  Plus, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles,
  Users,
  Dumbbell,
  Search,
  X
} from 'lucide-react';
import { Member, PTSessionBooking, Trainer, UserRole } from '../types/gym';
import { gymStorage } from '../utils/gymStorage';
import { soundFx } from '../utils/audio';
import { formatDateID, formatDateTimeID, formatRupiah } from '../utils/helpers';

interface TrainerManagementViewProps {
  activeRole: UserRole;
}

export const TrainerManagementView: React.FC<TrainerManagementViewProps> = ({ activeRole }) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [bookings, setBookings] = useState<PTSessionBooking[]>([]);
  
  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [bookingMemberId, setBookingMemberId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState<string>('10:00');
  const [bookingTopic, setBookingTopic] = useState<string>('Program Hipertrofi & Teknik Squat');

  useEffect(() => {
    loadData();
    window.addEventListener('aurora_storage_updated', loadData);
    return () => window.removeEventListener('aurora_storage_updated', loadData);
  }, []);

  const loadData = () => {
    setTrainers(gymStorage.getTrainers());
    setMembers(gymStorage.getMembers());
    setBookings(gymStorage.getPTBookings());
  };

  const handleOpenBooking = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    if (members.length > 0) setBookingMemberId(members[0].id);
    setShowBookingModal(true);
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer || !bookingMemberId) return;

    const member = members.find(m => m.id === bookingMemberId);
    if (!member) return;

    const newBooking: PTSessionBooking = {
      id: `pt-book-${Date.now()}`,
      trainerId: selectedTrainer.id,
      trainerName: selectedTrainer.name,
      memberId: member.id,
      memberName: member.name,
      date: bookingDate,
      time: bookingTime,
      durationMinutes: 60,
      topic: bookingTopic,
      status: 'scheduled',
    };

    gymStorage.addPTBooking(newBooking);

    // Transaction & Cashflow
    const newTxn = {
      id: `txn-${Date.now()}`,
      invoiceNumber: `INV/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString(),
      type: 'pt_booking' as const,
      customerName: member.name,
      customerPhone: member.phone,
      memberId: member.id,
      items: [
        {
          id: selectedTrainer.id,
          name: `Sesi PT 60 Min: ${selectedTrainer.name}`,
          price: selectedTrainer.sessionRate,
          quantity: 1,
          subtotal: selectedTrainer.sessionRate,
          category: 'PT Session',
        }
      ],
      subtotal: selectedTrainer.sessionRate,
      discount: 0,
      tax: 0,
      total: selectedTrainer.sessionRate,
      paymentMethod: 'qris' as const,
      cashierName: 'Frontdesk / PT Terminal',
      status: 'paid' as const,
    };
    gymStorage.addTransaction(newTxn);

    gymStorage.addCashFlow({
      id: `cf-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'income',
      category: 'PT Session',
      amount: selectedTrainer.sessionRate,
      description: `Sesi PT: ${selectedTrainer.name} dengan ${member.name}`,
      performedBy: 'Frontdesk / PT Terminal',
      referenceId: newTxn.id,
    });

    soundFx.playSuccessChime();
    setShowBookingModal(false);
    loadData();
  };

  const handleUpdateBookingStatus = (bookingId: string, nextStatus: PTSessionBooking['status']) => {
    const list = bookings.map(b => b.id === bookingId ? { ...b, status: nextStatus } : b);
    setBookings(list);
    localStorage.setItem('aurora_gym_pt_bookings_v1', JSON.stringify(list));
    soundFx.playSuccessChime();
  };

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 leading-none">
              Direktori Personal Trainer (PT)
            </h2>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold font-mono border border-teal-200">
              {trainers.length} Trainer Tersertifikasi
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Daftar pelatih kebugaran profesional, keahlian khusus, ketersediaan sesi, dan booking jadwal member
          </p>
        </div>
      </div>

      {/* Trainer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {trainers.map((t) => {
          const isAvailable = t.status === 'available';
          const isInSession = t.status === 'in_session';

          return (
            <div
              key={t.id}
              className="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition space-y-3 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-xs"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {t.name}
                      </h3>
                      <div className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 mt-0.5">
                        <Award className="w-3 h-3 text-teal-600" />
                        {t.certification}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <div className="flex items-center text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-amber-500 mr-0.5 text-amber-500" />
                          {t.rating.toFixed(1)} ({t.reviewCount} ulasan)
                        </div>
                        <span>•</span>
                        <span>{t.totalClients} Klien Aktif</span>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isInSession
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isAvailable ? '🟢 Tersedia' : isInSession ? '🟡 Sedang Sesi' : '⚪ Libur'}
                  </span>
                </div>

                {/* Specialties Tags */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {t.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {t.bio}
                </p>

                {/* Rates & Schedule */}
                <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Tarif Per Sesi (60 Menit):</span>
                    <span className="font-bold text-teal-700 font-mono">{formatRupiah(t.sessionRate)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Paket Bulanan (12 Sesi):</span>
                    <span className="font-bold text-slate-800 font-mono">{formatRupiah(t.monthlyRate)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    Jadwal: {t.availableSchedule.map(s => `${s.day} (${s.hours})`).join(' • ')}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`https://wa.me/62${t.phone.slice(1)}?text=Halo%20${encodeURIComponent(t.name)},%20saya%20tertarik%20untuk%20konsultasi%20sesi%20Personal%20Trainer%20di%20Aurora%20Gym.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                  WhatsApp
                </a>

                <button
                  onClick={() => handleOpenBooking(t)}
                  className="flex-1 py-1.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Booking Sesi PT
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* PT Booking Schedule List */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-xs text-slate-800">
              Jadwal Sesi Personal Trainer (Booking Log)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {bookings.length} Sesi Terjadwal
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Belum ada booking sesi PT yang aktif. Klik "Booking Sesi PT" pada pelatih di atas.
          </div>
        ) : (
          <div className="space-y-1.5">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-2.5 bg-slate-50 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-100/70 transition"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <span>{b.memberName}</span>
                    <span className="text-slate-400">bersama</span>
                    <span className="text-teal-700 font-semibold">{b.trainerName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDateID(b.date)}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-teal-700 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {b.time} WIB ({b.durationMinutes} Menit)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">
                    Topik: {b.topic}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    b.status === 'scheduled'
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : b.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {b.status === 'scheduled' ? 'Terjadwal' : b.status === 'completed' ? 'Selesai' : b.status}
                  </span>

                  {b.status === 'scheduled' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-teal-700 border border-teal-300 rounded text-[11px] font-semibold transition cursor-pointer shadow-xs"
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Booking Sesi Personal Trainer
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="p-4 space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center gap-2.5">
                <img
                  src={selectedTrainer.photo}
                  alt={selectedTrainer.name}
                  className="w-11 h-11 rounded-lg object-cover border border-slate-200"
                />
                <div className="min-w-0 space-y-0.5">
                  <div className="font-bold text-slate-800 text-xs truncate">
                    {selectedTrainer.name}
                  </div>
                  <div className="text-[11px] text-teal-700 font-mono font-bold">
                    Tarif Sesi: {formatRupiah(selectedTrainer.sessionRate)} (60 Menit)
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold text-[11px]">Pilih Member Gym *</label>
                <select
                  value={bookingMemberId}
                  onChange={(e) => setBookingMemberId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none cursor-pointer text-xs"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id}) - {m.packageName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold text-[11px]">Tanggal Sesi *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold text-[11px]">Jam Sesi (WIB) *</label>
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 font-mono outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold text-[11px]">Fokus / Target Latihan</label>
                <input
                  type="text"
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value)}
                  placeholder="Contoh: Fat loss kardio, teknik deadlift..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded text-slate-900 outline-none text-xs"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Total Biaya Sesi:</span>
                <span className="font-mono font-bold text-teal-700 text-sm">
                  {formatRupiah(selectedTrainer.sessionRate)}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer border border-slate-200 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded shadow-xs cursor-pointer text-xs"
                >
                  Konfirmasi Booking & Buat Invoice
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
