export interface MultipleChoiceQuestion {
  id: number;
  question: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  category: string;
  source: string;
}

export interface TableRow {
  [key: string]: string | number;
}

export interface EssayQuestion {
  id: number;
  question: string;
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
    caption?: string;
  };
  sampleAnswer: string;
  keywords: string[];
  maxScore: number;
  scoringGuide: {
    fullCriteria: string;
    partialCriteria: string;
    minimalCriteria: string;
  };
  explanation: string;
}

export interface ExamMetadata {
  title: string;
  subject: string;
  grade: string;
  chapter: string;
  durationMinutes: number;
  kkm: number;
  totalPg: number;
  totalEssay: number;
  pgWeight: number; // e.g. 60%
  essayWeight: number; // e.g. 40%
  maxViolationsAllowed: number;
}

export const EXAM_METADATA: ExamMetadata = {
  title: "Daily Assessment (Asesmen Harian)",
  subject: "Informatika",
  grade: "Kelas VII SMP / MTs",
  chapter: "Bab 1: Berpikir Komputasional untuk Pengolahan Data Dasar (Perkakas Pengolah Lembar Kerja)",
  durationMinutes: 60,
  kkm: 78,
  totalPg: 10,
  totalEssay: 5,
  pgWeight: 60,
  essayWeight: 40,
  maxViolationsAllowed: 5,
};

