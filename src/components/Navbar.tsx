import React from 'react';
import { 
  Search, 
  Plus, 
  ClipboardCopy, 
  Download, 
  RotateCcw, 
  ChevronDown,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { ActiveTab, SavingsGoal, Transaction } from '../types/savings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onCopySpreadsheet: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  onOpenSheetsModal?: () => void;
  currentBalance?: number;
  goal?: SavingsGoal;
  transactions?: Transaction[];
  lastSavedTime?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onCopySpreadsheet,
  onExportCSV,
  onResetData,
  onOpenSheetsModal,
  lastSavedTime,
}) => {
  const navTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard Portofolio' },
    { id: 'transactions' as ActiveTab, label: 'Catatan Kas & Mutasi' },
    { id: 'target' as ActiveTab, label: 'Target Finansial' },
    { id: 'recap' as ActiveTab, label: 'Rekap Bulanan' },
    { id: 'guide' as ActiveTab, label: 'Financial Tools (Rumus)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-emerald-100/60 shadow-xs">
      {/* 1. TOP UTILITY BAR (Nature & Wellbeing Philosophy) */}
      <div className="bg-emerald-50/50 border-b border-emerald-100/50 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center space-x-6 text-[11px] font-semibold text-[#133E2B]">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Ruang Tabungan Tenang &amp; Aman
            </span>
            <span className="hidden sm:inline text-emerald-300 font-normal">|</span>
            <span className="hidden sm:inline text-slate-500 font-normal">
              Tumbuhkan Aset Finansial Seperti Merawat Alam: Sabar, Teratur, Bahagia
            </span>
          </div>

          {/* Auto-Save & Nature Badges */}
          <div className="flex items-center space-x-3 text-emerald-700 text-xs font-medium">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/80 text-[#14532D] text-[10px] font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Auto-Save Aktif {lastSavedTime ? `• ${lastSavedTime}` : ''}
            </span>
            <span className="hidden md:inline text-emerald-200">|</span>
            <span className="hidden md:inline hover:text-emerald-900 cursor-pointer text-[11px]">🌿 Ekosistem MorkaFin</span>
            <span className="text-emerald-200">|</span>
            <span className="hover:text-[#D97706] cursor-pointer text-[11px] font-bold">✨ Bantuan &amp; Edukasi</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR: MORKAFIN.COM LOGO + NATURE GREEN THEME */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* MorkaFin.com Logo: Sprouting Leaf & Sunbeam Geometric Nature Icon + Wordmark */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            {/* Organic Geometric Leaf Emblem */}
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50/60 p-1.5 border border-emerald-200/60 shadow-2xs flex items-center justify-center">
              <svg viewBox="0 0 45 45" className="w-full h-full">
                {/* Sunlit golden beam */}
                <circle cx="34" cy="11" r="7" fill="#F59E0B" opacity="0.9" />
                {/* Stylized sprouting leaves */}
                <path d="M10,38 C14,24 24,14 38,12 C34,26 24,36 10,38 Z" fill="#15803D" />
                <path d="M10,38 C12,28 18,22 28,18 C24,28 18,34 10,38 Z" fill="#22C55E" opacity="0.85" />
                <path d="M8,39 C14,35 20,33 30,31" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div>
              <div className="flex items-baseline">
                <span className="text-2xl font-black tracking-tight text-[#15803D]">MorkaFin</span>
                <span className="text-sm font-bold text-[#D97706]">.com</span>
                <span className="text-[10px] text-emerald-600 font-semibold align-top ml-0.5">🌱</span>
              </div>
              <p className="text-[10px] text-emerald-800/80 font-medium tracking-wide">
                Nabung Aman, Nyaman &amp; Bahagia
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-700">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isTools = tab.id === 'guide';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`transition-colors py-1 flex items-center gap-1 ${
                    isActive
                      ? 'text-[#15803D] font-bold border-b-2 border-[#15803D]'
                      : isTools
                      ? 'text-[#15803D] font-semibold hover:text-[#14532D]'
                      : 'hover:text-[#15803D]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.id === 'target' && <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons (Nature & Amber Accents) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onCopySpreadsheet}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-emerald-50/50 hover:border-emerald-200 transition shadow-2xs"
              title="Salin Data Siap Paste di Google Sheets / Excel"
            >
              <ClipboardCopy className="w-3.5 h-3.5 text-[#15803D]" />
              <span className="hidden xl:inline">Salin Sheets</span>
            </button>

            <button
              onClick={onExportCSV}
              className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs"
              title="Unduh File CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>CSV</span>
            </button>

            <button
              onClick={onOpenSheetsModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-200 text-[#15803D] bg-emerald-50 hover:bg-emerald-100/70 transition"
              title="Integrasi Akun Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>

            {/* Primary Nature Emerald & Honey Gold Action Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#15803D] hover:bg-[#14532D] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3] text-amber-300" />
              <span>Catat Tabungan</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 space-x-2 border-t border-emerald-100/60 scrollbar-none">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[#15803D] text-white shadow-xs'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
