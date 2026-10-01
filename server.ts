import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// Initialize GoogleGenAI server-side with telemetry header as required by guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Fallback insights generator if API key is missing or call encounters an error
function generateFallbackInsights(goal: any, progress: any) {
  const currentTotal = progress?.currentTotal || 0;
  const targetAmount = goal?.targetAmount || 10000000;
  const progressPercent = targetAmount > 0 ? (currentTotal / targetAmount) * 100 : 0;
  const remaining = Math.max(0, targetAmount - currentTotal);
  const avgDeposit = progress?.averageMonthlyDeposit || 1000000;

  return {
    summary: `Anda telah mengumpulkan Rp ${currentTotal.toLocaleString('id-ID')} (${progressPercent.toFixed(1)}%) dari target "${goal?.name || 'Tabungan'}". Pola menabung Anda menunjukkan pertumbuhan yang subur dan menyejukkan dengan rata-rata setoran Rp ${avgDeposit.toLocaleString('id-ID')} per bulan.`,
    statusEvaluation: progressPercent >= 75 ? 'Pohon Tabungan Rimbun & Siap Panen' : progressPercent >= 50 ? 'Separuh Jalan Bertumbuh Sehat' : 'Tunas Finansial Sedang Bersemi',
    healthScore: Math.min(95, Math.max(65, Math.round(50 + progressPercent * 0.4))),
    keyStrengths: [
      'Pencatatan mutasi tabungan berjalan rapi, transparan, dan teratur.',
      'Aliran setoran rutin bulanan menjaga momentum pertumbuhan dana tetap hijau dan tenang.',
    ],
    areasToImprove: [
      'Otomatisasi pemupukan tabungan di awal bulan agar dana tumbuh aman tanpa terganggu kebutuhan konsumtif spontan.',
    ],
    tips: [
      {
        category: 'Prinsip Tunas Hijau MorkaFin',
        title: 'Alokasikan 20% Penghasilan di Awal (Sirami Tabungan Dulu)',
        content: 'Sisihkan nominal tabungan segera di hari gajian seperti menyiram benih tanaman di pagi hari. Menabung di awal memberi rasa aman, nyaman, dan hati yang tenang sepanjang bulan.',
        actionableStep: 'Jadwalkan auto-debet atau transfer langsung ke rekening tabungan target tepat di tanggal penerimaan gaji.',
        impactLevel: 'Tinggi',
      },
      {
        category: 'Akselerasi Panen',
        title: 'Manfaatkan Panen Ekstra (Windfall Income)',
        content: `Sisa target Anda saat ini Rp ${remaining.toLocaleString('id-ID')}. Jika ada bonus, THR, atau penghasilan sampingan, alokasikan minimal 50% untuk mempercepat masa panen finansial Anda.`,
        actionableStep: 'Buat pos khusus dana sampingan yang langsung dialokasikan ke rekening tabungan target.',
        impactLevel: 'Tinggi',
      },
      {
        category: 'Suaka Kas Aman',
        title: 'Pisahkan Rekening Operasional dengan Rekening Tabungan',
        content: 'Menyimpan dana tabungan terpisah dari rekening belanja harian ibarat menjaga mata air tetap jernih dan terlindungi dari godaan penarikan spontan.',
        actionableStep: 'Gunakan rekening bank digital khusus tabungan dengan imbal hasil wajar yang terpisah dari e-wallet harian.',
        impactLevel: 'Sedang',
      },
    ],
    recommendedActionThisWeek: 'Evaluasi pengeluaran langganan digital yang tidak terpakai dan alihkan biayanya sebesar Rp 50.000 - Rp 150.000 sebagai setoran penyubur tabungan minggu ini.',
    recommendedMonthlyDeposit: avgDeposit > 0 ? avgDeposit : 1500000,
  };
}

