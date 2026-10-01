import React, { useState } from 'react';
import { 
  Target, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Save, 
  Calculator, 
  Info,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';
import { SavingsGoal, Transaction } from '../types/savings';
import { formatRupiah, formatPercentage, formatDateIndonesian } from '../utils/formatters';

interface TargetPlannerProps {
  goal: SavingsGoal;
  onUpdateGoal: (updatedGoal: SavingsGoal) => void;
  transactions: Transaction[];
}

export const TargetPlanner: React.FC<TargetPlannerProps> = ({
  goal,
  onUpdateGoal,
  transactions,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: goal.name,
    targetAmount: goal.targetAmount.toString(),
    startDate: goal.startDate,
    targetDate: goal.targetDate,
    monthlyDepositTarget: (goal.monthlyDepositTarget || 2500000).toString(),
    notes: goal.notes || '',
  });

  const [simulatedMonthlyDeposit, setSimulatedMonthlyDeposit] = useState<number>(
    goal.monthlyDepositTarget || 2500000
  );

  const currentTotal = transactions.length > 0 
    ? transactions[transactions.length - 1].balanceAfter 
    : 0;

  const targetAmountNum = parseFloat(formData.targetAmount) || goal.targetAmount;
  const remainingNominal = Math.max(0, targetAmountNum - currentTotal);
  const achievementRate = targetAmountNum > 0 ? (currentTotal / targetAmountNum) : 0;
  const progressPercent = Math.min(100, Math.max(0, achievementRate * 100));

  const start = new Date(formData.startDate);
  const end = new Date(formData.targetDate);
  const today = new Date();

  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(1, Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const totalWeeks = Math.max(1, Math.round(totalDays / 7));
  const remainingWeeks = Math.max(1, Math.round(remainingDays / 7));

  const totalMonths = Math.max(1, Math.round(totalDays / 30.4));
  const remainingMonths = Math.max(1, Math.round(remainingDays / 30.4));

  const targetPerMinggu = remainingWeeks > 0 ? Math.ceil(remainingNominal / remainingWeeks) : remainingNominal;
  const targetPerBulan = remainingMonths > 0 ? Math.ceil(remainingNominal / remainingMonths) : remainingNominal;

  const simMonthsNeeded = simulatedMonthlyDeposit > 0 ? Math.ceil(remainingNominal / simulatedMonthlyDeposit) : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoal({
      ...goal,
      name: formData.name.trim(),
      targetAmount: parseFloat(formData.targetAmount) || goal.targetAmount,
      startDate: formData.startDate,
      targetDate: formData.targetDate,
      monthlyDepositTarget: parseFloat(formData.monthlyDepositTarget) || targetPerBulan,
      notes: formData.notes.trim(),
    });
    setIsEditing(false);
  };

  const applyPreset = (presetName: string, amount: number, monthsDuration: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetD = new Date();
    targetD.setMonth(targetD.getMonth() + monthsDuration);
    const targetStr = targetD.toISOString().split('T')[0];

    const monthly = Math.ceil(amount / monthsDuration);

    setFormData({
      name: presetName,
      targetAmount: amount.toString(),
      startDate: todayStr,
      targetDate: targetStr,
      monthlyDepositTarget: monthly.toString(),
      notes: `Target otomatis untuk ${presetName} selama ${monthsDuration} bulan.`,
    });
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      {/* Title & Goal Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#D97706]" />
                Rencana &amp; Target Finansial MorkaFin (Nature Goals)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#133E2B] tracking-tight">
              {goal.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kalkulasi otomatis target setoran mingguan, bulanan, dan estimasi waktu panen tabungan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-full bg-[#15803D] hover:bg-[#14532D] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition transform active:scale-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Sesuaikan Target</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition"
              >
                Batal Edit
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nama Tujuan Tabungan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Target Nominal (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="50000"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#15803D] font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Tanggal Mulai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Target Tanggal Selesai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Catatan Strategi &amp; Komitmen Menabung
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#15803D]"
                  placeholder="Contoh: Mengalokasikan 25% dari pendapatan bulanan"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <span className="font-bold text-slate-700">Pilihan Rencana Cepat:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('Dana Darurat 6 Bulan', 30000000, 12)}
                  className="text-[#15803D] underline font-bold hover:text-[#14532D]"
                >
                  Dana Darurat (30 Jt)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => applyPreset('DP Rumah Idaman', 75000000, 24)}
                  className="text-[#15803D] underline font-bold hover:text-[#14532D]"
                >
                  DP Rumah (75 Jt)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => applyPreset('Ibadah Umroh / Haji', 40000000, 16)}
                  className="text-[#15803D] underline font-bold hover:text-[#14532D]"
                >
                  Umroh (40 Jt)
                </button>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#15803D] hover:bg-[#14532D] text-white font-bold shadow-md shadow-emerald-700/20"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <span className="text-slate-500 block text-[11px] font-semibold">Tanggal Mulai:</span>
              <span className="font-bold text-[#133E2B]">{formatDateIndonesian(goal.startDate)}</span>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <span className="text-slate-500 block text-[11px] font-semibold">Target Selesai:</span>
              <span className="font-bold text-[#133E2B]">{formatDateIndonesian(goal.targetDate)}</span>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <span className="text-slate-500 block text-[11px] font-semibold">Durasi Waktu:</span>
              <span className="font-bold text-[#133E2B]">~{totalMonths} Bulan ({totalWeeks} Pekan)</span>
            </div>
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
              <span className="text-[#D97706] block text-[11px] font-bold">Sisa Waktu:</span>
              <span className="font-black text-[#D97706]">~{remainingMonths} Bulan ({remainingWeeks} Pekan)</span>
            </div>
          </div>
        )}
      </div>

      {/* Target Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wider">
            1. Kas Terkumpul
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">{formatRupiah(currentTotal)}</div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Formula: =Dashboard!B3</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wider">
            2. Sisa Nominal
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#133E2B]">{formatRupiah(remainingNominal)}</div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Formula: =MAX(0; Target - Terkumpul)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wider">
            3. Setoran / Pekan
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#15803D]">{formatRupiah(targetPerMinggu)}</div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Formula: =ROUNDUP(Sisa / Pekan; 0)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wider">
            4. Setoran / Bulan
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#D97706]">{formatRupiah(targetPerBulan)}</div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Formula: =ROUNDUP(Sisa / Bulan; 0)</p>
        </div>
      </div>

      {/* Target Progress Milestones */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-[#133E2B] mb-1">Tahapan Pertumbuhan Tabungan (25% - 100%)</h2>
        <p className="text-xs text-slate-500 mb-6">Pertumbuhan bertahap yang tenang agar menabung terasa nyaman, aman, dan membahagiakan</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Milestone 1 (25% Tunas)', target: targetAmountNum * 0.25 },
            { label: 'Milestone 2 (50% Pohon Muda)', target: targetAmountNum * 0.5 },
            { label: 'Milestone 3 (75% Rimbun)', target: targetAmountNum * 0.75 },
            { label: 'Target Panen (100%)', target: targetAmountNum },
          ].map((m) => {
            const isCompleted = currentTotal >= m.target;
            return (
              <div
                key={m.label}
                className={`p-5 rounded-2xl border transition ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">{m.label}</span>
                  {isCompleted ? (
                    <span className="p-1 rounded-full bg-[#15803D] text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="text-lg font-black text-[#133E2B]">{formatRupiah(m.target)}</div>
                <div className="mt-2 text-xs">
                  {isCompleted ? (
                    <span className="font-bold text-[#15803D]">✓ Sudah Terlampaui</span>
                  ) : (
                    <span className="text-slate-500">Perlu {formatRupiah(Math.max(0, m.target - currentTotal))} lagi</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-[#D97706]" />
          <h2 className="text-lg font-bold text-[#133E2B]">Kalkulator Simulasi Tabungan MorkaFin</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Uji skenario: Bagaimana jika Anda menambah atau menyesuaikan nominal setoran bulanan agar target tercapai lebih cepat?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-[#133E2B]">
              <span>Setoran Rutin Bulanan:</span>
              <span className="text-sm font-black text-[#15803D]">{formatRupiah(simulatedMonthlyDeposit)} / Bulan</span>
            </div>
            <input
              type="range"
              min="500000"
              max="10000000"
              step="250000"
              value={simulatedMonthlyDeposit}
              onChange={(e) => setSimulatedMonthlyDeposit(parseInt(e.target.value, 10))}
              className="w-full accent-[#15803D] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>Rp 500 Rb</span>
              <span>Rp 2.5 Jt</span>
              <span>Rp 5 Jt</span>
              <span>Rp 10 Jt</span>
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200 text-center">
            <span className="text-xs text-[#15803D] font-bold block mb-1">
              Estimasi Waktu Tercapai:
            </span>
            <div className="text-2xl font-black text-[#133E2B]">
              {remainingNominal === 0 ? 'Tuntas' : `~${simMonthsNeeded} Bulan`}
            </div>
            <span className="text-[11px] text-slate-600 block mt-1">
              {remainingNominal === 0 ? 'Target telah terpenuhi sempurna' : `Selesai sekitar ${new Date(Date.now() + simMonthsNeeded * 30 * 24 * 3600 * 1000).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
