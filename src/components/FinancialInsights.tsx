import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Compass, 
  Zap,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Transaction, SavingsGoal } from '../types/savings';
import { formatRupiah, formatPercentage, computeMonthlyRecaps } from '../utils/formatters';

export interface InsightTip {
  category: string;
  title: string;
  content: string;
  actionableStep: string;
  impactLevel: 'Tinggi' | 'Sedang';
}

export interface FinancialInsightsData {
  summary: string;
  statusEvaluation: string;
  healthScore: number;
  keyStrengths: string[];
  areasToImprove: string[];
  tips: InsightTip[];
  recommendedActionThisWeek: string;
  recommendedMonthlyDeposit?: number;
}

interface FinancialInsightsProps {
  goal: SavingsGoal;
  transactions: Transaction[];
  currentTotal: number;
  remainingTarget: number;
  progressPercent: number;
  currentMonthDeposits: number;
  averageMonthlyDeposit: number;
  estimatedRemainingMonths: number;
  status: string;
}

const FOCUS_PRESETS = [
  { label: 'Semua Wawasan', value: '' },
  { label: 'Akselerasi Target 🚀', value: 'Fokus pada strategi menaikkan nominal tabungan dan memangkas waktu pencapaian target' },
  { label: 'Efisiensi Pengeluaran 💡', value: 'Fokus pada evaluasi kebocoran dana dan kebiasaan menabung rutin' },
  { label: 'Proteksi Kas & Dana Darurat 🛡️', value: 'Fokus pada pencegahan penarikan saldo dan keamanan dana tabungan' },
];

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  goal,
  transactions,
  currentTotal,
  remainingTarget,
  progressPercent,
  currentMonthDeposits,
  averageMonthlyDeposit,
  estimatedRemainingMonths,
  status,
}) => {
  const [data, setData] = useState<FinancialInsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchInsights = useCallback(async (focusOverride?: string) => {
    setLoading(true);
    setError(null);

    try {
      const activeFocus = focusOverride !== undefined ? focusOverride : selectedFocus;

      // Extract sources distribution
      const sourcesMap: Record<string, number> = {};
      transactions
        .filter((t) => t.type === 'Setoran')
        .forEach((t) => {
          sourcesMap[t.source] = (sourcesMap[t.source] || 0) + t.amount;
        });

      // Extract recent transactions (up to 8)
      const recentTx = transactions.slice(-8).map((t) => ({
        date: t.date,
        description: t.description,
        type: t.type,
        amount: t.amount,
        source: t.source,
      }));

      // Compute monthly recap summary
      const sampleYear = transactions.length > 0
        ? parseInt(transactions[transactions.length - 1].date.substring(0, 4), 10)
        : new Date().getFullYear();
      const monthlyTarget = goal.monthlyDepositTarget || 2500000;
      const monthlyRecap = computeMonthlyRecaps(transactions, monthlyTarget, sampleYear).slice(-6).map((m) => ({
        month: m.monthName,
        totalDeposit: m.totalDeposit,
        totalWithdrawal: m.totalWithdrawal,
        closingBalance: m.closingBalance,
      }));

      const payload = {
        goal: {
          name: goal.name,
          targetAmount: goal.targetAmount,
          startDate: goal.startDate,
          targetEndDate: goal.targetDate,
        },
        progress: {
          currentTotal,
          remainingTarget,
          progressPercent,
          currentMonthDeposits,
          averageMonthlyDeposit,
          estimatedRemainingMonths,
          status,
        },
        recentTransactions: recentTx,
        sourcesDistribution: sourcesMap,
        monthlyRecap,
        focusArea: activeFocus,
      };

      const res = await fetch('/api/ai/financial-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result: FinancialInsightsData = await res.json();
      setData(result);
      setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      console.error('Failed to load financial insights:', err);
      setError('Belum dapat memuat rekomendasi AI saat ini. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [
    goal,
    transactions,
    currentTotal,
    remainingTarget,
    progressPercent,
    currentMonthDeposits,
    averageMonthlyDeposit,
    estimatedRemainingMonths,
    status,
    selectedFocus,
  ]);

  // Initial fetch on mount
  useEffect(() => {
    fetchInsights();
  }, []);

  const handleSelectFocus = (focusVal: string) => {
    setSelectedFocus(focusVal);
    fetchInsights(focusVal);
  };

  return (
    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden transition-all">
      {/* HEADER SECTION - MORKAFIN NATURE DESIGN */}
      <div className="p-5 sm:p-6 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/60 via-white to-amber-50/40">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#15803D] to-[#14532D] text-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-[#133E2B] tracking-tight">
                MorkaFin Insights
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-[#15803D] border border-emerald-200">
                <Zap className="w-3 h-3 text-[#D97706]" />
                Powered by Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rekomendasi menabung bertema alam yang menenangkan, aman, dan membahagiakan sesuai pertumbuhan saldo tabungan Anda
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          {lastUpdated && !loading && (
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Pembaruan: {lastUpdated}
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchInsights()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#15803D] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition disabled:opacity-50"
            title="Muat ulang wawasan dari Gemini AI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Menganalisis...' : 'Perbarui AI'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle Section"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* FOCUS PRESETS BAR */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1 mr-1">
              <Compass className="w-3.5 h-3.5 text-[#15803D]" />
              Fokus Analisis:
            </span>
            {FOCUS_PRESETS.map((p) => {
              const active = selectedFocus === p.value;
              return (
                <button
                  key={p.label}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectFocus(p.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    active
                      ? 'bg-[#15803D] text-white border-[#15803D] shadow-sm'
                      : 'bg-emerald-50/40 text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* LOADING SKELETON */}
          {loading && !data && (
            <div className="space-y-4 py-4 animate-pulse">
              <div className="h-20 bg-slate-100 rounded-xl w-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-44 bg-slate-100 rounded-xl" />
                <div className="h-44 bg-slate-100 rounded-xl" />
                <div className="h-44 bg-slate-100 rounded-xl" />
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchInsights()}
                className="px-2.5 py-1 bg-white border border-rose-300 rounded-lg font-bold text-rose-700 hover:bg-rose-100"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* MAIN INSIGHTS CONTENT */}
          {data && (
            <div className="space-y-6">
              {/* TOP EVALUATION & HEALTH SCORE CARD */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Health Score & Status (4 cols) */}
                <div className="lg:col-span-4 bg-gradient-to-br from-emerald-50/60 to-amber-50/30 rounded-xl border border-emerald-200/80 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Skor Kesehatan Finansial
                      </span>
                      <Award className="w-4 h-4 text-[#D97706]" />
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-[#133E2B]">
                        {data.healthScore}
                      </span>
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </div>

                    <div className="w-full bg-emerald-100 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(10, data.healthScore))}%`,
                          backgroundColor:
                            data.healthScore >= 80 ? '#15803D' : data.healthScore >= 60 ? '#D97706' : '#E53E3E',
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-200/60">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      Status Pertumbuhan
                    </span>
                    <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-bold text-[#15803D] bg-emerald-100/70 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                      {data.statusEvaluation}
                    </span>
                  </div>
                </div>

                {/* AI Executive Summary & Recommended Action (8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-emerald-100/80 shadow-sm p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[#D97706]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#133E2B]">
                        Analisis Perencana Keuangan MorkaFin
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {data.summary}
                    </p>
                  </div>

                  {/* Highlight: Recommended action this week */}
                  <div className="mt-4 pt-3 border-t border-slate-100 bg-amber-50/70 border-l-4 border-l-[#D97706] rounded-r-lg p-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#D97706] block">
                      Tindakan Penyubur Tabungan Minggu Ini
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      {data.recommendedActionThisWeek}
                    </p>
                    {data.recommendedMonthlyDeposit && data.recommendedMonthlyDeposit > 0 && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Saran siraman setoran bulanan ideal:{' '}
                        <strong className="text-[#133E2B]">
                          {formatRupiah(data.recommendedMonthlyDeposit)}
                        </strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* STRENGTHS & AREAS TO IMPROVE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/50 rounded-xl border border-emerald-200/80 p-4">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    <span>Kekuatan Finansial Anda (Tumbuh Sehat)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {data.keyStrengths?.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#15803D] font-bold shrink-0">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas to improve */}
                <div className="bg-amber-50/50 rounded-xl border border-amber-200/80 p-4">
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-bold mb-2">
                    <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                    <span>Area yang Perlu Dijaga &amp; Ditingkatkan</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {data.areasToImprove?.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#D97706] font-bold shrink-0">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* PERSONALIZED SAVINGS TIPS CARDS */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#133E2B]">
                      Tips Menabung Personal &amp; Membahagiakan
                    </h3>
                    <p className="text-xs text-slate-500">
                      Diselaraskan agar proses menabung terasa menenangkan, tidak tertekan, dan terarah
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {data.tips?.length || 0} Rekomendasi
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.tips?.map((tip, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:border-emerald-200 transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#15803D] border border-emerald-100">
                            {tip.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              tip.impactLevel === 'Tinggi'
                                ? 'bg-amber-50 text-[#D97706] border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tip.impactLevel === 'Tinggi' ? '☀️ Dampak Tinggi' : 'Dampak Sedang'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-bold text-[#133E2B] leading-snug mb-2">
                          {tip.title}
                        </h4>

                        {/* Content */}
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {tip.content}
                        </p>
                      </div>

                      {/* Actionable Step */}
                      <div className="mt-4 pt-3 border-t border-slate-100 bg-emerald-50/40 rounded-lg p-2.5 border-l-2 border-l-[#15803D]">
                        <span className="text-[10px] font-bold uppercase text-[#15803D] block tracking-wide">
                          Langkah Praktis:
                        </span>
                        <p className="text-xs font-medium text-slate-700 mt-0.5">
                          {tip.actionableStep}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FOOTER CALLOUT */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Analisis dihitung secara aman menggunakan metodologi MorkaFin.com &amp; Gemini 3.8 Flash.
                </span>
                <span className="font-semibold text-emerald-800">
                  Target: {goal.name} ({formatPercentage(progressPercent / 100)})
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
