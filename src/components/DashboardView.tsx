import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Award,
  PartyPopper,
  BellRing,
  CalendarCheck,
  Coins
} from 'lucide-react';
import { Transaction, SavingsGoal, ProgressStatus } from '../types/savings';
import { formatRupiah, formatPercentage, formatDateIndonesian, computeMonthlyRecaps } from '../utils/formatters';
import { FinancialInsights } from './FinancialInsights';

interface DashboardViewProps {
  goal: SavingsGoal;
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onNavigateTab: (tab: any) => void;
}

interface MilestoneConfig {
  threshold: number;
  title: string;
  subtitle: string;
  message: string;
  badge: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
}

const MILESTONES: MilestoneConfig[] = [
  {
    threshold: 100,
    title: '🌿 Selamat! Target Tabungan 100% Tercapai Sempurna!',
    subtitle: 'Pohon Finansial Berbuah Lebat',
    message: 'Luar biasa! Benih tabungan yang Anda sirami dan rawat dengan disiplin kini telah berbuah tuntas. Menabung dengan tenang membawa rasa aman dan bahagia sejati!',
    badge: '100% Panen Tuntas',
    borderColor: 'border-l-[#15803D]',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-[#15803D]',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-[#15803D]',
  },
  {
    threshold: 75,
    title: 'Pohon Tabungan Rimbun! 75% Target Berhasil Terkumpul!',
    subtitle: 'Menjelang Musim Panen Finansial',
    message: 'Tinggal 25% lagi impian finansial Anda terwujud. Pertahankan siraman tabungan rutin ini agar panen tercapai dengan mulus, tenang, dan membahagiakan.',
    badge: '75% Tumbuh Rimbun',
    borderColor: 'border-l-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    threshold: 50,
    title: 'Luar Biasa! Separuh Perjalanan (50%) Bertumbuh Sehat!',
    subtitle: 'Akar Finansial Semakin Kokoh',
    message: 'Separuh perjalanan telah Anda lalui dengan penuh kedamaian dan disiplin. Tabungan Anda tumbuh stabil laksana pohon kokoh yang berakar dalam.',
    badge: '50% Separuh Jalan Tercapai',
    borderColor: 'border-l-[#D97706]',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-[#D97706]',
    iconBg: 'bg-amber-100',
    iconColor: 'text-[#D97706]',
  },
  {
    threshold: 25,
    title: 'Selamat! Tunas Tabungan Anda Berhasil Tumbuh 25%!',
    subtitle: 'Langkah Awal Finansial yang Menyejukkan',
    message: 'Seperempat target tabungan Anda telah terkumpul! Permulaan yang subur ini adalah pondasi terbaik bahwa menabung terasa aman, nyaman, dan menyenangkan.',
    badge: '25% Tunas Awal Bersemi',
    borderColor: 'border-l-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  goal,
  transactions,
  onOpenAddModal,
  onNavigateTab,
}) => {
  const currentTotal = transactions.length > 0 
    ? transactions[transactions.length - 1].balanceAfter 
    : 0;

  const remainingTarget = Math.max(0, goal.targetAmount - currentTotal);
  const progressRatio = goal.targetAmount > 0 ? (currentTotal / goal.targetAmount) : 0;
  const progressPercent = Math.min(100, Math.max(0, progressRatio * 100));

  // Determine highest reached milestone
  const activeMilestone = MILESTONES.find(m => progressPercent >= m.threshold) || null;
  const [dismissedMilestone, setDismissedMilestone] = useState<number | null>(null);

  // Auto-reset dismissed state when crossing higher milestone
  useEffect(() => {
    if (activeMilestone && dismissedMilestone !== null && activeMilestone.threshold > dismissedMilestone) {
      setDismissedMilestone(null);
    }
  }, [activeMilestone, dismissedMilestone]);

  const showMilestoneBanner = activeMilestone && dismissedMilestone !== activeMilestone.threshold;

  let status: ProgressStatus = 'Belum Mulai';
  let statusBadgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let statusDotColor = 'bg-slate-400';

  if (progressRatio >= 1) {
    status = 'Target Tercapai';
    statusBadgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    statusDotColor = 'bg-emerald-600 animate-pulse';
  } else if (progressRatio >= 0.75) {
    status = 'Hampir Tercapai';
    statusBadgeStyle = 'bg-emerald-50 text-[#15803D] border-emerald-300';
    statusDotColor = 'bg-[#15803D]';
  } else if (progressRatio > 0) {
    status = 'Berjalan';
    statusBadgeStyle = 'bg-amber-50 text-amber-900 border-amber-300';
    statusDotColor = 'bg-[#D97706]';
  }


  const sampleYear = transactions.length > 0 
    ? parseInt(transactions[transactions.length - 1].date.substring(0, 4), 10) 
    : new Date().getFullYear();

  const latestTx = transactions[transactions.length - 1];
  const currentMonthKey = latestTx ? latestTx.date.substring(0, 7) : `${sampleYear}-01`;

  const currentMonthDeposits = transactions
    .filter(tx => tx.date.startsWith(currentMonthKey) && tx.type === 'Setoran')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyRecaps = computeMonthlyRecaps(transactions, goal.monthlyDepositTarget || 2500000, sampleYear);
  const activeMonths = monthlyRecaps.filter(m => m.totalDeposit > 0);
  
  const totalAllDeposits = transactions
    .filter(tx => tx.type === 'Setoran')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalAllWithdrawals = transactions
    .filter(tx => tx.type === 'Penarikan')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const averageDepositMonthly = activeMonths.length > 0
    ? totalAllDeposits / activeMonths.length
    : (goal.monthlyDepositTarget || 2500000);

  const estimatedMonthsRemaining = averageDepositMonthly > 0 && remainingTarget > 0
    ? Math.ceil(remainingTarget / averageDepositMonthly)
    : 0;

  // Daily Required Savings Calculation to hit goal by targetDate
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDateObj = new Date(goal.targetDate);
  targetDateObj.setHours(0, 0, 0, 0);
  const diffTimeMs = targetDateObj.getTime() - today.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffTimeMs / (1000 * 60 * 60 * 24)));
  
  const dailyRequiredSavings = remainingTarget > 0 
    ? Math.ceil(remainingTarget / daysRemaining) 
    : 0;

  const weeklyEquivalentSavings = dailyRequiredSavings * 7;

  const sourceBreakdown: { [key: string]: number } = {};
  transactions
    .filter(t => t.type === 'Setoran')
    .forEach(t => {
      sourceBreakdown[t.source] = (sourceBreakdown[t.source] || 0) + t.amount;
    });

  const sortedSources = Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1]);
  const recentTransactions = [...transactions].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* REAL-TIME CONGRATULATORY MILESTONE NOTIFICATION BANNER (FINANSIALKU CLEAN ALERT AESTHETIC) */}
      {showMilestoneBanner && activeMilestone && (
        <div 
          className={`bg-white rounded-xl shadow-sm border border-slate-100 ${activeMilestone.borderColor} border-l-4 p-5 sm:p-6 transition-all duration-300 relative animate-in fade-in slide-in-from-top-3`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {/* Milestone Icon */}
              <div className={`w-11 h-11 rounded-xl ${activeMilestone.iconBg} ${activeMilestone.iconColor} flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}>
                {activeMilestone.threshold === 100 ? (
                  <PartyPopper className="w-6 h-6" />
                ) : (
                  <Award className="w-6 h-6" />
                )}
              </div>

              {/* Alert Content */}
              <div className="space-y-1.5 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${activeMilestone.badgeBg} ${activeMilestone.badgeText}`}>
                    <Sparkles className="w-3 h-3" />
                    <span>{activeMilestone.badge}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Akumulasi: {formatRupiah(currentTotal)} / {formatRupiah(goal.targetAmount)} ({progressPercent.toFixed(1)}%)
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-[#133E2B] tracking-tight">
                  {activeMilestone.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {activeMilestone.message}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={onOpenAddModal}
                    className="text-xs font-bold text-[#D97706] hover:text-[#B45309] hover:underline flex items-center gap-1"
                  >
                    Tambah Setoran Berikutnya <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => onNavigateTab('target')}
                    className="text-xs font-bold text-[#15803D] hover:text-[#14532D] hover:underline"
                  >
                    Lihat Rincian Target
                  </button>
                </div>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setDismissedMilestone(activeMilestone.threshold)}
              title="Tutup Notifikasi"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION: MORKAFIN NATURE GREEN & WARM SUNLIT AMBER WHITE CARDS */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#F0FDF4] via-[#F7FEFA] to-[#FEFCE8] p-6 sm:p-8 border border-emerald-100 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: MorkaFin Signature Nature Card */}
          <div className="lg:col-span-7 bg-white rounded-xl p-6 sm:p-7 shadow-sm border border-emerald-100/80 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#15803D] border border-emerald-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Ekosistem Perencanaan Tabungan Hijau &amp; Bahagia</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#133E2B] tracking-tight leading-snug">
              Tumbuhkan tabungan &amp; dana masa depan dengan aman, tenang, dan terukur.
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Pantau seluruh setoran rutin, target nominal <strong>{goal.name}</strong>, dan progres pencapaian tabungan Anda secara transparan bersama template cerdas MorkaFin.com.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenAddModal}
                className="px-6 py-2.5 rounded-full bg-[#15803D] hover:bg-[#14532D] text-white font-bold text-xs sm:text-sm shadow-sm transition transform active:scale-95 flex items-center gap-2"
              >
                <PiggyBank className="w-4 h-4 text-amber-300" />
                <span>Siram &amp; Catat Tabungan Sekarang</span>
              </button>

              <button
                onClick={() => onNavigateTab('target')}
                className="px-5 py-2.5 rounded-full border border-slate-300 hover:border-[#15803D] hover:text-[#15803D] text-slate-700 font-bold text-xs sm:text-sm bg-white transition shadow-sm"
              >
                Ubah Parameter Target
              </button>
            </div>
          </div>

          {/* Right: Modern Financial Visual Cards (Signature White, Rounded-xl, Shadow-sm) */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* Growth Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  🌱 +{(progressPercent).toFixed(1)}% Terkumpul
                </span>
                <div className="text-xl sm:text-2xl font-black text-[#133E2B]">
                  {formatRupiah(currentTotal)}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Saldo Kas Tabungan Tersedia</p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#15803D] shadow-2xs">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
            </div>

            {/* Target Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#D97706] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Target Nominal ({formatDateIndonesian(goal.targetDate)})
                </span>
                <div className="text-xl sm:text-2xl font-black text-[#D97706]">
                  {formatRupiah(goal.targetAmount)}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Sisa {formatRupiah(remainingTarget)} lagi {remainingTarget > 0 ? `(Komitmen ~${formatRupiah(dailyRequiredSavings)}/hari)` : '• Tuntas Sempurna'}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-[#D97706] shadow-2xs">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracker Card */}
        <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border border-emerald-100/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
              <span className="text-xs sm:text-sm font-bold text-[#133E2B]">
                Pertumbuhan Tabungan (Nature Progress)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeStyle} flex items-center gap-1.5`}>
                <span className={`w-2 h-2 rounded-full ${statusDotColor}`} />
                Status: {status}
              </span>
              <span className="text-xs font-extrabold text-[#15803D]">
                {progressPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-[#15803D] via-[#22C55E] to-[#EAB308] h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 font-medium mt-2">
            <span>Benih Awal (0%)</span>
            <span>25% (Tunas)</span>
            <span>50% (Pohon Muda)</span>
            <span>75% (Rimbun)</span>
            <span className="font-bold text-[#15803D]">100% Panen ({formatRupiah(goal.targetAmount)})</span>
          </div>

          {/* Interactive Milestone Status Indicators (25%, 50%, 75%, 100%) */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {MILESTONES.slice().reverse().map((m) => {
              const isAchieved = progressPercent >= m.threshold;
              return (
                <button
                  key={m.threshold}
                  type="button"
                  onClick={() => setDismissedMilestone(null)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    isAchieved
                      ? 'bg-emerald-50/60 border-emerald-200 hover:border-[#15803D]'
                      : 'bg-slate-50/60 border-slate-200/80 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      Milestone {m.threshold}%
                    </span>
                    <span className={`text-xs font-extrabold ${isAchieved ? 'text-[#133E2B]' : 'text-slate-500'}`}>
                      {formatRupiah(goal.targetAmount * (m.threshold / 100))}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isAchieved ? 'bg-[#15803D] text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isAchieved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. MORKAFIN NATURE KPI CARDS: WHITE BACKGROUND, SHADOW-SM, ROUNDED-XL, BORDER BORDER-SLATE-100 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPI 1: Target Tabungan */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Tabungan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#15803D]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#133E2B]">
            {formatRupiah(goal.targetAmount)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target sasaran terencana</span>
          </div>
        </div>

        {/* KPI 2: Total Tabungan Saat Ini */}
        <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-5 bg-gradient-to-b from-white to-emerald-50/20 hover:border-[#15803D] transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">Total Tabungan Saat Ini</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-[#15803D]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#15803D]">
            {formatRupiah(currentTotal)}
          </div>
          <div className="mt-2 text-[11px] text-[#15803D] font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{formatPercentage(progressRatio)} dari target tercapai</span>
          </div>
        </div>

        {/* KPI 3: Sisa Target */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:border-amber-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sisa Target</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[#D97706]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#133E2B]">
            {formatRupiah(remainingTarget)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {remainingTarget === 0 ? 'Selamat! Pohon tabungan telah berbuah lebat.' : `Perlu ${formatRupiah(remainingTarget)} lagi`}
          </div>
        </div>

        {/* KPI 4: Daily Required Savings (Tabungan Harian Wajib) */}
        <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-5 bg-gradient-to-br from-white via-white to-emerald-50/30 hover:border-[#15803D] transition relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#133E2B]">Tabungan Harian Wajib</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-[#D97706] border border-amber-200">
                Daily Goal
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[#D97706] group-hover:bg-emerald-50 group-hover:text-[#15803D] transition-colors">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#15803D]">
            {remainingTarget === 0 ? 'Tuntas' : `${formatRupiah(dailyRequiredSavings)} / hari`}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center justify-between flex-wrap gap-1">
            <span>
              {remainingTarget === 0 
                ? 'Target tabungan telah tuntas!' 
                : `~${daysRemaining} hari s/d deadline`
              }
            </span>
            {remainingTarget > 0 && (
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 text-[10px]">
                {formatRupiah(weeklyEquivalentSavings)}/pekan
              </span>
            )}
          </div>
        </div>

        {/* KPI 4: Total Setoran Bulan Berjalan */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Setoran Bulan Ini</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#15803D]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#133E2B]">
            {formatRupiah(currentMonthDeposits)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Periode aktif ({currentMonthKey})
          </div>
        </div>

        {/* KPI 5: Rata-Rata Setoran Per Bulan */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rata-Rata Setoran</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#133E2B]">
            {formatRupiah(averageDepositMonthly)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Dari {activeMonths.length} bulan aktif menabung
          </div>
        </div>

        {/* KPI 6: Estimasi Waktu Capai Target */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimasi Waktu</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#133E2B]">
            {remainingTarget === 0 ? 'Tuntas' : `~${estimatedMonthsRemaining} Bulan`}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Rata-rata: {formatRupiah(averageDepositMonthly)}/bln
          </div>
        </div>

        {/* KPI 7: Total Akumulasi Dana Masuk */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Kas Masuk</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {formatRupiah(totalAllDeposits)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {transactions.filter(t => t.type === 'Setoran').length} kali setoran
          </div>
        </div>

        {/* KPI 8: Total Penarikan Kas */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:border-rose-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Total Penarikan Kas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            {formatRupiah(totalAllWithdrawals)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {transactions.filter(t => t.type === 'Penarikan').length} kali penarikan keperluan
          </div>
        </div>
      </div>

      {/* 3. GEMINI AI FINANCIAL INSIGHTS & SAVING TIPS (MORKAFIN NATURE CARD) */}
      <FinancialInsights
        goal={goal}
        transactions={transactions}
        currentTotal={currentTotal}
        remainingTarget={remainingTarget}
        progressPercent={progressPercent}
        currentMonthDeposits={currentMonthDeposits}
        averageMonthlyDeposit={averageDepositMonthly}
        estimatedRemainingMonths={estimatedMonthsRemaining}
        status={status}
      />

      {/* 4. MONTHLY PERFORMANCE & FUND SOURCES (SIGNATURE WHITE CARDS, ROUNDED-XL, SHADOW-SM) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance Visualizer */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#133E2B]">Realisasi Setoran Bulanan ({sampleYear})</h2>
              <p className="text-xs text-slate-500 mt-0.5">Perbandingan realisasi setoran vs target bulanan {formatRupiah(goal.monthlyDepositTarget || 2500000)}</p>
            </div>
            <button
              onClick={() => onNavigateTab('recap')}
              className="text-xs text-[#15803D] font-bold hover:underline flex items-center gap-1"
            >
              Lihat Rekap Lengkap <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2 pt-6 pb-2 items-end h-48 border-b border-slate-100">
            {monthlyRecaps.map((m) => {
              const maxDeposit = 5000000;
              const heightPercent = Math.min(100, Math.max(8, (m.totalDeposit / maxDeposit) * 100));
              const isTargetMet = m.totalDeposit >= m.targetDeposit && m.totalDeposit > 0;
              const hasActivity = m.totalDeposit > 0;

              return (
                <div key={m.monthKey} className="flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-[#133E2B] text-white text-[10px] rounded-lg px-2 py-1 pointer-events-none whitespace-nowrap shadow-md">
                    <p className="font-bold text-emerald-300">{m.monthName}</p>
                    <p>Setoran: {formatRupiah(m.totalDeposit)}</p>
                    <p>Saldo: {formatRupiah(m.closingBalance)}</p>
                  </div>

                  <div className="w-full flex items-end justify-center h-32">
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        hasActivity
                          ? isTargetMet
                            ? 'bg-[#15803D] hover:bg-[#14532D]'
                            : 'bg-[#D97706] hover:bg-[#B45309]'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                      style={{ height: hasActivity ? `${heightPercent}%` : '4px' }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 font-semibold">
                    {m.monthName.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mt-3 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] inline-block"></span>
                Target Tercapai (≥ Rp 2.5 Jt)
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] inline-block"></span>
                Setoran Masuk
              </span>
            </div>
            <span className="text-slate-400 font-medium">Tahun {sampleYear}</span>
          </div>
        </div>

        {/* Source of Funds Distribution */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#133E2B] mb-1">Distribusi Sumber Dana</h2>
            <p className="text-xs text-slate-500 mb-4">Asal dana tabungan yang telah masuk</p>

            <div className="space-y-3">
              {sortedSources.slice(0, 5).map(([source, amount]) => {
                const pct = totalAllDeposits > 0 ? (amount / totalAllDeposits) * 100 : 0;
                return (
                  <div key={source} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{source}</span>
                      <span className="text-[#133E2B] font-bold">{formatRupiah(amount)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#15803D] h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-600">Formula Otomatis:</span>
            <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono text-slate-800">
              =SUMIF(E:E; &quot;Gaji Pokok&quot;; F:F)
            </code>
          </div>
        </div>
      </div>

      {/* 4. RECENT TRANSACTIONS PREVIEW (SIGNATURE WHITE CARD, ROUNDED-XL, SHADOW-SM) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#133E2B]">5 Transaksi Terakhir</h2>
            <p className="text-xs text-slate-500 mt-0.5">Mutasi tabungan terbaru dengan saldo berjalan real-time</p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs sm:text-sm text-[#15803D] font-bold hover:underline flex items-center gap-1"
          >
            Buka Buku Kas ({transactions.length} Transaksi) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-y border-slate-200 font-bold">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-3">Jenis</th>
                <th className="py-2.5 px-3">Sumber Dana</th>
                <th className="py-2.5 px-3 text-right">Nominal</th>
                <th className="py-2.5 px-3 text-right">Saldo Kas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap font-medium">{formatDateIndonesian(tx.date)}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{tx.description}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        tx.type === 'Setoran'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-medium">{tx.source}</td>
                  <td className={`py-2.5 px-3 text-right font-bold whitespace-nowrap ${
                    tx.type === 'Setoran' ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {tx.type === 'Setoran' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-[#133E2B] whitespace-nowrap">
                    {formatRupiah(tx.balanceAfter)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
