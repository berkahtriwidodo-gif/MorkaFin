import React, { useState, useMemo } from 'react';
import { 
  CalendarRange, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Transaction, SavingsGoal, MonthlyRecapData } from '../types/savings';
import { formatRupiah, formatPercentage, computeMonthlyRecaps } from '../utils/formatters';

interface MonthlyRecapProps {
  transactions: Transaction[];
  goal: SavingsGoal;
}

export const MonthlyRecap: React.FC<MonthlyRecapProps> = ({
  transactions,
  goal,
}) => {
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(2026);
    transactions.forEach(t => {
      const y = parseInt(t.date.substring(0, 4), 10);
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || 2026);
  const [chartMode, setChartMode] = useState<'deposit' | 'balance'>('deposit');

  const recaps: MonthlyRecapData[] = useMemo(() => {
    return computeMonthlyRecaps(
      transactions,
      goal.monthlyDepositTarget || 2500000,
      selectedYear
    );
  }, [transactions, goal.monthlyDepositTarget, selectedYear]);

  const yearTotalDeposit = recaps.reduce((sum, r) => sum + r.totalDeposit, 0);
  const yearTotalWithdrawal = recaps.reduce((sum, r) => sum + r.totalWithdrawal, 0);
  const yearNetDiff = yearTotalDeposit - yearTotalWithdrawal;
  const yearFinalBalance = recaps.length > 0 ? recaps[recaps.length - 1].closingBalance : 0;
  const yearTargetTotal = recaps.reduce((sum, r) => sum + r.targetDeposit, 0);
  const averageAchievement = yearTargetTotal > 0 ? (yearTotalDeposit / yearTargetTotal) : 0;

  const maxDepositVal = Math.max(
    ...recaps.map(r => Math.max(r.targetDeposit, r.totalDeposit)),
    4000000
  );

  const maxBalanceVal = Math.max(
    ...recaps.map(r => r.closingBalance),
    10000000
  );

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-[#15803D]" />
                Laporan &amp; Evaluasi Berkala MorkaFin
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#133E2B] tracking-tight">
              Rekapitulasi Tabungan Bulanan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Evaluasi target vs realisasi setoran, pengeluaran darurat, dan saldo akhir tiap bulan secara transparan.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-600">Pilih Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="py-2 px-3.5 rounded-xl border border-slate-300 bg-white font-bold text-[#133E2B] text-xs sm:text-sm focus:ring-2 focus:ring-[#15803D]"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>Tahun {yr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs sm:text-sm">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <span className="text-slate-500 block text-[11px] font-semibold">Total Setoran ({selectedYear}):</span>
            <span className="text-base sm:text-lg font-black text-emerald-700">+{formatRupiah(yearTotalDeposit)}</span>
          </div>
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <span className="text-slate-500 block text-[11px] font-semibold">Total Penarikan ({selectedYear}):</span>
            <span className="text-base sm:text-lg font-black text-rose-600">-{formatRupiah(yearTotalWithdrawal)}</span>
          </div>
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <span className="text-slate-500 block text-[11px] font-semibold">Selisih Bersih (Net):</span>
            <span className="text-base sm:text-lg font-black text-[#133E2B]">{formatRupiah(yearNetDiff)}</span>
          </div>
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200">
            <span className="text-[#D97706] block text-[11px] font-bold">Capaian Tahunan:</span>
            <span className="text-base sm:text-lg font-black text-[#D97706]">{formatPercentage(averageAchievement)}</span>
          </div>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#15803D]" />
              <h2 className="text-base sm:text-lg font-bold text-[#133E2B]">
                Grafik Perbandingan: Sasaran vs Realisasi Kas ({selectedYear})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grafik otomatis untuk memantau konsistensi dan capaian bulanan
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs self-start">
            <button
              onClick={() => setChartMode('deposit')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                chartMode === 'deposit'
                  ? 'bg-white text-[#15803D] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sasaran vs Setoran
            </button>
            <button
              onClick={() => setChartMode('balance')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                chartMode === 'balance'
                  ? 'bg-white text-[#15803D] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tren Saldo Akhir
            </button>
          </div>
        </div>

        {chartMode === 'deposit' ? (
          <div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-3 items-end h-56 pt-6 pb-2 border-b border-slate-200">
              {recaps.map((r) => {
                const targetHeight = Math.min(100, Math.max(5, (r.targetDeposit / maxDepositVal) * 100));
                const actualHeight = Math.min(100, Math.max(0, (r.totalDeposit / maxDepositVal) * 100));
                const isSuccess = r.totalDeposit >= r.targetDeposit && r.totalDeposit > 0;

                return (
                  <div key={r.monthKey} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 z-30 bg-[#133E2B] text-white text-[10px] rounded-xl p-2.5 pointer-events-none whitespace-nowrap shadow-lg">
                      <p className="font-bold border-b border-emerald-800 pb-1 mb-1 text-emerald-300">{r.monthName}</p>
                      <p>Target: {formatRupiah(r.targetDeposit)}</p>
                      <p className="text-emerald-400">Realisasi: {formatRupiah(r.totalDeposit)}</p>
                      <p className="text-slate-300">Pencapaian: {formatPercentage(r.achievementPercentage)}</p>
                    </div>

                    <div className="flex items-end justify-center gap-1 w-full h-44">
                      {/* Target bar */}
                      <div
                        className="w-2.5 sm:w-3 bg-slate-200 rounded-t-lg hover:bg-slate-300 transition"
                        style={{ height: `${targetHeight}%` }}
                      />
                      {/* Actual deposit bar */}
                      <div
                        className={`w-3.5 sm:w-4 rounded-t-lg transition-all duration-300 ${
                          isSuccess
                            ? 'bg-[#15803D] hover:bg-[#14532D]'
                            : r.totalDeposit > 0
                            ? 'bg-[#D97706] hover:bg-[#B45309]'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${actualHeight}%` }}
                      />
                    </div>

                    <span className="text-[10px] text-slate-500 font-semibold mt-2">
                      {r.monthName.substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mt-3 font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-slate-200 inline-block rounded-full"></span>
                  Sasaran Rencana ({formatRupiah(goal.monthlyDepositTarget || 2500000)})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#15803D] inline-block rounded-full"></span>
                  Realisasi Target Tercapai (≥100%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#D97706] inline-block rounded-full"></span>
                  Setoran Masuk
                </span>
              </div>
              <span className="text-slate-400">Skala: {formatRupiah(maxDepositVal)}</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-3 items-end h-56 pt-6 pb-2 border-b border-slate-200">
              {recaps.map((r) => {
                const balHeight = Math.min(100, Math.max(5, (r.closingBalance / maxBalanceVal) * 100));

                return (
                  <div key={r.monthKey} className="flex flex-col items-center h-full justify-end group relative">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-30 bg-[#133E2B] text-white text-[10px] rounded-lg p-2 pointer-events-none whitespace-nowrap shadow-lg">
                      <p className="font-bold text-emerald-300">{r.monthName}</p>
                      <p className="text-white font-bold">Saldo Akhir: {formatRupiah(r.closingBalance)}</p>
                    </div>

                    <div className="flex items-end justify-center w-full h-44">
                      <div
                        className="w-full max-w-[28px] bg-gradient-to-t from-[#14532D] to-[#22C55E] rounded-t-lg hover:brightness-110 transition"
                        style={{ height: `${balHeight}%` }}
                      />
                    </div>

                    <span className="text-[10px] text-slate-500 font-semibold mt-2">
                      {r.monthName.substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-3 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#15803D] inline-block rounded-full"></span>
                Akumulasi Saldo Kas Bersih
              </span>
              <span className="text-slate-400">Saldo Puncak: {formatRupiah(maxBalanceVal)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F0FDF4] border-b border-emerald-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#133E2B]">
            Tabel Rekapitulasi Lengkap 12 Bulan (Tahun {selectedYear})
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Formula: =SUMIFS(...)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#F0FDF4] text-[#133E2B] font-bold border-b border-emerald-200 text-[11px] uppercase tracking-wider">
              <tr className="divide-x divide-emerald-100">
                <th className="py-3 px-3">Bulan</th>
                <th className="py-3 px-3 text-right">Target Setoran</th>
                <th className="py-3 px-3 text-right text-emerald-700">Total Setoran</th>
                <th className="py-3 px-3 text-right text-rose-700">Total Penarikan</th>
                <th className="py-3 px-3 text-right">Selisih Bersih</th>
                <th className="py-3 px-3 text-right font-extrabold text-[#133E2B] bg-emerald-100/40">Saldo Akhir</th>
                <th className="py-3 px-3 text-center">Capaian</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-normal">
              {recaps.map((r) => {
                const isMet = r.totalDeposit >= r.targetDeposit && r.totalDeposit > 0;
                const hasActivity = r.totalDeposit > 0 || r.totalWithdrawal > 0;

                return (
                  <tr key={r.monthKey} className="hover:bg-slate-50 transition divide-x divide-slate-100">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {r.monthName}
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-600 whitespace-nowrap">
                      {formatRupiah(r.targetDeposit)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                      {r.totalDeposit > 0 ? `+${formatRupiah(r.totalDeposit)}` : '-'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-rose-600 whitespace-nowrap">
                      {r.totalWithdrawal > 0 ? `-${formatRupiah(r.totalWithdrawal)}` : '-'}
                    </td>

                    <td className={`py-2.5 px-3 text-right font-bold whitespace-nowrap ${
                      r.netDiff > 0 ? 'text-emerald-700' : r.netDiff < 0 ? 'text-rose-600' : 'text-slate-400'
                    }`}>
                      {r.netDiff !== 0 ? formatRupiah(r.netDiff) : '-'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-black text-[#133E2B] whitespace-nowrap bg-emerald-50/40">
                      {formatRupiah(r.closingBalance)}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {hasActivity ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isMet
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {formatPercentage(r.achievementPercentage)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Footer Row */}
            <tfoot className="bg-[#F0FDF4] text-[#133E2B] font-bold border-t-2 border-emerald-200">
              <tr className="divide-x divide-emerald-200">
                <td className="py-3 px-3 uppercase tracking-wider text-xs">Total Setahun:</td>
                <td className="py-3 px-3 text-right">{formatRupiah(yearTargetTotal)}</td>
                <td className="py-3 px-3 text-right text-emerald-800">+{formatRupiah(yearTotalDeposit)}</td>
                <td className="py-3 px-3 text-right text-rose-700">-{formatRupiah(yearTotalWithdrawal)}</td>
                <td className="py-3 px-3 text-right text-slate-900">{formatRupiah(yearNetDiff)}</td>
                <td className="py-3 px-3 text-right font-black text-[#15803D]">{formatRupiah(yearFinalBalance)}</td>
                <td className="py-3 px-3 text-center text-[#15803D]">{formatPercentage(averageAchievement)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
