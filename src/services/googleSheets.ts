import { Transaction, SavingsGoal } from '../types/savings';
import { getAccessToken } from './auth';

export interface CreatedSpreadsheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

/**
 * Creates a complete Google Sheets spreadsheet with Dashboard, Catatan Transaksi,
 * Target Tabungan, and Rekap Bulanan sheets, including formulas and sample data.
 */
export const createGoogleSheetSavingsTemplate = async (
  goal: SavingsGoal,
  transactions: Transaction[]
): Promise<CreatedSpreadsheetInfo> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Autentikasi Google belum tersedia. Silakan klik Masuk dengan Google terlebih dahulu.');
  }

  const sheetTitle = `MorkaFin - Template Tabungan - ${goal.name} (${new Date().getFullYear()})`;

  // 1. Create Spreadsheet with 4 Sheets
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: sheetTitle,
        locale: 'id_ID',
      },
      sheets: [
        {
          properties: {
            sheetId: 0,
            title: 'Dashboard',
            gridProperties: { rowCount: 50, columnCount: 15 },
          },
        },
        {
          properties: {
            sheetId: 1,
            title: 'Catatan Transaksi',
            gridProperties: { frozenRowCount: 1, rowCount: 500, columnCount: 15 },
          },
        },
        {
          properties: {
            sheetId: 2,
            title: 'Target Tabungan',
            gridProperties: { frozenRowCount: 1, rowCount: 50, columnCount: 15 },
          },
        },
        {
          properties: {
            sheetId: 3,
            title: 'Rekap Bulanan',
            gridProperties: { frozenRowCount: 1, rowCount: 50, columnCount: 15 },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Gagal membuat Google Sheets baru.');
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl;

  // 2. Prepare Data for Each Sheet
  // Sheet 1: Dashboard
  const dashboardValues = [
    ['=== DASHBOARD KEUANGAN TABUNGAN ===', ''],
    ['Target Tabungan', `='Target Tabungan'!B2`],
    ['Total Tabungan Saat Ini', `=SUMIF('Catatan Transaksi'!D:D; "Setoran"; 'Catatan Transaksi'!F:F) - SUMIF('Catatan Transaksi'!D:D; "Penarikan"; 'Catatan Transaksi'!F:F)`],
    ['Sisa Target', `=MAX(0; B2 - B3)`],
    ['Persentase Pencapaian', `=IF(B2>0; B3/B2; 0)`],
    ['Total Setoran Bulan Ini', `=SUMIFS('Catatan Transaksi'!F:F; 'Catatan Transaksi'!D:D; "Setoran"; 'Catatan Transaksi'!B:B; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); 'Catatan Transaksi'!B:B; "<="&EOMONTH(TODAY();0))`],
    ['Rata-Rata Setoran / Bulan', `=AVERAGEIF('Rekap Bulanan'!C2:C13; ">0")`],
    ['Estimasi Waktu Tercapai (Bulan)', `=IF(B7>0; ROUNDUP(B4/B7; 0); "N/A")`],
    ['Status Progres', `=IF(B5>=1; "Target Tercapai"; IF(B5>=0.75; "Hampir Tercapai"; IF(B5>0; "Berjalan"; "Belum Mulai")))`],
    ['', ''],
    ['Ringkasan Kas Masuk & Keluar', ''],
    ['Total Akumulasi Setoran', `=SUMIF('Catatan Transaksi'!D:D; "Setoran"; 'Catatan Transaksi'!F:F)`],
    ['Total Akumulasi Penarikan', `=SUMIF('Catatan Transaksi'!D:D; "Penarikan"; 'Catatan Transaksi'!F:F)`],
    ['Selisih Bersih (Net Tabungan)', `=B12 - B13`],
  ];

  // Sheet 2: Catatan Transaksi
  const txHeader = [
    'No.',
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

  const txRows = transactions.map((t, idx) => {
    const row = idx + 2; // Data starts at row 2 (row 1 is header)
    const saldoSebelumFormula = idx === 0 ? '0' : `=H${row - 1}`;
    const saldoSesudahFormula = `=IF(D${row}="Setoran"; G${row}+F${row}; G${row}-F${row})`;
    return [
      t.no,
      t.date,
      t.description,
      t.type,
      t.source,
      t.amount,
      saldoSebelumFormula,
      saldoSesudahFormula,
      t.reference || '-',
      t.notes || '-',
    ];
  });

  // Sheet 3: Target Tabungan
  const targetValues = [
    ['Parameter', 'Nilai / Formula', 'Keterangan'],
    ['Nama Tujuan Tabungan', goal.name, 'Tujuan utama menabung'],
    ['Target Nominal', goal.targetAmount, 'Jumlah yang ingin dicapai'],
    ['Tanggal Mulai', goal.startDate, 'Awal mulai pencatatan'],
    ['Target Tanggal Selesai', goal.targetDate, 'Batas waktu pencapaian'],
    ['Jumlah Terkumpul', `=Dashboard!B3`, 'Otomatis tersambung dari saldo berjalan'],
    ['Sisa Nominal', `=MAX(0; B3-B6)`, 'Sisa dana yang harus dikumpulkan'],
    ['Target Setoran per Minggu', `=ROUNDUP(B7 / MAX(1; ROUND((DATEVALUE(B5)-TODAY())/7; 0)); 0)`, 'Kebutuhan mingguan'],
    ['Target Setoran per Bulan', `=ROUNDUP(B7 / MAX(1; ROUND((DATEVALUE(B5)-TODAY())/30; 0)); 0)`, 'Kebutuhan bulanan'],
    ['Persentase Pencapaian', `=IF(B3>0; B6/B3; 0)`, 'Format persentase %'],
  ];

  // Sheet 4: Rekap Bulanan
  const recapHeader = [
    'Bulan',
    'Target Setoran',
    'Total Setoran',
    'Total Penarikan',
    'Selisih',
    'Saldo Akhir',
    'Persentase Pencapaian',
  ];

  const currentYear = new Date().getFullYear();
  const monthsIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const recapRows = monthsIndo.map((mName, mIdx) => {
    const row = mIdx + 2;
    const mNum = mIdx + 1;
    return [
      `${mName} ${currentYear}`,
      goal.monthlyDepositTarget || 2500000,
      `=SUMIFS('Catatan Transaksi'!$F:$F; 'Catatan Transaksi'!$D:$D; "Setoran"; 'Catatan Transaksi'!$B:$B; ">="&DATE(${currentYear};${mNum};1); 'Catatan Transaksi'!$B:$B; "<="&EOMONTH(DATE(${currentYear};${mNum};1);0))`,
      `=SUMIFS('Catatan Transaksi'!$F:$F; 'Catatan Transaksi'!$D:$D; "Penarikan"; 'Catatan Transaksi'!$B:$B; ">="&DATE(${currentYear};${mNum};1); 'Catatan Transaksi'!$B:$B; "<="&EOMONTH(DATE(${currentYear};${mNum};1);0))`,
      `=C${row} - D${row}`,
      `=SUMIF('Catatan Transaksi'!$B:$B; "<="&EOMONTH(DATE(${currentYear};${mNum};1);0); 'Catatan Transaksi'!$F:$F) - SUMIFS('Catatan Transaksi'!$F:$F; 'Catatan Transaksi'!$D:$D; "Penarikan"; 'Catatan Transaksi'!$B:$B; "<="&EOMONTH(DATE(${currentYear};${mNum};1);0)) * 2`, // Or sequential balance
      `=IF(B${row}>0; C${row}/B${row}; 0)`,
    ];
  });

  // 3. Batch Update Values with USER_ENTERED so formulas evaluate
  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: 'Dashboard!A1:B14',
          values: dashboardValues,
        },
        {
          range: `Catatan Transaksi!A1:J${txRows.length + 1}`,
          values: [txHeader, ...txRows],
        },
        {
          range: 'Target Tabungan!A1:C10',
          values: targetValues,
        },
        {
          range: `Rekap Bulanan!A1:G${recapRows.length + 1}`,
          values: [recapHeader, ...recapRows],
        },
      ],
    }),
  });

  if (!updateRes.ok) {
    console.warn('Batch update values warning:', await updateRes.text());
  }

  // 4. Beautify with batchUpdate formatting (Headers, colors, freeze rows, column widths)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Format Catatan Transaksi Header Row
          {
            repeatCell: {
              range: { sheetId: 1, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 10 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.02, green: 0.49, blue: 0.25 }, // Emerald green #059669
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          // Format Rekap Bulanan Header Row
          {
            repeatCell: {
              range: { sheetId: 3, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 7 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.1, green: 0.2, blue: 0.35 }, // Slate Navy
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          // Set Column Widths for readability
          {
            updateDimensionProperties: {
              range: { sheetId: 1, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 }, // Keterangan
              properties: { pixelSize: 220 },
              fields: 'pixelSize',
            },
          },
        ],
      }),
    });
  } catch (fmtErr) {
    console.warn('Styling batchUpdate notice:', fmtErr);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: sheetTitle,
  };
};

/**
 * Appends or updates latest transactions into the user's existing Google Sheet
 */
export const syncTransactionsToExistingSheet = async (
  spreadsheetId: string,
  transactions: Transaction[]
): Promise<void> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Autentikasi Google belum aktif');

  const txHeader = [
    'No.',
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

  const txRows = transactions.map((t, idx) => {
    const row = idx + 2;
    const saldoSebelumFormula = idx === 0 ? '0' : `=H${row - 1}`;
    const saldoSesudahFormula = `=IF(D${row}="Setoran"; G${row}+F${row}; G${row}-F${row})`;
    return [
      t.no,
      t.date,
      t.description,
      t.type,
      t.source,
      t.amount,
      saldoSebelumFormula,
      saldoSesudahFormula,
      t.reference || '-',
      t.notes || '-',
    ];
  });

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Catatan Transaksi'!A1:J${txRows.length + 1}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `'Catatan Transaksi'!A1:J${txRows.length + 1}`,
      values: [txHeader, ...txRows],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal menyinkronkan data ke Google Sheet');
  }
};
