import { Transaction, SavingsGoal, SavingsCategory } from '../types/savings';
import { recalculateTransactions } from '../utils/formatters';

export const initialGoal: SavingsGoal = {
  id: 'goal-primary',
  name: 'Dana Darurat & Tabungan Masa Depan',
  targetAmount: 30000000, // Rp 30.000.000
  startDate: '2026-01-01',
  targetDate: '2026-12-31',
  monthlyDepositTarget: 2500000, // Rp 2.500.000
  notes: 'Target tabungan 12 bulan dengan alokasi multi-kategori: Darurat (50%), Liburan (25%), dan Pendidikan (25%).',
};

export const initialCategories: SavingsCategory[] = [
  {
    id: 'cat-darurat',
    name: 'Darurat',
    targetAmount: 15000000, // Rp 15.000.000 (50%)
    description: 'Dana proteksi darurat minimal 6 bulan pengeluaran pokok keluarga',
    icon: 'Shield',
    color: 'emerald',
  },
  {
    id: 'cat-liburan',
    name: 'Liburan',
    targetAmount: 7500000, // Rp 7.500.000 (25%)
    description: 'Tabungan liburan impian, refreshing, & recharging energi positif',
    icon: 'Plane',
    color: 'amber',
  },
  {
    id: 'cat-pendidikan',
    name: 'Pendidikan',
    targetAmount: 7500000, // Rp 7.500.000 (25%)
    description: 'Investasi kursus skill profesi, sertifikasi, & dana pendidikan masa depan',
    icon: 'GraduationCap',
    color: 'teal',
  },
];

const rawTransactions: Omit<Transaction, 'no' | 'balanceBefore' | 'balanceAfter'>[] = [
  {
    id: 'tx-1',
    date: '2026-01-05',
    description: 'Setoran Awal Tabungan Awal Tahun',
    type: 'Setoran',
    source: 'Gaji Pokok',
    category: 'Darurat',
    amount: 3000000,
    reference: 'TRX-BCA-20260105-01',
    notes: 'Alokasi 30% gaji bulanan langsung disisihkan di awal',
  },
  {
    id: 'tx-2',
    date: '2026-01-18',
    description: 'Honor Proyek Freelance Website',
    type: 'Setoran',
    source: 'Penghasilan Tambahan',
    category: 'Pendidikan',
    amount: 1750000,
    reference: 'INV-FREELANCE-88',
    notes: 'Pembayaran termin 1 klien UMKM Surabaya',
  },
  {
    id: 'tx-3',
    date: '2026-01-28',
    description: 'Hasil Penjualan Barang Bekas Layak Pakai',
    type: 'Setoran',
    source: 'Lain-lain',
    category: 'Liburan',
    amount: 650000,
    reference: 'TF-GOPAY-9921',
    notes: 'Decluttering gadget & monitor bekas',
  },
  {
    id: 'tx-4',
    date: '2026-02-05',
    description: 'Setoran Rutin Gaji Februari',
    type: 'Setoran',
    source: 'Gaji Pokok',
    category: 'Darurat',
    amount: 2500000,
    reference: 'TRX-BCA-20260205-02',
    notes: 'Setoran otomatis autodebet tabungan',
  },
  {
    id: 'tx-5',
    date: '2026-02-14',
    description: 'Penarikan Servis Darurat Rem Sepeda Motor',
    type: 'Penarikan',
    source: 'Kebutuhan Darurat',
    category: 'Darurat',
    amount: 550000,
    reference: 'KWITANSI-AHASS-41',
    notes: 'Penggantian piringan cakram & kampas rem mendesak',
  },
  {
    id: 'tx-6',
    date: '2026-02-22',
    description: 'Bonus Tambahan Performa Tim',
    type: 'Setoran',
    source: 'Bonus Kantor',
    category: 'Liburan',
    amount: 1500000,
    reference: 'SLIP-BONUS-FEB',
    notes: 'Reward pencapaian KPI bulanan kantor',
  },
  {
    id: 'tx-7',
    date: '2026-03-05',
    description: 'Setoran Rutin Gaji Maret',
    type: 'Setoran',
    source: 'Gaji Pokok',
    category: 'Darurat',
    amount: 2500000,
    reference: 'TRX-BCA-20260305-03',
    notes: 'Komitmen konsisten tabungan di awal bulan',
  },
  {
    id: 'tx-8',
    date: '2026-03-19',
    description: 'Imbal Hasil Dividen Reksadana Pasar Uang',
    type: 'Setoran',
    source: 'Investasi',
    category: 'Pendidikan',
    amount: 380000,
    reference: 'BIBIT-DIVIDEND-03',
    notes: 'Re-investasi bunga kupon dividen',
  },
  {
    id: 'tx-9',
    date: '2026-04-05',
    description: 'Setoran Rutin Gaji April',
    type: 'Setoran',
    source: 'Gaji Pokok',
    category: 'Darurat',
    amount: 2500000,
    reference: 'TRX-BCA-20260405-04',
    notes: 'Disimpan di rekening terpisah berjangka',
  },
  {
    id: 'tx-10',
    date: '2026-04-12',
    description: 'Setoran Tunjangan Hari Raya (THR)',
    type: 'Setoran',
    source: 'THR',
    category: 'Liburan',
    amount: 4500000,
    reference: 'TRX-BCA-THR-2026',
    notes: '50% dari THR dialokasikan untuk liburan keluarga',
  },
  {
    id: 'tx-11',
    date: '2026-04-20',
    description: 'Penarikan Biaya Pengobatan Keluarga Darurat',
    type: 'Penarikan',
    source: 'Kebutuhan Darurat',
    category: 'Darurat',
    amount: 800000,
    reference: 'KWT-RS-MEDIKA-102',
    notes: 'Penggantian sementara sebelum klaim asuransi cair',
  },
  {
    id: 'tx-12',
    date: '2026-05-05',
    description: 'Setoran Rutin Gaji Mei',
    type: 'Setoran',
    source: 'Gaji Pokok',
    category: 'Pendidikan',
    amount: 2500000,
    reference: 'TRX-BCA-20260505-05',
    notes: 'Alokasi khusus tabungan pendidikan semester baru',
  },
];

export const initialTransactions: Transaction[] = recalculateTransactions(
  rawTransactions.map(item => ({
    ...item,
    no: 0,
    balanceBefore: 0,
    balanceAfter: 0,
  }))
);

export const DEFAULT_FUND_SOURCES = [
  'Gaji Pokok',
  'Penghasilan Tambahan',
  'Bonus Kantor',
  'THR',
  'Investasi',
  'Lain-lain',
  'Kebutuhan Darurat',
];
