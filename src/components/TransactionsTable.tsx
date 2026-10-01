import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  Lock, 
  Edit2, 
  Code2, 
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction, TransactionType } from '../types/savings';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';

interface TransactionsTableProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  fundSources: string[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  fundSources,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | TransactionType>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [showFormulaMode, setShowFormulaMode] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.source.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === 'All' ? true : tx.type === typeFilter;
      const matchSource = sourceFilter === 'All' ? true : tx.source === sourceFilter;

      return matchSearch && matchType && matchSource;
    });
  }, [transactions, searchTerm, typeFilter, sourceFilter]);

  const totalDeposits = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'Setoran')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalWithdrawals = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'Penarikan')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const finalBalance = transactions.length > 0 
    ? transactions[transactions.length - 1].balanceAfter 
    : 0;

  return (
    <div className="space-y-4">
      {/* Top Header Card in MorkaFin Nature Design */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
              <h1 className="text-lg sm:text-xl font-extrabold text-[#133E2B]">
                Buku Catatan Kas Tabungan &amp; Mutasi
              </h1>
              <span className="text-xs bg-emerald-50 text-[#15803D] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                {transactions.length} Baris Data
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Seluruh mutasi tercatat transparan dan saldo berjalan otomatis dihitung tanpa entri manual.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowFormulaMode(!showFormulaMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                showFormulaMode
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Tampilkan rumus formula Sheets/Excel"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showFormulaMode ? 'Tampilkan Nominal' : 'Lihat Rumus Kolom (Fx)'}</span>
            </button>

            {/* Nature Green Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#15803D] hover:bg-[#14532D] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3] text-amber-300" />
              <span>Tambah Transaksi Baru</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-500 font-bold text-[11px]">Format Kolom:</span>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
              <Edit2 className="w-3 h-3 text-[#15803D]" />
              <span><strong>Sel Input Manual</strong> (Tanggal, Keterangan, Jenis, Sumber, Nominal, Bukti, Catatan)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 text-xs">
              <Lock className="w-3 h-3 text-slate-600" />
              <span><strong>Sel Formula Otomatis</strong> (Saldo Sebelum &amp; Saldo Sesudah)</span>
            </div>
          </div>
          <div className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Format Mata Uang: Rupiah (Rp)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi, keterangan, sumber dana, bukti transfer, nomor resi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#15803D] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Jenis:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#15803D]"
            >
              <option value="All">Semua Jenis</option>
              <option value="Setoran">Setoran Saja</option>
              <option value="Penarikan">Penarikan Saja</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Sumber:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#15803D]"
            >
              <option value="All">Semua Sumber</option>
              {fundSources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {(searchTerm || typeFilter !== 'All' || sourceFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('All');
                setSourceFilter('All');
              }}
              className="text-xs text-[#D97706] font-bold hover:underline px-2 py-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table: Clean MorkaFin Nature Spreadsheet View */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[620px] scrollbar-thin">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="sticky top-0 z-20 bg-[#F0FDF4] text-[#133E2B] font-bold border-b border-emerald-100 shadow-2xs">
              <tr className="divide-x divide-emerald-100 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-2 text-center w-12">No.</th>
                <th className="py-3 px-3 w-28">Tanggal</th>
                <th className="py-3 px-3 min-w-[200px]">Keterangan</th>
                <th className="py-3 px-3 w-32">Jenis Transaksi</th>
                <th className="py-3 px-3 w-36">Sumber Dana</th>
                <th className="py-3 px-3 w-36 text-right bg-emerald-100/60 text-[#15803D]">
                  Nominal (Rp)
                </th>
                <th className="py-3 px-3 w-36 text-right bg-slate-100/70 text-slate-700">
                  Saldo Sebelum
                </th>
                <th className="py-3 px-3 w-36 text-right bg-emerald-50 text-emerald-900 font-extrabold">
                  Saldo Sesudah
                </th>
                <th className="py-3 px-3 w-36">Bukti / Ref</th>
                <th className="py-3 px-3 min-w-[160px]">Catatan</th>
                <th className="py-3 px-2 text-center w-16">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">Tidak ada transaksi yang cocok dengan filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isDeposit = tx.type === 'Setoran';
                  const rowInSheet = tx.no + 1;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-emerald-50/40 transition divide-x divide-slate-100 font-normal"
                    >
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500 bg-slate-50/40 font-semibold">
                        {tx.no}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {tx.date}
                        <span className="block text-[10px] text-slate-400 font-normal">{formatDateIndonesian(tx.date)}</span>
                      </td>

                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {tx.description}
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isDeposit
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-700">
                        <span className="inline-block bg-slate-100 px-2 py-0.5 rounded-md text-xs border border-slate-200 font-medium">
                          {tx.source}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap bg-emerald-50/20">
                        <span className={isDeposit ? 'text-emerald-700' : 'text-rose-600'}>
                          {isDeposit ? '+' : '-'}{formatRupiah(tx.amount)}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-600 bg-slate-50/70 font-mono text-xs whitespace-nowrap">
                        {showFormulaMode ? (
                          <span className="text-[10px] text-[#15803D] font-bold">
                            {tx.no === 1 ? '0' : `=H${rowInSheet - 1}`}
                          </span>
                        ) : (
                          formatRupiah(tx.balanceBefore)
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-extrabold text-[#133E2B] bg-emerald-50/40 font-mono text-xs whitespace-nowrap">
                        {showFormulaMode ? (
                          <span className="text-[10px] text-emerald-800 font-bold">
                            {`=IF(D${rowInSheet}="Setoran", G${rowInSheet}+F${rowInSheet}, G${rowInSheet}-F${rowInSheet})`}
                          </span>
                        ) : (
                          formatRupiah(tx.balanceAfter)
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                        {tx.reference || '-'}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 text-xs truncate max-w-[200px]" title={tx.notes}>
                        {tx.notes || '-'}
                      </td>

                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit Transaksi"
                            className="p-1 rounded text-slate-400 hover:text-[#15803D] hover:bg-emerald-50 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(tx)}
                            title="Hapus Transaksi"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Footer Summary Row */}
            <tfoot className="bg-[#F0FDF4] text-[#133E2B] font-bold border-t-2 border-emerald-200">
              <tr className="divide-x divide-emerald-200">
                <td colSpan={5} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                  Total Akumulasi &amp; Saldo Kas Akhir:
                </td>
                <td className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-normal">Total Masuk:</span>
                    +{formatRupiah(totalDeposits)}
                  </div>
                </td>
                <td className="py-3 px-3 text-right text-rose-700 whitespace-nowrap">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-normal">Total Keluar:</span>
                    -{formatRupiah(totalWithdrawals)}
                  </div>
                </td>
                <td className="py-3 px-3 text-right bg-emerald-100 text-emerald-950 font-black text-sm whitespace-nowrap">
                  <div>
                    <span className="text-[10px] text-emerald-800 block font-normal">Saldo Berjalan:</span>
                    {formatRupiah(finalBalance)}
                  </div>
                </td>
                <td colSpan={3} className="py-3 px-3 text-xs text-slate-500 font-normal">
                  Formula: <code className="font-mono text-[#15803D] font-semibold">=SUMIF(D:D;&quot;Setoran&quot;;F:F)-SUMIF(D:D;&quot;Penarikan&quot;;F:F)</code>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-[#133E2B] mb-2">Konfirmasi Hapus Transaksi</h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus transaksi <strong>&quot;{deleteCandidate.description}&quot;</strong> senilai{' '}
              <strong>{formatRupiah(deleteCandidate.amount)}</strong>? Seluruh saldo sesudahnya akan dihitung ulang otomatis.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-full border border-slate-300 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction(deleteCandidate.id);
                  setDeleteCandidate(null);
                }}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