// 10 Soal Pilihan Ganda diambil langsung dari Buku Siswa Bab 1 Asesmen Formatif (Hal. 28)
export const MULTIPLE_CHOICE_QUESTIONS: MultipleChoiceQuestion[] = [
  {
    id: 1,
    question: "Fungsi yang digunakan untuk menghitung penjumlahan angka pada lembar kerja adalah....",
    options: [
      { key: "A", text: "SUM" },
      { key: "B", text: "COUNT" },
      { key: "C", text: "COUNTIF" },
      { key: "D", text: "SUMIF" }
    ],
    correctAnswer: "A",
    explanation: "Fungsi SUM digunakan untuk menjumlahkan sekumpulan angka atau data numerik dalam suatu rentang (range) sel.",
    category: "Fungsi Dasar Pengolah Angka",
    source: "Buku Siswa Informatika Hal. 28 No. 1"
  },
  {
    id: 2,
    question: "Fungsi yang digunakan untuk menghitung banyaknya data numerik adalah....",
    options: [
      { key: "A", text: "SUM" },
      { key: "B", text: "COUNT" },
      { key: "C", text: "COUNTIF" },
      { key: "D", text: "SUMIF" }
    ],
    correctAnswer: "B",
    explanation: "Fungsi COUNT digunakan untuk menghitung jumlah sel yang berisi data angka (numerik) dalam sekumpulan sel.",
    category: "Fungsi Dasar Pengolah Angka",
    source: "Buku Siswa Informatika Hal. 28 No. 2"
  },
  {
    id: 3,
    question: "Fungsi yang digunakan untuk menghitung penjumlahan data berdasarkan kondisi tertentu adalah....",
    options: [
      { key: "A", text: "SUM" },
      { key: "B", text: "COUNT" },
      { key: "C", text: "COUNTIF" },
      { key: "D", text: "SUMIF" }
    ],
    correctAnswer: "D",
    explanation: "Fungsi SUMIF merupakan kombinasi SUM dan IF, digunakan untuk menjumlahkan data yang memenuhi kriteria atau kondisi spesifik tertentu.",
    category: "Fungsi Logika & Kondisi",
    source: "Buku Siswa Informatika Hal. 28 No. 3"
  },
  {
    id: 4,
    question: "Fungsi yang digunakan untuk menghitung nilai rata-rata adalah....",
    options: [
      { key: "A", text: "MIN" },
      { key: "B", text: "AVERAGES" },
      { key: "C", text: "AVERAGE" },
      { key: "D", text: "MAX" }
    ],
    correctAnswer: "C",
    explanation: "Fungsi AVERAGE digunakan untuk mencari nilai rata-rata aritmetika dari argumen atau sekumpulan sel yang dipilih.",
    category: "Fungsi Statistik Dasar",
    source: "Buku Siswa Informatika Hal. 28 No. 4"
  },
  {
    id: 5,
    question: "Fungsi yang digunakan untuk mencari nilai terbesar dari suatu kumpulan data adalah....",
    options: [
      { key: "A", text: "MIN" },
      { key: "B", text: "AVERAGES" },
      { key: "C", text: "COUNT" },
      { key: "D", text: "MAX" }
    ],
    correctAnswer: "D",
    explanation: "Fungsi MAX (singkatan dari Maximum) digunakan untuk mencari atau mengembalikan nilai numerik paling besar/tinggi dari sekumpulan sel.",
    category: "Fungsi Statistik Dasar",
    source: "Buku Siswa Informatika Hal. 28 No. 5"
  },
  {
    id: 6,
    question: "Fungsi yang digunakan untuk mencari nilai terkecil dari suatu kumpulan data adalah....",
    options: [
      { key: "A", text: "MAX" },
      { key: "B", text: "AVERAGE" },
      { key: "C", text: "MIN" },
      { key: "D", text: "SUMIF" }
    ],
    correctAnswer: "C",
    explanation: "Fungsi MIN (singkatan dari Minimum) digunakan untuk mencari atau mengembalikan nilai numerik paling kecil/rendah dari sekumpulan data.",
    category: "Fungsi Statistik Dasar",
    source: "Buku Siswa Informatika Hal. 28 No. 6"
  },
  {
    id: 7,
    question: "Perhatikan fungsi-fungsi berikut:\n(i). MAX\n(ii). AVERAGE\n(iii). COUNT\n(iv). MEDIAN\n\nFungsi yang dapat digunakan untuk mencari nilai tertinggi, rata-rata, dan nilai tengah secara berurutan ditunjukkan oleh nomor....",
    options: [
      { key: "A", text: "(i), (ii), dan (iii)" },
      { key: "B", text: "(i), (ii), dan (iv)" },
      { key: "C", text: "(i), (iii), dan (iv)" },
      { key: "D", text: "(ii), (iii), dan (iv)" }
    ],
    correctAnswer: "B",
    explanation: "MAX untuk mencari nilai tertinggi, AVERAGE untuk rata-rata, dan MEDIAN untuk mencari nilai tengah. Maka kombinasinya adalah (i), (ii), dan (iv).",
    category: "HOTS / Analisis Formula",
    source: "Buku Siswa Informatika Hal. 28 No. 7"
  },
  {
    id: 8,
    question: "Jika pada suatu sel tertulis formula =SUM(A1:A5), maka yang dimaksud dengan formula tersebut adalah....",
    options: [
      { key: "A", text: "menjumlahkan data dari angka 1 sampai 5" },
      { key: "B", text: "menjumlahkan data pada kolom A dari sel A1 sampai sel A5" },
      { key: "C", text: "menjumlahkan banyaknya data pada kolom A" },
      { key: "D", text: "menjumlahkan data berdasarkan nilai angka 1 sampai 5" }
    ],
    correctAnswer: "B",
    explanation: "=SUM(A1:A5) memerintahkan pengolah lembar kerja untuk menjumlahkan seluruh isi data angka pada kolom A mulai dari baris 1 (sel A1) sampai baris 5 (sel A5).",
    category: "Pemahaman Range Sel",
    source: "Buku Siswa Informatika Hal. 28 No. 8"
  },
  {
    id: 9,
    question: "Formula excel berikut: \"=MIN(18; 36; 9; 95; 7; 100; 150)\" jika dieksekusi akan menghasilkan angka....",
    options: [
      { key: "A", text: "150" },
      { key: "B", text: "415" },
      { key: "C", text: "7" },
      { key: "D", text: "95" }
    ],
    correctAnswer: "C",
    explanation: "Fungsi MIN mengambil nilai numerik terendah dari rentetan parameter. Di antara 18, 36, 9, 95, 7, 100, dan 150, angka terkecil adalah 7.",
    category: "Kalkulasi Formula Lembar Kerja",
    source: "Buku Siswa Informatika Hal. 28 No. 9"
  },
  {
    id: 10,
    question: "Formula excel berikut: \"=SUM(18; 36; 9; 95; 7; 100; 150)\" jika dieksekusi akan menghasilkan angka....",
    options: [
      { key: "A", text: "150" },
      { key: "B", text: "415" },
      { key: "C", text: "417" },
      { key: "D", text: "451" }
    ],
    correctAnswer: "B",
    explanation: "Penjumlahan seluruh angka: 18 + 36 + 9 + 95 + 7 + 100 + 150 = 415.",
    category: "Kalkulasi Formula Lembar Kerja",
    source: "Buku Siswa Informatika Hal. 28 No. 10"
  }
];

