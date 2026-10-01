import { Transaction, MonthlyRecapData } from '../types/savings';

export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const formatDateIndonesian = (dateStr: string): string => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const getMonthName = (monthIndex: number, year?: number): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const name = months[monthIndex] || '';
  return year ? `${name} ${year}` : name;
};

/**
 * Recomputes running balances for all transactions sequentially.
 * This guarantees 100% auditability and transparency.
 */
export const recalculateTransactions = (transactions: Transaction[]): Transaction[] => {
  // Sort by date ascending, keeping stable order
  const sorted = [...transactions].sort((a, b) => {
    if (a.date === b.date) {
      return a.no - b.no;
    }
    return a.date.localeCompare(b.date);
  });

  let runningBalance = 0;
  return sorted.map((tx, idx) => {
    const balanceBefore = runningBalance;
    const impact = tx.type === 'Setoran' ? tx.amount : -tx.amount;
    runningBalance += impact;
    return {
      ...tx,
      no: idx + 1,
      balanceBefore,
      balanceAfter: runningBalance,
    };
  });
};

/**
 * Computes monthly recaps from transactions and monthly target
 */
export const computeMonthlyRecaps = (
  transactions: Transaction[],
  defaultTargetMonthly: number,
  selectedYear: number
): MonthlyRecapData[] => {
  const recaps: MonthlyRecapData[] = [];
  
  // Sort transactions chronologically
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  // Determine running balance state up to end of each month
  for (let m = 0; m < 12; m++) {
    const monthPad = String(m + 1).padStart(2, '0');
    const monthKey = `${selectedYear}-${monthPad}`;
    const monthName = getMonthName(m, selectedYear);

    // Filter transactions for this month
    const monthTxs = sorted.filter(tx => tx.date.startsWith(monthKey));

    const totalDeposit = monthTxs
      .filter(tx => tx.type === 'Setoran')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalWithdrawal = monthTxs
      .filter(tx => tx.type === 'Penarikan')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const netDiff = totalDeposit - totalWithdrawal;

    // Find latest transaction on or before end of this month
    // Find the last day of this month
    const endOfMonthDate = `${selectedYear}-${monthPad}-31`;
    const pastAndCurrentTxs = sorted.filter(tx => tx.date <= endOfMonthDate);
    const closingBalance = pastAndCurrentTxs.length > 0 
      ? pastAndCurrentTxs[pastAndCurrentTxs.length - 1].balanceAfter 
      : 0;

    const targetDeposit = defaultTargetMonthly;
    const achievementPercentage = targetDeposit > 0 ? (totalDeposit / targetDeposit) : 0;

    recaps.push({
      monthKey,
      monthName,
      year: selectedYear,
      monthIndex: m,
      targetDeposit,
      totalDeposit,
      totalWithdrawal,
      netDiff,
      closingBalance,
      achievementPercentage,
    });
  }

  return recaps;
};

/**
 * Export transactions to CSV format with Indonesian delimiters or standard
 */
export const exportTransactionsToCSV = (transactions: Transaction[]): string => {
  const headers = [
    'No',
    'Tanggal',
    'Keterangan',
    'Jenis Transaksi',
    'Sumber Dana',
    'Nominal',
    'Saldo Sebelum',
    'Saldo Sesudah',
    'Bukti/Referensi',
    'Catatan',
  ];

  const rows = transactions.map(tx => [
    tx.no,
    `"${tx.date}"`,
    `"${tx.description.replace(/"/g, '""')}"`,
    `"${tx.type}"`,
    `"${tx.source.replace(/"/g, '""')}"`,
    tx.amount,
    tx.balanceBefore,
    tx.balanceAfter,
    `"${(tx.reference || '').replace(/"/g, '""')}"`,
    `"${(tx.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

/**
 * Generates TSV text ready to be pasted directly into Google Sheets or Excel with formulas!
 */
export const generateSpreadsheetPasteData = (
  transactions: Transaction[],
  goalName: string,
  targetAmount: number
): string => {
  const lines: string[] = [];

  // Goal Header block
  lines.push(`TARGET TABUNGAN: ${goalName}\tTarget Nominal:\t${targetAmount}`);
  lines.push('');
  
  // Table Header
  lines.push('No.\tTanggal\tKeterangan\tJenis Transaksi\tSumber Dana\tNominal\tSaldo Sebelum\tSaldo Sesudah\tBukti / Referensi\tCatatan');

  // Rows with exact formula representation
  transactions.forEach((tx, i) => {
    const rowNum = i + 4; // Accounting for headers
    // In sheets, Saldo Sebelum is previous row's Saldo Sesudah, Saldo Sesudah is =IF(D...="Setoran", G...+F..., G...-F...)
    lines.push([
      tx.no,
      tx.date,
      tx.description,
      tx.type,
      tx.source,
      tx.amount,
      i === 0 ? '0' : `=H${rowNum - 1}`,
      `=IF(D${rowNum}="Setoran", G${rowNum}+F${rowNum}, G${rowNum}-F${rowNum})`,
      tx.reference || '-',
      tx.notes || '-',
    ].join('\t'));
  });

  return lines.join('\n');
};
