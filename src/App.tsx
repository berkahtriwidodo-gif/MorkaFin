import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Copy,
  Download
} from 'lucide-react';
import { Transaction, SavingsGoal, SavingsCategory, ActiveTab } from './types/savings';
import { initialTransactions, initialGoal, initialCategories, DEFAULT_FUND_SOURCES } from './data/initialData';
import { recalculateTransactions, exportTransactionsToCSV, generateSpreadsheetPasteData } from './utils/formatters';
import { initAuth } from './services/auth';
import { CreatedSpreadsheetInfo } from './services/googleSheets';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransactionsTable } from './components/TransactionsTable';
import { TargetPlanner } from './components/TargetPlanner';
import { MonthlyRecap } from './components/MonthlyRecap';
import { FormulaGuide } from './components/FormulaGuide';
import { TransactionModal } from './components/TransactionModal';
import { GoogleSheetsIntegrationModal } from './components/GoogleSheetsIntegrationModal';

const STORAGE_KEYS = {
  TRANSACTIONS: 'morkafin_transactions_v2',
  GOAL: 'morkafin_goal_v2',
  CATEGORIES: 'morkafin_categories_v2',
  FUND_SOURCES: 'morkafin_fund_sources_v2',
  LAST_SAVED: 'morkafin_last_saved_time',
};

const getInitialTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return recalculateTransactions(parsed);
      }
    }
  } catch (err) {
    console.warn('Could not read transactions from storage, using defaults:', err);
  }
  return initialTransactions;
};

const getInitialGoal = (): SavingsGoal => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GOAL);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed.targetAmount === 'number') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read goal from storage, using defaults:', err);
  }
  return initialGoal;
};

const getInitialCategories = (): SavingsCategory[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read categories from storage, using defaults:', err);
  }
  return initialCategories;
};

