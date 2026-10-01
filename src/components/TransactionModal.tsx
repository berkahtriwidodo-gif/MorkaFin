import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info, 
  PiggyBank, 
  ShieldCheck, 
  Save, 
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  Tags
} from 'lucide-react';
import { Transaction, TransactionType, SavingsCategory } from '../types/savings';
import { formatRupiah } from '../utils/formatters';

const DRAFT_STORAGE_KEY = 'morkafin_transaction_modal_draft';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: {
    id?: string;
    date: string;
    description: string;
    type: TransactionType;
    source: string;
    category?: string;
    amount: number;
    reference: string;
    notes: string;
  }, isAutoSaved?: boolean) => void;
  editingTransaction?: Transaction | null;
  currentBalance: number;
  availableSources: string[];
  categories?: SavingsCategory[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  currentBalance,
  availableSources,
  categories = [],
}) => {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('Setoran');
  const [source, setSource] = useState('Gaji Pokok');
  const [category, setCategory] = useState('Darurat');
  const [amountStr, setAmountStr] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [customSource, setCustomSource] = useState('');
  const [isCustomSource, setIsCustomSource] = useState(false);

  // Auto-Save System State
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastDraftTime, setLastDraftTime] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Populate or Restore Draft on Open
  useEffect(() => {
    if (!isOpen) return;

    if (editingTransaction) {
      // Editing existing transaction
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description);
      setType(editingTransaction.type);
      setCategory(editingTransaction.category || 'Darurat');
      if (availableSources.includes(editingTransaction.source)) {
        setSource(editingTransaction.source);
        setIsCustomSource(false);
      } else {
        setIsCustomSource(true);
        setCustomSource(editingTransaction.source);
      }
      setAmountStr(editingTransaction.amount.toString());
      setReference(editingTransaction.reference || '');
      setNotes(editingTransaction.notes || '');
      setHasRestoredDraft(false);
    } else {
      // Creating new transaction: check if draft exists in localStorage
      try {
        const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (rawDraft) {
          const draft = JSON.parse(rawDraft);
          if (draft && (draft.description || draft.amountStr || draft.notes || draft.category)) {
            setDate(draft.date || new Date().toISOString().split('T')[0]);
            setDescription(draft.description || '');
            setType(draft.type || 'Setoran');
            setSource(draft.source || availableSources[0] || 'Gaji Pokok');
            setCategory(draft.category || 'Darurat');
            setAmountStr(draft.amountStr || '');
            setReference(draft.reference || '');
            setNotes(draft.notes || '');
            if (draft.isCustomSource) {
              setIsCustomSource(true);
              setCustomSource(draft.customSource || '');
            }
            setLastDraftTime(draft.savedAt || new Date().toLocaleTimeString('id-ID'));
            setHasRestoredDraft(true);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to parse transaction draft:', err);
      }

      // Default fresh state
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setDescription('');
      setType('Setoran');
      setSource(availableSources[0] || 'Gaji Pokok');
      setCategory(categories[0]?.name || 'Darurat');
      setIsCustomSource(false);
      setCustomSource('');
      setAmountStr('');
      setReference('');
      setNotes('');
      setHasRestoredDraft(false);
      setLastDraftTime(null);
    }
  }, [editingTransaction, isOpen, availableSources, categories]);

  // Real-time Auto-Save Draft to LocalStorage whenever user changes any field
  useEffect(() => {
    if (!isOpen || editingTransaction) return;

    const hasContent = description.trim() !== '' || amountStr.trim() !== '' || reference.trim() !== '' || notes.trim() !== '';
    if (!hasContent) return;

    const timeout = setTimeout(() => {
      try {
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
          date,
          description,
          type,
          source,
          category,
          amountStr,
          reference,
          notes,
          isCustomSource,
          customSource,
          savedAt: timeNow,
        }));
        setLastDraftTime(timeNow);
      } catch (err) {
        console.warn('Failed to save draft:', err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [date, description, type, source, category, amountStr, reference, notes, customSource, isCustomSource, isOpen, editingTransaction]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amountStr) || 0;
  const isFormComplete = description.trim().length > 0 && numAmount > 0;

  const projectedBalance = editingTransaction
    ? currentBalance
    : type === 'Setoran'
    ? currentBalance + numAmount
    : currentBalance - numAmount;

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setDescription('');
    setType('Setoran');
    setSource(availableSources[0] || 'Gaji Pokok');
    setCategory(categories[0]?.name || 'Darurat');
    setIsCustomSource(false);
    setCustomSource('');
    setAmountStr('');
    setReference('');
    setNotes('');
    setHasRestoredDraft(false);
    setLastDraftTime(null);
  };

  const commitTransaction = (isAutoSaved = false) => {
    if (!description.trim() || numAmount <= 0) return;

    const finalSource = isCustomSource && customSource.trim() ? customSource.trim() : source;

    setIsSavedFeedback(true);

    onSave({
      id: editingTransaction ? editingTransaction.id : undefined,
      date,
      description: description.trim(),
      type,
      source: finalSource,
      category,
      amount: numAmount,
      reference: reference.trim(),
      notes: notes.trim(),
    }, isAutoSaved);

    // Clean up draft since transaction is now committed to main state
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }

    setHasRestoredDraft(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commitTransaction(false);
  };

  const handleModalClose = () => {
    if (autoSaveEnabled && isFormComplete && !editingTransaction) {
      commitTransaction(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Section */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center font-bold">
              <PiggyBank className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-[#133E2B]">
                  {editingTransaction ? 'Edit Transaksi Kas' : 'Catat Setoran Tabungan'}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#15803D] border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Auto-Save Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pencatatan kas otomatis dengan alokasi kategori (Darurat, Liburan, Pendidikan)
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Auto-Save Status Bar */}
        <div className="mt-3.5 px-3 py-2 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-[#133E2B] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
            <span>
              {isFormComplete ? (
                <strong className="text-[#15803D]">Data Lengkap: Langsung tersinkronisasi ke Kas Utama</strong>
              ) : lastDraftTime ? (
                <>Draf tersimpan otomatis pk. {lastDraftTime}</>
              ) : (
                <>Sistem Auto-Save memproteksi input agar data tidak hilang</>
              )}
            </span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer shrink-0 text-slate-600 font-semibold text-[11px]">
            <input 
              type="checkbox" 
              checked={autoSaveEnabled} 
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="accent-[#15803D] rounded cursor-pointer"
            />
            <span className="hidden sm:inline">Auto-Sync</span>
          </label>
        </div>

        {/* Restored Draft Banner if recovered */}
        {hasRestoredDraft && !editingTransaction && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-900 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span>Draf pengisian sebelumnya dipulihkan otomatis agar data Anda tidak hilang.</span>
            </div>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="text-[11px] font-bold text-rose-600 hover:underline shrink-0"
            >
              Reset Draf
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs sm:text-sm">
          {/* Transaction Type Radio Selector */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 text-xs">
              Jenis Transaksi <span className="text-[#D97706]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('Setoran')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs sm:text-sm font-bold transition ${
                  type === 'Setoran'
                    ? 'bg-emerald-50 text-emerald-800 border-[#15803D] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className={`w-4 h-4 ${type === 'Setoran' ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>Setoran (Masuk)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('Penarikan')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs sm:text-sm font-bold transition ${
                  type === 'Penarikan'
                    ? 'bg-rose-50 text-rose-800 border-rose-500 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className={`w-4 h-4 ${type === 'Penarikan' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>Penarikan (Keluar)</span>
              </button>
            </div>
          </div>

          {/* Savings Category Allocation Selector */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tags className="w-3.5 h-3.5 text-[#15803D]" />
                Alokasi Pos Kategori Tabungan <span className="text-[#D97706]">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Pilih pos sasaran</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Darurat', 'Liburan', 'Pendidikan'].map((catName) => {
                const isSelected = category === catName;
                const emoji = catName === 'Darurat' ? '🛡️' : catName === 'Liburan' ? '✈️' : '🎓';
                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => setCategory(catName)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-50 text-[#15803D] border-[#15803D] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{catName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">
                Tanggal Transaksi <span className="text-[#D97706]">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#15803D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">
                Nominal (Rp) <span className="text-[#D97706]">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                required
                placeholder="Contoh: 2500000"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#15803D] focus:outline-none font-bold text-[#133E2B]"
              />
              {numAmount > 0 && (
                <span className="block text-[11px] text-[#15803D] mt-1 font-bold">
                  Terbaca: {formatRupiah(numAmount)}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs">
              Keterangan Transaksi <span className="text-[#D97706]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Setoran Alokasi Dana Darurat Awal Bulan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#15803D] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs">
              Sumber Dana / Pos Pemasukan
            </label>
            <div className="space-y-2">
              <select
                value={isCustomSource ? '__CUSTOM__' : source}
                onChange={(e) => {
                  if (e.target.value === '__CUSTOM__') {
                    setIsCustomSource(true);
                  } else {
                    setIsCustomSource(false);
                    setSource(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#15803D] focus:outline-none bg-white text-xs"
              >
                {availableSources.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="__CUSTOM__">+ Buat Sumber Dana Baru...</option>
              </select>

              {isCustomSource && (
                <input
                  type="text"
                  placeholder="Ketik nama sumber dana kustom..."
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/40 focus:ring-2 focus:ring-[#15803D]"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">
                Bukti / No. Referensi
              </label>
              <input
                type="text"
                placeholder="Contoh: TRX-BCA-9812"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#15803D] font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">
                Catatan Tambahan
              </label>
              <input
                type="text"
                placeholder="Contoh: Tabungan rutin autodebet"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#15803D]"
              />
            </div>
          </div>

          {/* Real-time Balance Projection */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 text-xs">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span>Saldo Kas Keseluruhan:</span>
              <span className="font-bold text-slate-800">{formatRupiah(currentBalance)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span>Alokasi Kategori [{category}]:</span>
              <span className={`font-bold ${type === 'Setoran' ? 'text-emerald-700' : 'text-rose-600'}`}>
                {type === 'Setoran' ? '+' : '-'}{formatRupiah(numAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-emerald-200/80 font-bold text-slate-900 text-sm">
              <span>Saldo Kas Sesudah:</span>
              <span className="text-[#15803D] font-black">{formatRupiah(projectedBalance)}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-Save langsung sinkron</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition"
              >
                {isFormComplete && autoSaveEnabled ? 'Simpan & Tutup' : 'Batal'}
              </button>

              <button
                type="submit"
                disabled={!isFormComplete}
                className="px-6 py-2.5 rounded-full bg-[#15803D] hover:bg-[#14532D] disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{editingTransaction ? 'Simpan Perubahan' : 'Catat & Sinkronkan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
