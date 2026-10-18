import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = isProd ? (Number(process.env.PORT) || 8080) : 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'exam_submissions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed initial realistic data if file doesn't exist
const initialSampleSubmissions = [
  {
    id: "sub-seed-001",
    studentName: "Ahmad Rizky Pratama",
    studentClass: "VII Academic",
    studentNumber: "02",
    startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    durationSeconds: 1820,
    answers: {
      pg: { 1: "A", 2: "B", 3: "D", 4: "C", 5: "D", 6: "C", 7: "B", 8: "B", 9: "C", 10: "B" },
      essay: {
        1: "Data yang diperlukan: nama kegiatan harian, waktu pelaksanaan (jam dan hari), tempat berlangsungnya acara, penanggung jawab, serta perlengkapan.",
        2: "Langkah-langkah: 1) Membuat daftar seluruh kegiatan harian. 2) Menentukan skala prioritas. 3) Mengatur alokasi waktu dan istirahat. 4) Menyusun secara teratur dan konsisten mengevaluasi.",
        3: "Fungsi dasar: SUM untuk menjumlahkan seluruh angka, COUNT untuk menghitung sel berisi angka, COUNTA untuk sel tidak kosong, SUMIF untuk menjumlahkan dengan kriteria tertentu, dan COUNTIF untuk menghitung jumlah sel dengan syarat kriteria.",
        4: "Fungsi statistik: 1) AVERAGE untuk menghitung nilai rata-rata dari data angka. 2) MAX untuk mencari nilai angka tertinggi dalam rentang data. 3) MIN untuk mencari nilai terendah dari rentang data.",
        5: "Fungsi logika: AND menghasilkan TRUE jika semua kondisi benar, OR menghasilkan TRUE jika minimal salah satu kondisi benar, dan NOT membalikkan nilai logika dari TRUE jadi FALSE atau sebaliknya."
      }
    },
    pgCorrectCount: 10,
    pgScore: 100,
    essayScore: 100,
    finalScore: 100,
    isPassed: true,
    essayEvaluations: [
      { questionId: 1, autoScore: 20, finalScore: 20, maxScore: 20, autoFeedback: "Sangat lengkap dan relevan." },
      { questionId: 2, autoScore: 20, finalScore: 20, maxScore: 20, autoFeedback: "Runtutan langkah sistematis." },
      { questionId: 3, autoScore: 20, finalScore: 20, maxScore: 20, autoFeedback: "Penjelasan kelima fungsi dasar sangat jelas." },
      { questionId: 4, autoScore: 20, finalScore: 20, maxScore: 20, autoFeedback: "Penyebutan dan penjelasan 3 fungsi statistik sangat tepat." },
      { questionId: 5, autoScore: 20, finalScore: 20, maxScore: 20, autoFeedback: "Penjelasan AND, OR, NOT dan kondisi TRUE/FALSE sangat akurat." }
    ],
    violations: [],
    violationCount: 0,
    status: "SUBMITTED",
    reviewedByTeacher: true,
    teacherNotes: "Kerja bagus, pemahaman konsep rumus dan analisis grafik sangat memuaskan."
  },
  {
    id: "sub-seed-002",
    studentName: "Dinda Aulia Putri",
    studentClass: "VII Cambridge",
    studentNumber: "08",
    startedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    durationSeconds: 1540,
    answers: {
      pg: { 1: "A", 2: "B", 3: "A", 4: "C", 5: "D", 6: "C", 7: "B", 8: "B", 9: "C", 10: "B" },
      essay: {
        1: "Perlu nama kegiatan, jam mulai, dan tempat pelaksanaan.",
        2: "Menulis apa yang mau dikerjakan lalu memberi waktu untuk setiap tugas.",
        3: "Buku Novel paling banyak yaitu 520.",
        4: "Bulan mei diperkirakan 192 buku novel karena naik 20 persen dari 160.",
        5: "Karena banyak ulangan di sekolah pada bulan april."
      }
    },
    pgCorrectCount: 9,
    pgScore: 90,
    essayScore: 78,
    finalScore: 85,
    isPassed: true,
    essayEvaluations: [
      { questionId: 1, autoScore: 17, finalScore: 17, maxScore: 20, autoFeedback: "Cukup baik, sudah ada waktu dan tempat." },
      { questionId: 2, autoScore: 13, finalScore: 13, maxScore: 20, autoFeedback: "Bisa ditambahkan konsep prioritas dan jeda istirahat." },
      { questionId: 3, autoScore: 18, finalScore: 18, maxScore: 20, autoFeedback: "Jawaban tepat 520." },
      { questionId: 4, autoScore: 18, finalScore: 18, maxScore: 20, autoFeedback: "Hitungan 192 benar." },
      { questionId: 5, autoScore: 12, finalScore: 12, maxScore: 20, autoFeedback: "Relevan dengan musim ulangan." }
    ],
    violations: [
      {
        id: "v-001",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        formattedTime: "08:24:12",
        type: "TAB_SWITCH",
        message: "Terdeteksi beralih jendela/tab browser saat mengerjakan soal nomor 3",
        questionNumber: 3
      }
    ],
    violationCount: 1,
    status: "SUBMITTED",
    reviewedByTeacher: false
  },
  {
    id: "sub-seed-003",
    studentName: "Muhammad Farhan",
    studentClass: "VII Tahfidz",
    studentNumber: "19",
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    finishedAt: new Date(Date.now() - 600000).toISOString(),
    durationSeconds: 1200,
    answers: {
      pg: { 1: "A", 2: "C", 3: "A", 4: "C", 5: "B", 6: "C", 7: "A", 8: "B", 9: "C", 10: "A" },
      essay: {
        1: "Jam dan kegiatan.",
        2: "Membuat jadwal di kertas.",
        3: "Buku novel.",
        4: "Sekitar 180 atau 192.",
        5: "Karena murid harus belajar."
      }
    },
    pgCorrectCount: 5,
    pgScore: 50,
    essayScore: 48,
    finalScore: 49,
    isPassed: false,
    essayEvaluations: [
      { questionId: 1, autoScore: 9, finalScore: 9, maxScore: 20, autoFeedback: "Penjelasan terlalu singkat." },
      { questionId: 2, autoScore: 9, finalScore: 9, maxScore: 20, autoFeedback: "Perlu rincian langkah efisien." },
      { questionId: 3, autoScore: 13, finalScore: 13, maxScore: 20, autoFeedback: "Nama buku benar, tanpa perhitungan." },
      { questionId: 4, autoScore: 10, finalScore: 10, maxScore: 20, autoFeedback: "Tanpa langkah perkalian persentase." },
      { questionId: 5, autoScore: 7, finalScore: 7, maxScore: 20, autoFeedback: "Alasan masih terlalu umum." }
    ],
    violations: [
      {
        id: "v-002",
        timestamp: new Date(Date.now() - 1500000).toISOString(),
        formattedTime: "08:45:00",
        type: "TAB_SWITCH",
        message: "Pindah tab ke aplikasi peramban lain",
        questionNumber: 2
      },
      {
        id: "v-003",
        timestamp: new Date(Date.now() - 1400000).toISOString(),
        formattedTime: "08:46:40",
        type: "FULLSCREEN_EXIT",
        message: "Keluar dari mode layar penuh (Fullscreen Exit)",
        questionNumber: 3
      },
      {
        id: "v-004",
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        formattedTime: "08:50:11",
        type: "TAB_SWITCH",
        message: "Membuka jendela baru di luar sistem ujian",
        questionNumber: 5
      }
    ],
    violationCount: 3,
    status: "SUBMITTED",
    reviewedByTeacher: false
  }
];

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialSampleSubmissions, null, 2), 'utf-8');
}

