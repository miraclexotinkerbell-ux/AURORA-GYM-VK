# AURORA GYM - Management System & POS Kasir Multi-Shift

Sistem manajemen operasional gym modern lengkap dengan:
- **Screening Posisi Staf (RBAC)**: Owner, Manager, Kasir Pagi/Sore, dan Personal Trainer.
- **Rekapitulasi Shift Kasir Mandiri (Z-Report)**: Modal awal, rekonsiliasi kas fisik, perhitungan selisih, dan serah terima kasir.
- **Sistem Jadwal Sesi Gender & Akhir Pekan**:
  - Senin - Jumat: Sesi Khusus Perempuan (*Morning Glow & Afternoon Fit*), Sesi Khusus Laki-laki (*Power & Strength*), Sesi Malam Campur.
  - Sabtu & Minggu: **Sesi Bebas Campur Pria & Wanita (All-Access Weekend)** sepanjang jam operasional.
- **Check-In RFID & Barcode Scanner Simulator**.
- **POS Retail & Membership Renewal WhatsApp Receipts**.
- **Laporan Keuangan & Cetak Struk Kasir**.

---

## 🚀 Panduan Deploy ke GitHub Pages (Agar Tampil Sempurna & Tidak Layar Putih)

Layar putih di GitHub biasanya terjadi karena GitHub Pages menyajikan file mentah (`.tsx`) dan bukan hasil build (`dist/`).

### Cara Praktis Mengaktifkan GitHub Pages via GitHub Actions:

1. **Buka Repositori Anda di GitHub** (misal: `AURORA-GYM-by-VK`).
2. Masuk ke menu tab **Settings** (Pengaturan).
3. Di bilah sisi kiri, klik menu **Pages**.
4. Pada bagian **Build and deployment**:
   - Ubah **Source** menjadi **`GitHub Actions`** (bukan *Deploy from a branch*).
5. Workflow `.github/workflows/deploy.yml` yang sudah kami siapkan akan otomatis mem-build file React/Vite dan menayangkannya langsung ke alamat:
   `https://<username>.github.io/AURORA-GYM-by-VK/`

---

## 💻 Menjalankan di Lokal (Development)

```bash
# 1. Install dependensi
npm install

# 2. Jalankan server lokal
npm run dev

# 3. Build produksi
npm run build
```
