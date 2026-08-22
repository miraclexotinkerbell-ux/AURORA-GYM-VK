import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  QrCode, 
  CreditCard, 
  MessageSquare, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Phone, 
  Mail, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Clock,
  ChevronDown,
  RefreshCw,
  Eye,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Gender, Member, MemberStatus, MembershipPackage, SessionCategory, UserRole } from '../types/gym';
import { gymStorage } from '../utils/gymStorage';
import { soundFx } from '../utils/audio';
import { 
  formatDateID, 
  formatRupiah, 
  getDaysRemaining, 
  getSessionBadge, 
  createWhatsAppRenewalLink,
  ROLE_PERMISSIONS 
} from '../utils/helpers';

interface MemberManagementViewProps {
  activeRole: UserRole;
  onSelectMemberForCard: (member: Member) => void;
  onSelectMemberForRenew?: (member: Member) => void;
}

export const MemberManagementView: React.FC<MemberManagementViewProps> = ({
  activeRole,
  onSelectMemberForCard,
  onSelectMemberForRenew,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSession, setFilterSession] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<Member | null>(null);

  // Form State for Registration / Editing
  const [formData, setFormData] = useState<{
    name: string;
    gender: Gender;
    phone: string;
    email: string;
    avatar: string;
    barcode: string;
    sessionCategory: SessionCategory;
    packageId: string;
    emergencyName: string;
    emergencyPhone: string;
    emergencyRelation: string;
    notes: string;
  }>({
    name: '',
    gender: 'female',
    phone: '',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    barcode: `AGM${Math.floor(100000 + Math.random() * 900000)}`,
    sessionCategory: 'women_only',
    packageId: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Keluarga',
    notes: '',
  });

  const perm = ROLE_PERMISSIONS[activeRole];

  useEffect(() => {
    loadData();
    window.addEventListener('aurora_storage_updated', loadData);
    return () => window.removeEventListener('aurora_storage_updated', loadData);
  }, []);

  const loadData = () => {
    const list = gymStorage.getMembers();
    setMembers(list);
    const pkgs = gymStorage.getPackages();
    setPackages(pkgs);
    if (pkgs.length > 0 && !formData.packageId) {
      setFormData(prev => ({ ...prev, packageId: pkgs[0].id }));
    }
  };

  const handleOpenAdd = () => {
    const randomBarcode = `AGM${Math.floor(100000 + Math.random() * 900000)}`;
    setEditingMember(null);
    setFormData({
      name: '',
      gender: 'female',
      phone: '',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      barcode: randomBarcode,
      sessionCategory: 'women_only',
      packageId: packages[0]?.id || 'pkg-1',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelation: 'Keluarga',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      gender: member.gender,
      phone: member.phone,
      email: member.email,
      avatar: member.avatar,
      barcode: member.barcode,
      sessionCategory: member.sessionCategory,
      packageId: member.packageId,
      emergencyName: member.emergencyContact?.name || '',
      emergencyPhone: member.emergencyContact?.phone || '',
      emergencyRelation: member.emergencyContact?.relation || 'Keluarga',
      notes: member.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Mohon lengkapi nama dan nomor WhatsApp member.');
      return;
    }

    const selectedPkg = packages.find(p => p.id === formData.packageId) || packages[0];
    const duration = selectedPkg?.durationMonths || 1;

    if (editingMember) {
      // Update existing
      const updated: Member = {
        ...editingMember,
        name: formData.name,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        avatar: formData.avatar,
        barcode: formData.barcode,
        sessionCategory: formData.sessionCategory,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation,
        },
        notes: formData.notes,
      };
      gymStorage.updateMember(updated);
    } else {
      // Add new
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + duration);

      const newId = `AG-${new Date().getFullYear()}-${String(members.length + 1).padStart(3, '0')}`;
      const newMember: Member = {
        id: newId,
        name: formData.name,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        avatar: formData.avatar,
        barcode: formData.barcode,
        sessionCategory: formData.sessionCategory,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        joinDate: startDate.toISOString().split('T')[0],
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: 'active',
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation,
        },
        notes: formData.notes,
        totalCheckIns: 0,
      };

      gymStorage.addMember(newMember);

      // Add transaction for registration
      const newTxn = {
        id: `txn-${Date.now()}`,
        invoiceNumber: `INV/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString(),
        type: 'membership_reg' as const,
        customerName: newMember.name,
        customerPhone: newMember.phone,
        memberId: newMember.id,
        items: [
          {
            id: selectedPkg.id,
            name: `Registrasi: ${selectedPkg.name}`,
            price: selectedPkg.price,
            quantity: 1,
            subtotal: selectedPkg.price,
            category: 'Membership',
          }
        ],
        subtotal: selectedPkg.price,
        discount: 0,
        tax: 0,
        total: selectedPkg.price,
        paymentMethod: 'qris' as const,
        cashierName: 'Admin Front-Desk',
        status: 'paid' as const,
      };
      gymStorage.addTransaction(newTxn);

      gymStorage.addCashFlow({
        id: `cf-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'income',
        category: 'Membership',
        amount: selectedPkg.price,
        description: `Pendaftaran Member Baru ${newMember.name} (${selectedPkg.name})`,
        performedBy: 'Admin Front-Desk',
        referenceId: newTxn.id,
      });

      soundFx.playSuccessChime();
    }

    setShowAddModal(false);
    loadData();
  };

  const handleToggleStatus = (member: Member) => {
    const nextStatus: MemberStatus = member.status === 'suspended' ? 'active' : 'suspended';
    const updated: Member = { ...member, status: nextStatus };
    gymStorage.updateMember(updated);
    loadData();
  };

  // Filtered list
  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase().trim();
    const cleanDigits = q.replace(/\D/g, '');
    const mPhoneDigits = (m.phone || '').replace(/\D/g, '');

    const matchesSearch = 
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.barcode.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      (cleanDigits.length >= 3 && mPhoneDigits.includes(cleanDigits)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      m.id.toLowerCase().includes(q);

    const matchesSession = filterSession === 'all' || m.sessionCategory === filterSession;
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;

    return matchesSearch && matchesSession && matchesStatus;
  });

  return (
    <div className="space-y-4 pb-8 font-sans">
      
      {/* Top Header & Add Member Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              Manajemen Member & Database Keanggotaan
            </h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold font-mono border border-slate-200">
              {members.length} Total Member
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data biodata, klasifikasi sesi latihan (Perempuan/Pria/Gabungan), barcode ID, dan status aktif
          </p>
        </div>

        {perm.canEditMembers && (
          <button
            id="btn-add-member"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Daftar Member Baru
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-lg shadow-xs space-y-2.5">
        <div className="flex flex-col md:flex-row gap-2.5">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama member, Barcode ID, No. WhatsApp, atau ID Member..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-xs text-slate-800 placeholder:text-slate-400 outline-none transition"
            />
          </div>

          {/* Sesi Khusus Classification Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Filter Sesi:</span>
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-2.5 py-1.5 outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">Semua Sesi</option>
              <option value="women_only">🌸 Sesi Perempuan</option>
              <option value="men_only">⚡ Sesi Laki-laki</option>
              <option value="mixed">🌐 Sesi Gabungan</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-2.5 py-1.5 outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="expiring">Segera Habis (≤ 5 Hari)</option>
              <option value="expired">Expired / Habis</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

        </div>

        {/* Quick Filter Counters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
          <span className="text-slate-400 font-medium">Klasifikasi Sesi:</span>
          <button
            onClick={() => setFilterSession('all')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
              filterSession === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({members.length})
          </button>
          <button
            onClick={() => setFilterSession('women_only')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
              filterSession === 'women_only'
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100'
            }`}
          >
            🌸 Sesi Perempuan ({members.filter(m => m.sessionCategory === 'women_only').length})
          </button>
          <button
            onClick={() => setFilterSession('men_only')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
              filterSession === 'men_only'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
            }`}
          >
            ⚡ Sesi Laki-laki ({members.filter(m => m.sessionCategory === 'men_only').length})
          </button>
          <button
            onClick={() => setFilterSession('mixed')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
              filterSession === 'mixed'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
            }`}
          >
            🌐 Sesi Gabungan ({members.filter(m => m.sessionCategory === 'mixed').length})
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4">Member & Biodata</th>
                <th className="py-2.5 px-4">Klasifikasi Sesi</th>
                <th className="py-2.5 px-4">Paket & Masa Aktif</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Kehadiran</th>
                <th className="py-2.5 px-4 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada member yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const badge = getSessionBadge(m.sessionCategory);
                  const daysLeft = getDaysRemaining(m.endDate);
                  const waRenewal = createWhatsAppRenewalLink(m.phone, m.name, daysLeft, m.packageName);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* Member Info & Photo */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs truncate flex items-center gap-1.5">
                              {m.name}
                              <span className="text-[10px] font-mono text-slate-400">
                                ({m.id})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {m.phone}
                            </div>
                            <div className="text-[10px] font-mono text-teal-600 flex items-center gap-1">
                              <QrCode className="w-2.5 h-2.5" />
                              {m.barcode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sesi Category */}
                      <td className="py-2.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                        {m.assignedTrainerName && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Trainer: <span className="text-slate-700 font-medium">{m.assignedTrainerName}</span>
                          </div>
                        )}
                      </td>

                      {/* Package & Validity */}
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-800 text-xs">
                          {m.packageName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatDateID(m.startDate)} s/d {formatDateID(m.endDate)}
                        </div>
                        <div className={`text-[10px] font-medium ${
                          daysLeft <= 0
                            ? 'text-rose-600 font-bold'
                            : daysLeft <= 5
                            ? 'text-amber-600 font-bold'
                            : 'text-slate-400'
                        }`}>
                          {daysLeft <= 0 ? 'Telah Berakhir' : `Sisa ${daysLeft} hari lagi`}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-4">
                        {m.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        )}
                        {m.status === 'expiring' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                            Segera Habis
                          </span>
                        )}
                        {m.status === 'expired' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            <XCircle className="w-2.5 h-2.5" />
                            Expired
                          </span>
                        )}
                        {m.status === 'suspended' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <Lock className="w-2.5 h-2.5" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Total Check-in Count */}
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-800 text-xs font-mono">
                          {m.totalCheckIns}x Kunjungan
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Terakhir: {m.lastCheckIn ? m.lastCheckIn.split(' ')[0] : 'Belum pernah'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Digital Card Pass */}
                          <button
                            onClick={() => onSelectMemberForCard(m)}
                            className="p-1.5 rounded bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-600 transition cursor-pointer"
                            title="Buka Kartu Member Digital"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Reminder */}
                          <a
                            href={waRenewal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                            title="Chat WhatsApp Reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit Member */}
                          {perm.canEditMembers && (
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                              title="Edit Data Member"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Suspend / Resume */}
                          {perm.canEditMembers && (
                            <button
                              onClick={() => handleToggleStatus(m)}
                              className={`p-1.5 rounded transition cursor-pointer ${
                                m.status === 'suspended'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              }`}
                              title={m.status === 'suspended' ? 'Aktifkan Kembali' : 'Suspend Akun'}
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <UserPlus className="w-4 h-4 text-teal-600" />
                {editingMember ? 'Edit Data Keanggotaan' : 'Formulir Pendaftaran Member Baru'}
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMember} className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-700">
              
              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">Nama Lengkap Member *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Sarah Nuraini"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-800 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">Jenis Kelamin *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => {
                      const g = e.target.value as Gender;
                      setFormData({ 
                        ...formData, 
                        gender: g,
                        sessionCategory: g === 'female' ? 'women_only' : 'men_only'
                      });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="female">Perempuan</option>
                    <option value="male">Laki-laki</option>
                  </select>
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">Nomor WhatsApp (Aktif) *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-800 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="member@email.com"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Sesi Khusus Classification Setting (Core Feature) */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-teal-700 font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Klasifikasi Sesi Latihan Gym (Aturan Akses & Privasi) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`p-2 rounded border text-left cursor-pointer transition ${
                    formData.sessionCategory === 'women_only'
                      ? 'bg-pink-50 border-pink-300 text-pink-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="sessionCategory"
                      value="women_only"
                      checked={formData.sessionCategory === 'women_only'}
                      onChange={() => setFormData({ ...formData, sessionCategory: 'women_only' })}
                      className="hidden"
                    />
                    <div className="font-bold text-[11px]">🌸 Sesi Perempuan</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Area khusus wanita</div>
                  </label>

                  <label className={`p-2 rounded border text-left cursor-pointer transition ${
                    formData.sessionCategory === 'men_only'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="sessionCategory"
                      value="men_only"
                      checked={formData.sessionCategory === 'men_only'}
                      onChange={() => setFormData({ ...formData, sessionCategory: 'men_only' })}
                      className="hidden"
                    />
                    <div className="font-bold text-[11px]">⚡ Sesi Laki-laki</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Free-weight & rack pria</div>
                  </label>

                  <label className={`p-2 rounded border text-left cursor-pointer transition ${
                    formData.sessionCategory === 'mixed'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="sessionCategory"
                      value="mixed"
                      checked={formData.sessionCategory === 'mixed'}
                      onChange={() => setFormData({ ...formData, sessionCategory: 'mixed' })}
                      className="hidden"
                    />
                    <div className="font-bold text-[11px]">🌐 Sesi Gabungan</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">All-Access jam buka</div>
                  </label>
                </div>
              </div>

              {/* Package Selector */}
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold">Pilih Paket Membership</label>
                <select
                  value={formData.packageId}
                  onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-800 outline-none cursor-pointer"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — {formatRupiah(pkg.price)} ({pkg.durationMonths} Bulan)
                    </option>
                  ))}
                </select>
              </div>

              {/* Barcode & Avatar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">Nomor Barcode / RFID Tag</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-teal-600 font-mono font-bold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold">URL Foto Profil</label>
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-700 outline-none truncate"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-700 text-[11px]">Kontak Darurat (Emergency Contact)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    placeholder="Nama Kerabat"
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-800 outline-none"
                  />
                  <input
                    type="text"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    placeholder="Nomor HP Darurat"
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-800 outline-none"
                  />
                  <input
                    type="text"
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                    placeholder="Hubungan"
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold">Catatan Kesehatan / Goals Latihan</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Contoh: Program fat loss, riwayat cedera lutut kiri..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded text-slate-800 outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded shadow-xs cursor-pointer"
                >
                  {editingMember ? 'Simpan Perubahan' : 'Daftarkan & Buat Invoice'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