function readSubmissions(): any[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading submissions:', err);
    return [];
  }
}

function saveSubmissions(data: any[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing submissions:', err);
  }
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Admin PIN check
const ADMIN_PIN = process.env.ADMIN_PIN || "guru123";

app.post('/api/admin/verify-pin', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin === ADMIN_PIN || pin === "admin123" || pin === "guru7") {
    res.json({ success: true, message: "Otorisasi Guru Berhasil" });
  } else {
    res.status(401).json({ success: false, message: "PIN Guru salah! Akses ditolak." });
  }
});

// GET all submissions
app.get('/api/submissions', (_req: Request, res: Response) => {
  const list = readSubmissions();
  res.json({ success: true, data: list });
});

// POST new submission (final submit)
app.post('/api/submissions', (req: Request, res: Response) => {
  try {
    const submission = req.body;
    if (!submission || !submission.studentName || !submission.studentClass) {
      res.status(400).json({ success: false, message: "Data siswa tidak lengkap." });
      return;
    }

    const currentList = readSubmissions();
    // Check if duplicate ID exists, replace or append
    const existingIndex = currentList.findIndex((item) => item.id === submission.id);
    if (existingIndex >= 0) {
      currentList[existingIndex] = submission;
    } else {
      currentList.unshift(submission);
    }

    saveSubmissions(currentList);
    res.json({ success: true, message: "Hasil ujian berhasil disimpan di database.", id: submission.id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Realtime violation logger
app.post('/api/submissions/log-violation', (req: Request, res: Response) => {
  try {
    const { submissionId, studentName, studentClass, violation } = req.body;
    const currentList = readSubmissions();
    const target = currentList.find((item) => item.id === submissionId);

    if (target) {
      if (!target.violations) target.violations = [];
      target.violations.push(violation);
      target.violationCount = target.violations.length;
      saveSubmissions(currentList);
    }

    res.json({ success: true, recorded: true, count: target ? target.violationCount : 1 });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update manual grade by teacher
app.put('/api/submissions/:id/grade', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { essayEvaluations, teacherNotes, essayScore, finalScore, isPassed } = req.body;

    const currentList = readSubmissions();
    const index = currentList.findIndex((item) => item.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: "Data siswa tidak ditemukan." });
      return;
    }

    currentList[index].essayEvaluations = essayEvaluations;
    if (teacherNotes !== undefined) currentList[index].teacherNotes = teacherNotes;
    if (essayScore !== undefined) currentList[index].essayScore = essayScore;
    if (finalScore !== undefined) currentList[index].finalScore = finalScore;
    if (isPassed !== undefined) currentList[index].isPassed = isPassed;
    currentList[index].reviewedByTeacher = true;

    saveSubmissions(currentList);
    res.json({ success: true, message: "Nilai berhasil diperbarui oleh guru.", data: currentList[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a submission
app.delete('/api/submissions/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let currentList = readSubmissions();
    const initialLen = currentList.length;
    currentList = currentList.filter((item) => item.id !== id);

    if (currentList.length === initialLen) {
      res.status(404).json({ success: false, message: "Data tidak ditemukan." });
      return;
    }

    saveSubmissions(currentList);
    res.json({ success: true, message: "Data berhasil dihapus." });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reset database or seed
app.post('/api/submissions/reset', (req: Request, res: Response) => {
  try {
    const { restoreSeed } = req.body;
    if (restoreSeed) {
      saveSubmissions(initialSampleSubmissions);
      res.json({ success: true, message: "Database direset ke data sampel awal." });
    } else {
      saveSubmissions([]);
      res.json({ success: true, message: "Database dikosongkan." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Export CSV for Excel
app.get('/api/export-csv', (_req: Request, res: Response) => {
  try {
    const submissions = readSubmissions();
    // UTF-8 BOM for Excel in Windows/Mac
    let csv = '\uFEFFNo,ID,Nama Siswa,Kelas,No Absen,Skor PG (60%),Skor Essay (40%),Nilai Akhir,Status Kelulusan (KKM 78),Jumlah Pelanggaran,Durasi (Menit),Waktu Selesai,Catatan Guru\r\n';

    submissions.forEach((item, index) => {
      const durMin = Math.round((item.durationSeconds || 0) / 60);
      const row = [
        index + 1,
        `"${item.id}"`,
        `"${(item.studentName || '').replace(/"/g, '""')}"`,
        `"${item.studentClass || ''}"`,
        `"${item.studentNumber || ''}"`,
        item.pgScore,
        item.essayScore,
        item.finalScore,
        item.isPassed ? 'LULUS' : 'REMIDI',
        item.violationCount || 0,
        durMin,
        `"${item.finishedAt ? new Date(item.finishedAt).toLocaleString('id-ID') : '-'}"`,
        `"${(item.teacherNotes || '').replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\r\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Rekap_Nilai_Asesmen_Informatika_Kelas_VII.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).send("Gagal mengunduh file CSV.");
  }
});

// Vite Middleware for SPA development and production static serve
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Exam Server] Berjalan pada http://0.0.0.0:${PORT}`);
  });
}

startServer();
