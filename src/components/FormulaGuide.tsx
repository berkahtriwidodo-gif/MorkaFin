import React, { useState } from 'react';
import { 
  BookOpen, 
  Copy, 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  Layers, 
  FileSpreadsheet, 
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

export const FormulaGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'formulas' | 'steps' | 'sheets_vs_excel'>('formulas');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formulasList = [
    {
      id: 'running-balance',
      name: '1. Saldo Berjalan (Running Balance)',
      description: 'Diletakkan pada kolom Saldo Sesudah (H2, H3, dst.) untuk menghitung saldo berantai tanpa manual.',
      sheetsFormula: '=IF(ISBLANK(B2); ""; IF(D2="Setoran"; G2+F2; G2-F2))',
      excelFormula: '=IF(ISBLANK(B2), "", IF(D2="Setoran", G2+F2, G2-F2))',
      cellRef: 'Catatan Transaksi (Kolom H2:H500)',
      explanation: 'Jika tanggal kosong, sel dibiarkan kosong. Jika jenis transaksi "Setoran", maka Saldo Sebelum (G) + Nominal (F). Jika "Penarikan", maka Saldo Sebelum - Nominal.',
    },
    {
      id: 'balance-before',
      name: '2. Saldo Sebelum (Chained Balance)',
      description: 'Menyambungkan saldo sesudah dari baris transaksi sebelumnya.',
      sheetsFormula: '=IF(ROW()=2; 0; H1)',
      excelFormula: '=IF(ROW()=2, 0, H1)',
      cellRef: 'Catatan Transaksi (Kolom G2:G500)',
      explanation: 'Pada baris pertama bernilai 0. Pada baris ke-3 dan seterusnya, mengambil nilai persis dari baris sebelumnya (H2, H3, dst.).',
    },
    {
      id: 'total-tabungan',
      name: '3. Total Tabungan Kas Saat Ini',
      description: 'Menjumlahkan seluruh setoran dikurangi seluruh penarikan.',
      sheetsFormula: '=SUMIF(\'Catatan Transaksi\'!D:D; "Setoran"; \'Catatan Transaksi\'!F:F) - SUMIF(\'Catatan Transaksi\'!D:D; "Penarikan"; \'Catatan Transaksi\'!F:F)',
      excelFormula: '=SUMIF(\'Catatan Transaksi\'!D:D, "Setoran", \'Catatan Transaksi\'!F:F) - SUMIF(\'Catatan Transaksi\'!D:D, "Penarikan", \'Catatan Transaksi\'!F:F)',
      cellRef: 'Dashboard (Sel B3)',
      explanation: 'Menghitung selisih bersih kas masuk dan keluar secara dinamis di seluruh rentang kolom transaksi.',
    },
    {
      id: 'total-setoran',
      name: '4. Total Akumulasi Setoran Masuk',
      description: 'Menjumlahkan seluruh transaksi dengan label "Setoran".',
      sheetsFormula: '=SUMIF(\'Catatan Transaksi\'!D:D; "Setoran"; \'Catatan Transaksi\'!F:F)',
      excelFormula: '=SUMIF(\'Catatan Transaksi\'!D:D, "Setoran", \'Catatan Transaksi\'!F:F)',
      cellRef: 'Dashboard (Sel B12)',
      explanation: 'Kriteria "Setoran" memfilter hanya nominal pemasukan tabungan.',
    },
    {
      id: 'total-penarikan',
      name: '5. Total Akumulasi Penarikan',
      description: 'Menjumlahkan seluruh transaksi pengeluaran atau penarikan darurat.',
      sheetsFormula: '=SUMIF(\'Catatan Transaksi\'!D:D; "Penarikan"; \'Catatan Transaksi\'!F:F)',
      excelFormula: '=SUMIF(\'Catatan Transaksi\'!D:D, "Penarikan", \'Catatan Transaksi\'!F:F)',
      cellRef: 'Dashboard (Sel B13)',
      explanation: 'Memantau total dana yang pernah ditarik agar evaluasi disiplin tabungan tetap transparan.',
    },
    {
      id: 'sisa-target',
      name: '6. Sisa Target Tabungan',
      description: 'Menghitung sisa nominal yang masih harus dicapai, dengan batas minimal 0.',
      sheetsFormula: '=MAX(0; \'Target Tabungan\'!B2 - Dashboard!B3)',
      excelFormula: '=MAX(0, \'Target Tabungan\'!B2 - Dashboard!B3)',
      cellRef: 'Dashboard (Sel B4) & Target Tabungan (Sel B6)',
      explanation: 'Fungsi MAX(0; ...) mencegah nilai sisa menjadi minus apabila tabungan sudah melampaui target 100%.',
    },
    {
      id: 'persentase-pencapaian',
      name: '7. Persentase Pencapaian Target',
      description: 'Menghitung rasio pencapaian (format sebagai % di Sheets/Excel).',
      sheetsFormula: '=IF(\'Target Tabungan\'!B2>0; Dashboard!B3 / \'Target Tabungan\'!B2; 0)',
      excelFormula: '=IF(\'Target Tabungan\'!B2>0, Dashboard!B3 / \'Target Tabungan\'!B2, 0)',
      cellRef: 'Dashboard (Sel B5)',
      explanation: 'Membagi total tabungan saat ini dengan target nominal. Diberikan validasi IF > 0 untuk mencegah error #DIV/0!.',
    },
    {
      id: 'rekap-bulanan',
      name: '8. Rekap Bulanan (SUMIFS Berdasarkan Rentang Tanggal)',
      description: 'Menghitung total setoran pada bulan dan tahun tertentu secara otomatis.',
      sheetsFormula: '=SUMIFS(\'Catatan Transaksi\'!$F:$F; \'Catatan Transaksi\'!$D:$D; "Setoran"; \'Catatan Transaksi\'!$B:$B; ">="&DATE(2026;1;1); \'Catatan Transaksi\'!$B:$B; "<="&EOMONTH(DATE(2026;1;1);0))',
      excelFormula: '=SUMIFS(\'Catatan Transaksi\'!$F:$F, \'Catatan Transaksi\'!$D:$D, "Setoran", \'Catatan Transaksi\'!$B:$B, ">="&DATE(2026,1,1), \'Catatan Transaksi\'!$B:$B, "<="&EOMONTH(DATE(2026,1,1),0))',
      cellRef: 'Rekap Bulanan (Kolom C2:C13)',
      explanation: 'Menyaring nominal F yang bertipe Setoran dan tanggalnya berada di antara hari pertama bulan s/d hari terakhir bulan (EOMONTH).',
    },
    {
      id: 'rata-rata-setoran',
      name: '9. Rata-Rata Setoran per Bulan',
      description: 'Menghitung rata-rata hanya pada bulan-bulan yang memiliki setoran (>0).',
      sheetsFormula: '=AVERAGEIF(\'Rekap Bulanan\'!C2:C13; ">0")',
      excelFormula: '=AVERAGEIF(\'Rekap Bulanan\'!C2:C13, ">0")',
      cellRef: 'Dashboard (Sel B7)',
      explanation: 'Fungsi AVERAGEIF mengabaikan bulan yang belum berjalan (nilai 0), sehingga rata-rata tetap realistis dan akurat.',
    },
    {
      id: 'estimasi-waktu',
      name: '10. Estimasi Waktu Mencapai Target (Bulan)',
      description: 'Membagi sisa target dengan rata-rata setoran bulanan dan dibulatkan ke atas.',
      sheetsFormula: '=IF(B7>0; ROUNDUP(B4 / B7; 0); "Belum ada setoran")',
      excelFormula: '=IF(B7>0, ROUNDUP(B4 / B7, 0), "Belum ada setoran")',
      cellRef: 'Dashboard (Sel B8)',
      explanation: 'ROUNDUP memastikan sisa bulan dibulatkan ke atas menjadi bilangan bulat.',
    },
    {
      id: 'status-progres',
      name: '11. Status Progres Otomatis',
      description: 'Menampilkan label status secara otomatis berdasarkan persentase.',
      sheetsFormula: '=IF(B5>=1; "Target Tercapai"; IF(B5>=0.75; "Hampir Tercapai"; IF(B5>0; "Berjalan"; "Belum Mulai")))',
      excelFormula: '=IF(B5>=1, "Target Tercapai", IF(B5>=0.75, "Hampir Tercapai", IF(B5>0, "Berjalan", "Belum Mulai")))',
      cellRef: 'Dashboard (Sel B9)',
      explanation: 'Logika nested IF menghasilkan 4 level status sesuai permintaan panduan.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#15803D]" />
            Dokumentasi &amp; Formula MorkaFin Sheets
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#133E2B] tracking-tight">
          Panduan Rumus Google Sheets &amp; Microsoft Excel
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Formula siap pakai, tata letak sel, aturan validasi dropdown, dan conditional formatting transparan untuk pertumbuhan tabungan Anda.
        </p>

        {/* Tab switcher */}
        <div className="flex gap-2 mt-5 border-t border-slate-100 pt-4 flex-wrap">
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
              activeTab === 'formulas'
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Daftar Formula (11 Rumus)
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
              activeTab === 'steps'
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Langkah Pembuatan Sheet &amp; Proteksi
          </button>
          <button
            onClick={() => setActiveTab('sheets_vs_excel')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
              activeTab === 'sheets_vs_excel'
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Perbedaan Sheets vs Excel
          </button>
        </div>
      </div>

      {activeTab === 'formulas' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 flex items-start gap-3 text-xs text-[#133E2B]">
            <Info className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#15803D]">Tips Pemisah Argumen Rumus (Titik Koma vs Koma):</p>
              <p className="mt-0.5 text-slate-600">
                Pengaturan regional Indonesia menggunakan titik koma (<code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-bold">;</code>). Jika menggunakan bahasa Inggris (US), gunakan koma (<code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-bold">,</code>).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {formulasList.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-[#15803D] transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#133E2B]">{f.name}</h3>
                  <span className="text-[11px] bg-emerald-50 text-[#15803D] font-mono px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold self-start">
                    {f.cellRef}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3">{f.description}</p>

                <div className="space-y-2">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs font-mono flex items-center justify-between gap-2">
                    <div className="overflow-x-auto">
                      <span className="text-[#15803D] font-bold block text-[10px] uppercase font-sans">
                        Google Sheets (Regional Indo &amp; Universal):
                      </span>
                      <code className="text-slate-800 font-bold">{f.sheetsFormula}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(f.sheetsFormula, `${f.id}-sheets`)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium shrink-0 flex items-center gap-1 shadow-2xs"
                    >
                      {copiedKey === `${f.id}-sheets` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs font-mono flex items-center justify-between gap-2">
                    <div className="overflow-x-auto">
                      <span className="text-[#133E2B] font-bold block text-[10px] uppercase font-sans">
                        Excel (Regional US / Koma):
                      </span>
                      <code className="text-slate-800">{f.excelFormula}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(f.excelFormula, `${f.id}-excel`)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium shrink-0 flex items-center gap-1 shadow-2xs"
                    >
                      {copiedKey === `${f.id}-excel` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{f.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'steps' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#15803D] text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-[#133E2B] text-base">
                Struktur Lembar Kerja (Sheets) &amp; Tab
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Buat dokumen baru di Google Sheets atau Microsoft Excel dengan 4 tab lembar kerja:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-[#133E2B]">Tab 1: Dashboard</p>
                <p className="text-slate-500 mt-1">Kartu ringkasan KPI, estimasi waktu, status progres, dan grafik capaian.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="font-bold text-[#15803D]">Tab 2: Catatan Transaksi</p>
                <p className="text-slate-700 mt-1">Buku kas harian dengan kolom No, Tanggal, Keterangan, Jenis, Nominal, Saldo.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-[#133E2B]">Tab 3: Target Tabungan</p>
                <p className="text-slate-500 mt-1">Definisi target nominal, tanggal mulai, deadline, dan alokasi mingguan/bulanan.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-[#133E2B]">Tab 4: Rekap Bulanan</p>
                <p className="text-slate-500 mt-1">Rekap Januari s/d Desember dengan SUMIFS per bulan dan grafik target vs realisasi.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#15803D] text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-[#133E2B] text-base">
                Membuat Data Validation (Dropdown Menu Jenis Transaksi)
              </h3>
            </div>
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 font-sans">
                <p>1. Blok kolom <strong>D2:D500</strong> di tab &quot;Catatan Transaksi&quot;.</p>
                <p>2. Klik menu <strong>Data → Data validation → Add rule</strong>.</p>
                <p>3. Pilih Criteria: <strong>Dropdown</strong>. Masukkan opsi 1: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-700 font-bold">Setoran</code> dan opsi 2: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-rose-300 text-rose-700 font-bold">Penarikan</code>.</p>
                <p>4. Beri warna hijau untuk Setoran dan merah untuk Penarikan, lalu klik <strong>Done</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sheets_vs_excel' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-[#133E2B] text-base">
            Perbandingan Formula Google Sheets vs Excel
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F0FDF4] text-[#133E2B] font-bold border-b border-emerald-200">
                <tr>
                  <th className="py-2.5 px-3">Fitur / Kebutuhan</th>
                  <th className="py-2.5 px-3 text-[#15803D]">Google Sheets</th>
                  <th className="py-2.5 px-3 text-[#133E2B]">Microsoft Excel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Pemisah Rumus (Argumen)</td>
                  <td className="py-2.5 px-3">Menggunakan <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold">;</code> (regional ID) atau <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold">,</code> (regional US)</td>
                  <td className="py-2.5 px-3">Mengikuti Windows Regional Settings (Indonesia: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold">;</code>, English: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold">,</code>)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Akhir Bulan (EOMONTH)</td>
                  <td className="py-2.5 px-3"><code className="font-mono text-[#15803D] font-bold">=EOMONTH(DATE(2026;1;1); 0)</code> langsung aktif</td>
                  <td className="py-2.5 px-3"><code className="font-mono text-[#133E2B] font-bold">=EOMONTH(...)</code> tersedia di seluruh versi</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Validasi Dropdown</td>
                  <td className="py-2.5 px-3">Fitur Chip berwarna interaktif yang rapi di HP/Android/iOS</td>
                  <td className="py-2.5 px-3">Data Validation List standar</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Format Mata Uang Rupiah</td>
                  <td className="py-2.5 px-3">Format → Angka → Mata Uang Khusus → Rupiah Indonesia (Rp)</td>
                  <td className="py-2.5 px-3">Format Cells → Currency → Symbol: Rp Indonesian</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