// 5 Soal Essay diambil langsung dari Buku Siswa Bab 1 Bagian B (Hal. 11)
export const ESSAY_QUESTIONS: EssayQuestion[] = [
  {
    id: 1,
    question: "Di sekolahmu, kamu diminta untuk membantu menyusun jadwal kegiatan harian. Tuliskan data-data yang kamu perlukan untuk menyusun jadwal kegiatan harian tersebut secara lengkap!",
    sampleAnswer: "Data yang diperlukan antara lain: 1) Nama atau jenis kegiatan/mata pelajaran, 2) Waktu pelaksanaan (hari, tanggal, jam mulai dan jam selesai), 3) Tempat atau ruangan pelaksanaan kegiatan, 4) Penanggung jawab / guru pengampu / peserta, 5) Tingkat prioritas atau perlengkapan yang diperlukan.",
    keywords: ["kegiatan", "waktu", "jam", "hari", "tanggal", "tempat", "lokasi", "penanggung jawab", "durasi", "prioritas"],
    maxScore: 20,
    scoringGuide: {
      fullCriteria: "Menyebutkan minimal 4 data relevan (nama kegiatan, waktu/jam/hari, tempat, penanggung jawab/perlengkapan).",
      partialCriteria: "Menyebutkan 2-3 data relevan.",
      minimalCriteria: "Hanya menyebutkan 1 data relevan atau penjelasan terlalu umum."
    },
    explanation: "Dalam berpikir komputasional pengolahan data, menyusun jadwal memerlukan atribut data lengkap seperti nama acara, durasi, waktu, dan lokasi agar jadwal terstruktur."
  },
  {
    id: 2,
    question: "Jelaskan langkah-langkah untuk menyusun jadwal kegiatan harian yang efektif dan teratur!",
    sampleAnswer: "Langkah-langkah menyusun jadwal efektif: 1) Menginventarisasi/mencatat semua daftar kegiatan yang harus diselesaikan, 2) Menentukan skala prioritas (kegiatan penting dan mendesak didahulukan), 3) Mengalokasikan perkiraan durasi waktu secara realistis termasuk waktu istirahat, 4) Menyusun urutan kegiatan secara terstruktur dan fleksibel, 5) Mengevaluasi dan berkomitmen menjalankan jadwal.",
    keywords: ["daftar kegiatan", "prioritas", "alokasi waktu", "durasi", "istirahat", "urutan", "evaluasi", "jadwal"],
    maxScore: 20,
    scoringGuide: {
      fullCriteria: "Menjelaskan runtutan langkah logis: mendata kegiatan, menentukan skala prioritas, alokasi waktu/istirahat, dan penyusunan serta evaluasi.",
      partialCriteria: "Menyebutkan 2-3 langkah logis namun belum lengkap.",
      minimalCriteria: "Hanya menjelaskan satu langkah secara singkat tanpa runtutan jelas."
    },
    explanation: "Penyusunan jadwal menerapkan dekomposisi masalah dan perancangan algoritma penjadwalan agar kegiatan harian optimal."
  },
  {
    id: 3,
    question: "Perhatikan tabel penjualan buku pada 4 bulan terakhir di bawah ini.\n\nBerdasarkan data tabel tersebut, jenis buku apa yang paling banyak terjual selama empat bulan? Jelaskan bagaimana kamu mendapatkan kesimpulan tersebut lengkap dengan perhitungannya!",
    tableData: {
      headers: ["Bulan", "Buku Novel", "Buku Pelajaran", "Buku Cerita Anak"],
      rows: [
        ["Januari", 120, 80, 50],
        ["Februari", 100, 90, 60],
        ["Maret", 140, 70, 40],
        ["April", 160, 100, 70]
      ],
      caption: "Tabel 1.1: Data Rekap Penjualan Buku (Januari - April)"
    },
    sampleAnswer: "Jenis buku yang paling banyak terjual adalah Buku Novel.\nPerhitungan:\n- Total Buku Novel = 120 + 100 + 140 + 160 = 520 buku\n- Total Buku Pelajaran = 80 + 90 + 70 + 100 = 340 buku\n- Total Buku Cerita Anak = 50 + 60 + 40 + 70 = 220 buku\nKesimpulan didapat dengan menjumlahkan penjualan tiap jenis buku selama 4 bulan menggunakan konsep penjumlahan/SUM, di mana Buku Novel menempati angka penjualan tertinggi (520 eksemplar).",
    keywords: ["novel", "520", "total", "penjumlahan", "jumlah", "pelajaran 340", "cerita 220"],
    maxScore: 20,
    scoringGuide: {
      fullCriteria: "Menyebutkan dengan tepat Buku Novel sebagai buku terlaris, disertai bukti total perhitungan (520) dan perbandingan dengan buku lain.",
      partialCriteria: "Menyebutkan Buku Novel dengan benar namun hitungan total kurang lengkap, atau hanya menyebut angka tanpa jenis buku.",
      minimalCriteria: "Jawaban salah atau hanya menyebutkan nama buku tanpa penjelasan perhitungan sama sekali."
    },
    explanation: "Menguji keterampilan analisis data tabel dengan fungsi agregasi penjumlahan (SUM) dan penarikan kesimpulan data terbesar (MAX)."
  },
  {
    id: 4,
    question: "Berdasarkan tabel penjualan buku di atas, jika tren penjualan terus meningkat sebesar 20% setiap bulan untuk Buku Novel, berapakah perkiraan jumlah Buku Novel yang akan terjual pada bulan Mei? Tuliskan langkah perhitungannya!",
    tableData: {
      headers: ["Bulan", "Buku Novel", "Buku Pelajaran", "Buku Cerita Anak"],
      rows: [
        ["Januari", 120, 80, 50],
        ["Februari", 100, 90, 60],
        ["Maret", 140, 70, 40],
        ["April", 160, 100, 70]
      ],
      caption: "Tabel 1.1: Data Rekap Penjualan Buku (Januari - April)"
    },
    sampleAnswer: "Perkiraan penjualan Buku Novel di bulan Mei adalah 192 buku.\nLangkah perhitungan:\n1) Penjualan buku novel di bulan April = 160 buku.\n2) Peningkatan 20% = 20% × 160 = 0,2 × 160 = 32 buku.\n3) Perkiraan bulan Mei = 160 + 32 = 192 buku (atau 160 × 120% = 192 buku).",
    keywords: ["192", "20%", "32", "160", "april", "mei"],
    maxScore: 20,
    scoringGuide: {
      fullCriteria: "Menghasilkan angka akhir 192 buku dengan menuliskan rumus atau langkah 160 + (20% * 160) = 192 secara jelas.",
      partialCriteria: "Menghitung kenaikan 32 buku dengan benar namun lupa menambahkan ke 160, atau angka akhir 192 tanpa langkah runtut.",
      minimalCriteria: "Salah dalam perkalian persentase namun menunjukkan upaya rumus."
    },
    explanation: "Menguji kemampuan prediksi tren data (forecasting) menggunakan persentase aritmetika pada lembar kerja."
  },
  {
    id: 5,
    question: "Menurut pendapatmu, mengapa penjualan Buku Pelajaran cenderung mengalami peningkatan yang cukup tajam pada bulan April (mencapai 100 buku)? Analisislah kemungkinan penyebabnya berdasarkan pola kalender akademik sekolah!",
    tableData: {
      headers: ["Bulan", "Buku Novel", "Buku Pelajaran", "Buku Cerita Anak"],
      rows: [
        ["Januari", 120, 80, 50],
        ["Februari", 100, 90, 60],
        ["Maret", 140, 70, 40],
        ["April", 160, 100, 70]
      ],
      caption: "Tabel 1.1: Data Rekap Penjualan Buku (Januari - April)"
    },
    sampleAnswer: "Peningkatan penjualan Buku Pelajaran di bulan April berkaitan erat dengan kalender pendidikan:\n1) Persiapan menghadapi Penilaian Akhir Tahun (PAT) / Asesmen Sumatif Akhir Semester / Ujian Sekolah yang umumnya berlangsung antara bulan April hingga Mei/Juni.\n2) Siswa dan orang tua membeli buku tambahan referensi, buku latihan soal, atau modul pengayaan untuk persiapan ujian kenaikan kelas.\n3) Dimulainya pemantapan materi semester genap oleh sekolah dan bimbingan belajar.",
    keywords: ["ujian", "semester", "pat", "kenaikan kelas", "persiapan", "latihan soal", "belajar", "sekolah", "kalender akademik"],
    maxScore: 20,
    scoringGuide: {
      fullCriteria: "Memberikan analisis logis berbasis kalender pendidikan (persiapan ujian semester/PAT/kenaikan kelas, kebutuhan latihan soal).",
      partialCriteria: "Menyebutkan faktor ujian atau belajar namun penjelasan singkat/kurang elaboratif.",
      minimalCriteria: "Alasan tidak relevan atau hanya menjawab 'karena banyak yang beli'."
    },
    explanation: "Menguji keterampilan berpikir kritis dan interpretasi makna di balik pola perubahan data tren penjualan."
  }
];

