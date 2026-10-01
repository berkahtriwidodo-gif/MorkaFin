import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  ClipboardCopy, 
  Download,
  LogIn,
  LogOut
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SavingsGoal, Transaction } from '../types/savings';
import { createGoogleSheetSavingsTemplate, syncTransactionsToExistingSheet, CreatedSpreadsheetInfo } from '../services/googleSheets';
import { googleSignIn, logout } from '../services/auth';

interface GoogleSheetsIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  goal: SavingsGoal;
  transactions: Transaction[];
  savedSheetInfo: CreatedSpreadsheetInfo | null;
  setSavedSheetInfo: (info: CreatedSpreadsheetInfo | null) => void;
}

export const GoogleSheetsIntegrationModal: React.FC<GoogleSheetsIntegrationModalProps> = ({
  isOpen,
  onClose,
  user,
  setUser,
  goal,
  transactions,
  savedSheetInfo,
  setSavedSheetInfo,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [showConfirmSync, setShowConfirmSync] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
  };

  const handleCreateSheetConfirmed = async () => {
    setShowConfirmCreate(false);
    setLoading(true);
    setErrorMsg(null);

    try {
      const info = await createGoogleSheetSavingsTemplate(goal, transactions);
      setSavedSheetInfo(info);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSheetConfirmed = async () => {
    if (!savedSheetInfo) return;
    setShowConfirmSync(false);
    setLoading(true);
    setErrorMsg(null);

    try {
      await syncTransactionsToExistingSheet(savedSheetInfo.spreadsheetId, transactions);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui data Google Sheet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#15803D]">
              <FileSpreadsheet className="w-5 h-5 text-[#15803D]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#133E2B]">
                Integrasi Google Sheets MorkaFin
              </h2>
              <p className="text-xs text-slate-500">
                Ekspor &amp; sinkronkan template tabungan otomatis ke akun Google Drive Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-5 space-y-4 text-xs sm:text-sm">
          {!user ? (
            <div className="bg-emerald-50/40 rounded-2xl p-6 border border-emerald-100 text-center space-y-3">
              <p className="text-slate-600 text-xs leading-relaxed">
                Hubungkan akun Google Anda untuk membuat spreadsheet baru secara otomatis lengkap dengan formula dan 4 lembar kerja.
              </p>
              
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 px-6 py-2.5 bg-white border border-slate-300 rounded-full shadow-xs hover:bg-slate-50 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                  <span className="font-bold text-slate-700 text-xs sm:text-sm">
                    {loading ? 'Menghubungkan...' : 'Sign in with Google'}
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Hanya mengakses spreadsheet yang dibuat oleh aplikasi ini</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 rounded-full border border-emerald-200" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#15803D] text-white flex items-center justify-center font-bold text-xs">
                      {user.displayName?.substring(0, 1) || 'G'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-[#133E2B] text-xs sm:text-sm">{user.displayName || 'Akun Google Terhubung'}</p>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="text-xs text-rose-600 hover:underline font-bold px-2 py-1"
                >
                  Keluar
                </button>
              </div>

              {savedSheetInfo ? (
                <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-[#133E2B] text-xs sm:text-sm">{savedSheetInfo.title}</p>
                      <p className="text-[11px] text-emerald-800">Tersambung di Google Drive Anda</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/60">
                    <a
                      href={savedSheetInfo.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#15803D] hover:bg-[#14532D] text-white font-bold text-xs transition shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka di Google Sheets</span>
                    </a>

                    <button
                      onClick={() => setShowConfirmSync(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Kirim Transaksi Terbaru</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowConfirmCreate(true)}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#15803D] hover:bg-[#14532D] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                    <span>{loading ? 'Sedang Memproses...' : 'Buat Spreadsheet di Google Sheets Saya'}</span>
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Akan membuat otomatis 4 lembar kerja (Dashboard, Catatan Transaksi, Target Tabungan, Rekap Bulanan) beserta formula lengkap.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {showConfirmCreate && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="font-extrabold text-[#133E2B] text-base mb-2">Konfirmasi Pembuatan Spreadsheet</h3>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Aplikasi akan membuat spreadsheet baru berjudul <strong>&quot;MorkaFin - Template Tabungan - {goal.name}&quot;</strong> pada akun Google Drive Anda dengan izin Anda. Apakah Anda ingin melanjutkan?
              </p>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setShowConfirmCreate(false)}
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateSheetConfirmed}
                  className="px-5 py-2 rounded-full bg-[#15803D] text-white font-bold hover:bg-[#14532D] shadow-md shadow-emerald-700/20"
                >
                  Ya, Buat Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmSync && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="font-extrabold text-[#133E2B] text-base mb-2">Konfirmasi Pembaruan Data</h3>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Aplikasi akan memperbarui {transactions.length} baris transaksi pada sheet <strong>&quot;Catatan Transaksi&quot;</strong> di Google Sheets Anda. Apakah Anda ingin melanjutkan?
              </p>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setShowConfirmSync(false)}
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={handleSyncSheetConfirmed}
                  className="px-5 py-2 rounded-full bg-[#15803D] text-white font-bold hover:bg-[#14532D] shadow-md shadow-emerald-700/20"
                >
                  Perbarui Spreadsheet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