// Server-side endpoint for Gemini AI Financial Insights
app.post('/api/ai/financial-insights', async (req, res) => {
  const { goal, progress, recentTransactions, sourcesDistribution, monthlyRecap, focusArea } = req.body;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured, providing rule-based financial insights.');
    return res.json(generateFallbackInsights(goal, progress));
  }

  try {
    const prompt = `Anda adalah Perencana Keuangan Ahli dari MorkaFin.com dengan filosofi perencanaan keuangan bertema Alam (Nature & Green Growth).
Filosofi MorkaFin: Menabung bukan beban atau tekanan, melainkan proses yang terasa aman, nyaman, menenangkan, dan membahagiakan—seperti merawat benih tanaman hingga tumbuh menjadi pohon rindang yang berbuah lebat bagi masa depan.
Analisis data portofolio tabungan dan mutasi transaksi pengguna berikut ini, lalu berikan wawasan finansial komprehensif dan tips menabung personal berbasis data dalam bahasa Indonesia yang menyejukkan, hangat, realistis, dan membahagiakan.

${focusArea ? `FOKUS KHUSUS DARI PENGGUNA: "${focusArea}"` : ''}

Data Target Finansial:
- Nama Tujuan: "${goal?.name || 'Tabungan Masa Depan'}"
- Target Nominal: Rp ${(goal?.targetAmount || 0).toLocaleString('id-ID')}
- Periode Perencanaan: ${goal?.startDate || '-'} hingga target selesai ${goal?.targetEndDate || '-'}

Data Progres Saat Ini:
- Saldo Kas Tabungan Terkumpul: Rp ${(progress?.currentTotal || 0).toLocaleString('id-ID')} (${(progress?.progressPercent || 0).toFixed(1)}%)
- Sisa Target yang Harus Dicapai: Rp ${(progress?.remainingTarget || 0).toLocaleString('id-ID')}
- Status Pencapaian: ${progress?.status || 'Berjalan'}
- Total Setoran Bulan Ini: Rp ${(progress?.currentMonthDeposits || 0).toLocaleString('id-ID')}
- Rata-rata Setoran per Bulan: Rp ${(progress?.averageMonthlyDeposit || 0).toLocaleString('id-ID')}
- Estimasi Sisa Waktu Pencapaian: ${progress?.estimatedRemainingMonths || 0} bulan

Data Mutasi Transaksi Terkini:
- Distribusi Sumber Dana: ${JSON.stringify(sourcesDistribution || {})}
- 5-8 Mutasi Terakhir: ${JSON.stringify(recentTransactions || [])}
- Rekap Tabungan Bulanan: ${JSON.stringify(monthlyRecap || [])}

Instruksi Analisis:
1. Evaluasi kedisiplinan dan laju setoran berdasarkan data riil di atas dengan pendekatan yang menentramkan pikiran (mindful saving).
2. Identifikasi apakah ada penarikan yang mengurangi ketahanan dana, atau apakah sumber dana terlalu bertumpu pada 1 pos.
3. Berikan 3 tips praktis bernuansa MorkaFin yang sangat spesifik untuk data pengguna di atas.
4. Berikan skor kesehatan disiplin menabung (skala 1-100), apresiasi kekuatan finansial mereka, dan rekomendasi langkah nyata minggu ini.

Keluarkan hasil HANYA dalam format JSON sesuai schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah Perencana Keuangan MorkaFin.com. Berikan evaluasi keuangan bertema alam yang aman, damai, teratur, transparan, dan memotivasi pengguna menabung dengan bahagia.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Ringkasan komprehensif analisis kondisi keuangan dan progres tabungan.',
            },
            statusEvaluation: {
              type: Type.STRING,
              description: 'Evaluasi status ringkas, misal: "On Track & Konsisten", "Perlu Sedikit Akselerasi", "Momentum Sangat Baik".',
            },
            healthScore: {
              type: Type.INTEGER,
              description: 'Skor kesehatan kedisiplinan menabung antara 1 sampai 100.',
            },
            keyStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 kebiasaan menabung yang sudah sangat baik.',
            },
            areasToImprove: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '1-2 aspek yang perlu diwaspadai atau dioptimalkan.',
            },
            tips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    description: 'Kategori tips (misal: "Optimalisasi Cash Flow", "Manajemen Risiko", "Akselerasi Target", "Alokasi Pos Dana")',
                  },
                  title: {
                    type: Type.STRING,
                    description: 'Judul tips yang menarik dan jelas.',
                  },
                  content: {
                    type: Type.STRING,
                    description: 'Penjelasan tips yang dikaitkan langsung dengan data transaksi pengguna.',
                  },
                  actionableStep: {
                    type: Type.STRING,
                    description: 'Langkah praktis yang dapat langsung dieksekusi minggu ini.',
                  },
                  impactLevel: {
                    type: Type.STRING,
                    description: '"Tinggi" atau "Sedang".',
                  },
                },
                required: ['category', 'title', 'content', 'actionableStep', 'impactLevel'],
              },
            },
            recommendedActionThisWeek: {
              type: Type.STRING,
              description: 'Satu langkah aksi paling penting untuk dilakukan minggu ini.',
            },
            recommendedMonthlyDeposit: {
              type: Type.NUMBER,
              description: 'Nominal setoran bulanan ideal (Rupiah) yang disarankan.',
            },
          },
          required: [
            'summary',
            'statusEvaluation',
            'healthScore',
            'keyStrengths',
            'areasToImprove',
            'tips',
            'recommendedActionThisWeek',
          ],
        },
      },
    });

    const jsonText = response.text || '';
    const parsedData = JSON.parse(jsonText);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Gemini API call failed, falling back to rule-based insights:', error);
    // Return fallback insights rather than failing so user always gets valuable advice
    const fallback = generateFallbackInsights(goal, progress);
    return res.json(fallback);
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TabunganPintar Full-stack server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