const getInitialFundSources = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FUND_SOURCES);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read fund sources from storage, using defaults:', err);
  }
  return DEFAULT_FUND_SOURCES;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialTransactions);
  const [goal, setGoal] = useState<SavingsGoal>(getInitialGoal);
  const [categories, setCategories] = useState<SavingsCategory[]>(getInitialCategories);
  const [fundSources, setFundSources] = useState<string[]>(getInitialFundSources);
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SAVED) || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  // Auth & Workspace State
  const [user, setUser] = useState<User | null>(null);
  const [savedSheetInfo, setSavedSheetInfo] = useState<CreatedSpreadsheetInfo | null>(null);

  // Modals & Notifications
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-Save Effect: Transactions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, nowTime);
      setLastSavedTime(nowTime);
    } catch (err) {
      console.warn('Failed to auto-save transactions to localStorage', err);
    }
  }, [transactions]);

  // Auto-Save Effect: Goal
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(goal));
    } catch (err) {
      console.warn('Failed to auto-save goal to localStorage', err);
    }
  }, [goal]);

  // Auto-Save Effect: Fund Sources
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FUND_SOURCES, JSON.stringify(fundSources));
    } catch (err) {
      console.warn('Failed to auto-save fund sources to localStorage', err);
    }
  }, [fundSources]);

  // Auto-Save Effect: Categories
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (err) {
      console.warn('Failed to auto-save categories to localStorage', err);
    }
  }, [categories]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser) => {
        setUser(authenticatedUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const handleSaveTransaction = (
    txData: {
      id?: string;
      date: string;
      description: string;
      type: 'Setoran' | 'Penarikan';
      source: string;
      category?: string;
      amount: number;
      reference: string;
      notes: string;
    },
    isAutoSaved: boolean = false
  ) => {
    if (txData.source && !fundSources.includes(txData.source)) {
      setFundSources(prev => [...prev, txData.source]);
    }

    let updatedList: Transaction[];
    if (txData.id) {
      updatedList = transactions.map(t => {
        if (t.id === txData.id) {
          return {
            ...t,
            ...txData,
            category: txData.category || t.category || 'Darurat',
          };
        }
        return t;
      });
    } else {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        no: transactions.length + 1,
        date: txData.date,
        description: txData.description,
        type: txData.type,
        source: txData.source,
        category: txData.category || 'Darurat',
        amount: txData.amount,
        balanceBefore: 0,
        balanceAfter: 0,
        reference: txData.reference,
        notes: txData.notes,
      };
      updatedList = [...transactions, newTx];
    }

    const recalculated = recalculateTransactions(updatedList);
    const newBalance = recalculated.length > 0 ? recalculated[recalculated.length - 1].balanceAfter : 0;
    const oldBalance = transactions.length > 0 ? transactions[transactions.length - 1].balanceAfter : 0;
    
    const oldPct = goal.targetAmount > 0 ? (oldBalance / goal.targetAmount) * 100 : 0;
    const newPct = goal.targetAmount > 0 ? (newBalance / goal.targetAmount) * 100 : 0;

    // Check milestone crossover
    if (newPct >= 100 && oldPct < 100) {
      showToast('🎉 LUAR BIASA! Target Tabungan 100% Tercapai Sempurna!');
    } else if (newPct >= 75 && oldPct < 75) {
      showToast('🎉 Hebat Sekali! Kamu berhasil menembus 75% target tabungan!');
    } else if (newPct >= 50 && oldPct < 50) {
      showToast('🎉 Mantap! Separuh jalan (50%) target tabungan telah tercapai!');
    } else if (newPct >= 25 && oldPct < 25) {
      showToast('🎉 Keren! Langkah awal 25% target tabungan berhasil dikumpulkan!');
    } else if (isAutoSaved) {
      showToast('⚡ Auto-Save Berhasil: Transaksi otomatis tersimpan & tersinkronisasi ke Kas Utama!');
    } else if (txData.id) {
      showToast('✓ Transaksi diperbarui & saldo langsung dikalkulasi ulang.');
    } else {
      showToast('✓ Transaksi baru berhasil dicatat & disinkronkan ke Kas Utama.');
    }

    setTransactions(recalculated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(recalculateTransactions(updated));
    showToast('Transaksi dihapus. Saldo berjalan telah dikalkulasi ulang.');
  };

  const handleCopySpreadsheet = () => {
    const tsvData = generateSpreadsheetPasteData(transactions, goal.name, goal.targetAmount);
    navigator.clipboard.writeText(tsvData);
    showToast('Data berhasil disalin! Buka Google Sheets atau Excel, lalu tekan Ctrl+V.');
  };

  const handleExportCSV = () => {
    const csvContent = exportTransactionsToCSV(transactions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Tabungan_MorkaFin_${goal.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh.');
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.GOAL);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.FUND_SOURCES);
    setTransactions(initialTransactions);
    setGoal(initialGoal);
    setCategories(initialCategories);
    setFundSources(DEFAULT_FUND_SOURCES);
    showToast('Data berhasil di-reset ke template contoh awal.');
  };

  const currentBalance = transactions.length > 0 
    ? transactions[transactions.length - 1].balanceAfter 
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FCF8] text-slate-800 flex flex-col font-sans selection:bg-[#15803D] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#133E2B] text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar in MorkaFin Nature Growth Style */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onCopySpreadsheet={handleCopySpreadsheet}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        currentBalance={currentBalance}
        goal={goal}
        transactions={transactions}
        lastSavedTime={lastSavedTime}
      />

      {/* Google Sheets Sync Notification Strip (MorkaFin Nature Green Style) */}
      <div className="bg-[#F0FDF4] text-[#133E2B] py-2 px-4 text-xs font-semibold border-b border-emerald-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-white shadow-2xs text-[#15803D]">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] sm:text-xs">
              {savedSheetInfo ? (
                <>Tersinkronisasi otomatis dengan Google Sheets: <strong>{savedSheetInfo.title}</strong></>
              ) : (
                <>Ingin membuka dan mengedit template lengkap ini langsung di Google Sheets milik Anda?</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {savedSheetInfo ? (
              <a
                href={savedSheetInfo.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#15803D] underline hover:text-[#14532D] flex items-center gap-1 font-bold"
              >
                Buka di Google Sheets <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className="px-3 py-1 rounded-full bg-[#15803D] hover:bg-[#14532D] text-white font-bold text-[11px] transition shadow-xs"
              >
                Hubungkan Google Sheets
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            goal={goal}
            transactions={transactions}
            categories={categories}
            onUpdateCategories={setCategories}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTable
            transactions={transactions}
            categories={categories}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsAddModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            fundSources={fundSources}
          />
        )}

        {activeTab === 'target' && (
          <TargetPlanner
            goal={goal}
            onUpdateGoal={(newGoal) => {
              setGoal(newGoal);
              showToast('Target tabungan berhasil diperbarui.');
            }}
            transactions={transactions}
          />
        )}

        {activeTab === 'recap' && (
          <MonthlyRecap
            transactions={transactions}
            goal={goal}
          />
        )}

        {activeTab === 'guide' && (
          <FormulaGuide />
        )}
      </main>

      {/* Footer in MorkaFin Nature Growth Style */}
      <footer className="bg-white border-t border-emerald-100 mt-12 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center md:justify-start gap-1">
              <span className="text-xl font-black text-[#15803D]">MorkaFin</span>
              <span className="text-sm font-bold text-[#D97706]">.com</span>
              <span className="text-[10px] text-emerald-600 font-semibold align-top ml-0.5">🌱</span>
              <span className="text-xs text-emerald-800/80 ml-2 font-medium">| Nabung Aman, Nyaman &amp; Bahagia</span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-lg">
              Solusi pencatatan tabungan cerdas bertema alam hijau, perencanaan target finansial, dan buku kas transparan yang kompatibel dengan Google Sheets &amp; Microsoft Excel.
            </p>
          </div>

          <div className="flex items-center gap-5 text-slate-600 font-semibold text-xs flex-wrap justify-center">
            <button onClick={() => setActiveTab('guide')} className="hover:text-[#15803D] transition">
              Financial Tools Rumus
            </button>
            <span className="text-emerald-200">•</span>
            <button onClick={handleCopySpreadsheet} className="hover:text-[#15803D] transition">
              Salin Format Sheets
            </button>
            <span className="text-emerald-200">•</span>
            <button onClick={handleExportCSV} className="hover:text-[#15803D] transition">
              Unduh CSV
            </button>
            <span className="text-emerald-200">•</span>
            <button onClick={() => setIsSheetsModalOpen(true)} className="text-[#15803D] hover:text-[#14532D] font-bold">
              Integrasi Google Sheets
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        currentBalance={currentBalance}
        availableSources={fundSources}
        categories={categories}
      />

      <GoogleSheetsIntegrationModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        user={user}
        setUser={setUser}
        goal={goal}
        transactions={transactions}
        savedSheetInfo={savedSheetInfo}
        setSavedSheetInfo={setSavedSheetInfo}
      />
    </div>
  );
}