// Helper auto-grader untuk essay
export function autoGradeEssay(questionId: number, studentText: string): {
  score: number;
  maxScore: number;
  feedback: string;
  matchedKeywords: string[];
} {
  const q = ESSAY_QUESTIONS.find((item) => item.id === questionId);
  if (!q) {
    return { score: 0, maxScore: 20, feedback: "Pertanyaan tidak ditemukan.", matchedKeywords: [] };
  }

  const cleanedText = (studentText || "").toLowerCase().trim();
  if (!cleanedText || cleanedText.length < 5) {
    return {
      score: 0,
      maxScore: q.maxScore,
      feedback: "Jawaban kosong atau terlalu singkat untuk dinilai.",
      matchedKeywords: []
    };
  }

  // Khusus soal hitungan pasti No. 3 dan No. 4:
  if (questionId === 4) {
    const has192 = cleanedText.includes("192");
    const has32 = cleanedText.includes("32");
    const hasFormula = cleanedText.includes("20%") || cleanedText.includes("160") || cleanedText.includes("0,2") || cleanedText.includes("0.2");

    if (has192 && (has32 || hasFormula)) {
      return {
        score: 20,
        maxScore: 20,
        feedback: "Sangat Tepat! Perhitungan perkiraan penjualan buku novel bulan Mei adalah 192 (160 + 32) dengan langkah akurat.",
        matchedKeywords: ["192", "32", "160", "20%"]
      };
    } else if (has192) {
      return {
        score: 18,
        maxScore: 20,
        feedback: "Hasil akhir 192 benar, langkah perhitungan perlu lebih dirinci.",
        matchedKeywords: ["192"]
      };
    } else if (has32) {
      return {
        score: 12,
        maxScore: 20,
        feedback: "Kenaikan 32 buku sudah tepat, namun belum ditambahkan ke penjualan April (160 + 32 = 192).",
        matchedKeywords: ["32", "20%"]
      };
    }
  }

  if (questionId === 3) {
    const mentionsNovel = cleanedText.includes("novel");
    const mentions520 = cleanedText.includes("520");
    const mentionsTotalOrSum = cleanedText.includes("total") || cleanedText.includes("jumlah") || cleanedText.includes("tambah") || cleanedText.includes("sum");

    if (mentionsNovel && mentions520 && mentionsTotalOrSum) {
      return {
        score: 20,
        maxScore: 20,
        feedback: "Sangat Tepat! Menyebutkan Buku Novel dengan total 520 serta penjelasan perhitungan lengkap.",
        matchedKeywords: ["novel", "520", "total"]
      };
    } else if (mentionsNovel && (mentions520 || mentionsTotalOrSum)) {
      return {
        score: 17,
        maxScore: 20,
        feedback: "Tepat, Buku Novel adalah penjualan tertinggi dengan total 520 buku.",
        matchedKeywords: ["novel", mentions520 ? "520" : "total"]
      };
    } else if (mentionsNovel) {
      return {
        score: 13,
        maxScore: 20,
        feedback: "Jenis buku benar (Buku Novel), namun rincian hitungan total (520) belum disertakan.",
        matchedKeywords: ["novel"]
      };
    }
  }

  // Soal Konseptual No. 1, 2, 5
  const matched = q.keywords.filter((kw) => cleanedText.includes(kw.toLowerCase()));
  const matchRatio = matched.length / Math.max(q.keywords.length * 0.5, 1);
  const textLength = cleanedText.split(/\s+/).length;

  let score = 0;
  let feedback = "";

  if (matched.length >= 4 && textLength >= 15) {
    score = 20;
    feedback = "Luar biasa! Penjelasan sangat komprehensif, mencakup kata kunci dan konsep inti secara jelas.";
  } else if (matched.length >= 3 && textLength >= 10) {
    score = 17;
    feedback = "Jawaban baik dan sesuai materi, konsep pokok sudah terwakili dengan tepat.";
  } else if (matched.length >= 2 && textLength >= 6) {
    score = 13;
    feedback = "Jawaban cukup baik, namun bisa lebih diperluas dengan contoh atau rincian tambahan.";
  } else if (matched.length >= 1 || textLength >= 8) {
    score = 9;
    feedback = "Jawaban mencakup sebagian kecil materi, perlu penjelasan yang lebih spesifik.";
  } else {
    score = 5;
    feedback = "Penjelasan terlalu umum atau belum menyentuh konsep materi yang diminta.";
  }

  return {
    score,
    maxScore: q.maxScore,
    feedback,
    matchedKeywords: matched
  };
}
