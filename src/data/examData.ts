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
  maxViolationsAllowed: 3,
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
    question: "Pertemuan antara baris (row) dan kolom (column) pada spreadsheet adalah....",
    options: [
      { key: "A", text: "Baris (Row)" },
      { key: "B", text: "Sel (Cell)" },
      { key: "C", text: "Kolom (Column)" },
      { key: "D", text: "Range" }
    ],
    correctAnswer: "B",
    explanation: "Pertemuan antara baris (horizontal) dan kolom (vertikal) pada lembar kerja (spreadsheet) dinamakan Sel (Cell), sebagai contoh pertemuan kolom A dan baris 1 dinamakan sel A1.",
    category: "Konsep Dasar Lembar Kerja",
    source: "Buku Siswa Informatika Bab 1"
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
    question: "Jelaskan langkah-langkah membuat dan merapikan tabel data siswa serta nilai informatika pada spreadsheet (seperti Microsoft Excel atau Google Sheets)!",
    sampleAnswer: "Langkah-langkah membuat dan merapikan tabel data siswa dan nilai informatika:\n1) Membuka aplikasi spreadsheet (Microsoft Excel atau Google Sheets) dan membuat dokumen baru (Blank Workbook).\n2) Menuliskan judul-judul kolom pada baris pertama (misal: sel A1: Nama Siswa, B1: Kelas, C1: Nilai Informatika, D1: Tanggal Ujian, E1: Status Kelulusan).\n3) Menginput data nama-nama siswa dan perolehan nilai informatika pada baris-baris berikutnya secara urut dan teliti.\n4) Mengatur lebar kolom (klik ganda batas kepala kolom) agar teks dan angka terbaca jelas tanpa terpotong.\n5) Memformat tabel agar rapi dan menarik: menebalkan judul kolom (ikon Bold), memberi garis tabel (Borders / All Borders), serta memberi warna latar belakang judul kolom (Fill Color).",
    keywords: ["buka", "excel", "sheets", "lembar kerja", "judul kolom", "nama siswa", "nilai", "lebar kolom", "bold", "tebal", "border", "garis", "fill color", "warna"],
    maxScore: 20,
    scoringGuide: {
      fullCriteria: "Menjelaskan langkah runtut dan terstruktur: membuka aplikasi/dokumen baru, memasukkan judul kolom & data nilai siswa, mengatur lebar kolom, serta memberi format rapi (bold, border, fill color).",
      partialCriteria: "Menjelaskan sebagian langkah pembuatan tabel dan beberapa pemformatan.",
      minimalCriteria: "Penjelasan sangat singkat hanya menyebut mengetik data tanpa pemformatan tabel."
    },
    explanation: "Menguji keterampilan praktis pengolahan data lembar kerja dalam pembuatan struktur tabel, input data, dan pemformatan sel agar rapi dan informatif."
  },
  {
    id: 3,
    question: "Jelaskan fungsi dan kegunaan dari masing-masing rumus fungsi dasar lembar kerja (spreadsheet) berikut: SUM, COUNT, COUNTA, SUMIF, dan COUNTIF! Berikan pula penjelasan perbedaan cara kerjanya secara jelas!",
    sampleAnswer: "Penjelasan rumus fungsi dasar spreadsheet:\n1) SUM: Berfungsi untuk menjumlahkan seluruh nilai angka (numerik) pada rentang sel yang dipilih (misal: =SUM(A1:A10)).\n2) COUNT: Berfungsi untuk menghitung banyaknya sel yang hanya berisi data numerik (angka).\n3) COUNTA: Berfungsi untuk menghitung banyaknya sel yang tidak kosong (berisi data apa pun, baik teks, angka, maupun simbol).\n4) SUMIF: Berfungsi untuk menjumlahkan data numerik pada sel yang memenuhi kriteria atau syarat tertentu (misal: menjumlahkan nilai siswa yang di atas 75).\n5) COUNTIF: Berfungsi untuk menghitung banyaknya sel yang memenuhi kriteria atau syarat tertentu (misal: menghitung jumlah siswa yang lulus).",
    keywords: ["sum", "count", "counta", "sumif", "countif", "penjumlahan", "angka", "numerik", "tidak kosong", "kriteria", "syarat"],
    maxScore: 20,
    scoringGuide: {
      fullCriteria: "Menjelaskan kelima fungsi dasar (SUM, COUNT, COUNTA, SUMIF, COUNTIF) dengan tepat dan membedakan fungsinya secara jelas.",
      partialCriteria: "Menjelaskan 3-4 fungsi dengan benar.",
      minimalCriteria: "Hanya menjelaskan 1-2 fungsi secara singkat."
    },
    explanation: "Menguji pemahaman fungsi kalkulasi agregasi dasar dan pemfilteran kriteria sel pada perkakas lembar kerja."
  },
  {
    id: 4,
    question: "Sebutkan 3 jenis rumus fungsi statistik pada spreadsheet (pilih di antara: AVERAGE, MAX, MIN, SMALL, atau LARGE) dan jelaskan fungsi serta cara kerja dari masing-masing rumus yang kamu pilih tersebut!",
    sampleAnswer: "Tiga jenis fungsi statistik spreadsheet:\n1) AVERAGE: Berfungsi untuk menghitung nilai rata-rata aritmetika dari sekumpulan nilai data numerik dalam rentang sel (misal: =AVERAGE(B2:B10)).\n2) MAX: Berfungsi untuk mencari dan mengembalikan nilai angka tertinggi (terbesar) dari sekumpulan data.\n3) MIN: Berfungsi untuk mencari dan mengembalikan nilai angka terendah (terkecil) dari sekumpulan data.\n(Alternatif fungsi lainnya:)\n- LARGE: Berfungsi mencari nilai terbesar pada posisi urutan tertentu (peringkat ke-k), misalnya mencari nilai tertinggi ke-2 atau ke-3.\n- SMALL: Berfungsi mencari nilai terkecil pada urutan ke-k dari sekumpulan data numerik.",
    keywords: ["average", "max", "min", "small", "large", "rata-rata", "tertinggi", "terbesar", "terendah", "terkecil", "urutan", "peringkat"],
    maxScore: 20,
    scoringGuide: {
      fullCriteria: "Menyebutkan 3 fungsi statistik dan menjelaskan fungsi serta cara kerjanya secara tepat dan lengkap.",
      partialCriteria: "Menyebutkan 2 fungsi statistik dengan penjelasan lengkap, atau 3 fungsi namun penjelasannya kurang rinci.",
      minimalCriteria: "Hanya menyebutkan 1 fungsi statistik."
    },
    explanation: "Menguji kompetensi siswa dalam mengolah data kuantitatif menggunakan fungsi statistik pemusatan dan sebaran data."
  },
  {
    id: 5,
    question: "Jelaskan cara kerja dan kegunaan rumus fungsi logika pada spreadsheet yaitu AND, OR, dan NOT! Jelaskan pula bagaimana kondisi nilai TRUE atau FALSE dihasilkan oleh masing-masing fungsi tersebut!",
    sampleAnswer: "Penjelasan fungsi logika pada spreadsheet:\n1) Fungsi AND: Berfungsi menguji beberapa syarat/kondisi. Menghasilkan nilai TRUE jika SEMUA kondisi yang diuji bernilai benar. Jika ada satu saja kondisi yang salah, maka menghasilkan FALSE.\n2) Fungsi OR: Berfungsi menguji beberapa syarat/kondisi. Menghasilkan nilai TRUE jika MINIMAL SATU (salah satu) kondisi bernilai benar. Hanya menghasilkan FALSE jika semua kondisi bernilai salah.\n3) Fungsi NOT: Berfungsi membalikkan nilai logika suatu kondisi. Jika kondisi bernilai TRUE maka diubah menjadi FALSE, dan sebaliknya jika kondisi bernilai FALSE maka diubah menjadi TRUE.",
    keywords: ["and", "or", "not", "true", "false", "semua", "salah satu", "minimal satu", "membalikkan", "kondisi", "logika", "benar", "salah"],
    maxScore: 20,
    scoringGuide: {
      fullCriteria: "Menjelaskan ketiga fungsi logika (AND, OR, NOT) secara lengkap beserta aturan penghasilan nilai TRUE dan FALSE.",
      partialCriteria: "Menjelaskan 2 fungsi logika dengan benar.",
      minimalCriteria: "Hanya menjelaskan 1 fungsi atau penjelasan aturan logika kurang tepat."
    },
    explanation: "Menguji logika berpikir komputasional dalam pengambilan keputusan berdasar ekspresi boolean pada lembar kerja."
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

  // Khusus Soal No. 3: SUM, COUNT, COUNTA, SUMIF, COUNTIF
  if (questionId === 3) {
    const hasSum = cleanedText.includes("sum") && (cleanedText.includes("jumlah") || cleanedText.includes("tambah"));
    const hasCount = cleanedText.includes("count") && (cleanedText.includes("banyak") || cleanedText.includes("hitung") || cleanedText.includes("angka"));
    const hasCounta = cleanedText.includes("counta") && (cleanedText.includes("kosong") || cleanedText.includes("teks") || cleanedText.includes("data"));
    const hasSumif = cleanedText.includes("sumif") && (cleanedText.includes("kriteria") || cleanedText.includes("syarat") || cleanedText.includes("kondisi"));
    const hasCountif = cleanedText.includes("countif") && (cleanedText.includes("kriteria") || cleanedText.includes("syarat") || cleanedText.includes("kondisi"));

    const detectedCount = [hasSum, hasCount, hasCounta, hasSumif, hasCountif].filter(Boolean).length;
    const mentionedNames = ["sum", "count", "counta", "sumif", "countif"].filter((k) => cleanedText.includes(k));

    if (detectedCount >= 4 || (mentionedNames.length === 5 && cleanedText.length > 80)) {
      return {
        score: 20,
        maxScore: 20,
        feedback: "Sangat Lengkap! Berhasil menjelaskan fungsi dasar SUM, COUNT, COUNTA, SUMIF, dan COUNTIF beserta perbedaannya dengan sangat baik.",
        matchedKeywords: mentionedNames
      };
    } else if (detectedCount >= 3 || mentionedNames.length >= 4) {
      return {
        score: 16,
        maxScore: 20,
        feedback: "Bagus! Sebagian besar fungsi dasar dijelaskan dengan tepat.",
        matchedKeywords: mentionedNames
      };
    } else if (detectedCount >= 2 || mentionedNames.length >= 2) {
      return {
        score: 12,
        maxScore: 20,
        feedback: "Cukup baik, namun beberapa rumus fungsi dasar belum dijelaskan secara menyeluruh.",
        matchedKeywords: mentionedNames
      };
    } else {
      return {
        score: 8,
        maxScore: 20,
        feedback: "Penjelasan masih terbatas pada sedikit rumus fungsi, perlu melengkapi penjelasan fungsi lainnya.",
        matchedKeywords: mentionedNames
      };
    }
  }

  // Khusus Soal No. 4: 3 Fungsi Statistik (AVERAGE, MAX, MIN, SMALL, LARGE)
  if (questionId === 4) {
    const statsFunctions = ["average", "max", "min", "small", "large"];
    const mentionedStats = statsFunctions.filter((k) => cleanedText.includes(k));
    const explainsAvg = cleanedText.includes("average") && (cleanedText.includes("rata") || cleanedText.includes("mean"));
    const explainsMax = cleanedText.includes("max") && (cleanedText.includes("tinggi") || cleanedText.includes("besar"));
    const explainsMin = cleanedText.includes("min") && (cleanedText.includes("rendah") || cleanedText.includes("kecil"));
    const explainsSmall = cleanedText.includes("small") && (cleanedText.includes("kecil") || cleanedText.includes("urutan"));
    const explainsLarge = cleanedText.includes("large") && (cleanedText.includes("besar") || cleanedText.includes("urutan"));

    const validExplanations = [explainsAvg, explainsMax, explainsMin, explainsSmall, explainsLarge].filter(Boolean).length;

    if (validExplanations >= 3 || (mentionedStats.length >= 3 && cleanedText.length > 70)) {
      return {
        score: 20,
        maxScore: 20,
        feedback: "Luar biasa! Berhasil menyebutkan 3 fungsi statistik dan menjelaskan fungsi serta cara kerjanya secara jelas.",
        matchedKeywords: mentionedStats
      };
    } else if (validExplanations >= 2 || mentionedStats.length >= 2) {
      return {
        score: 15,
        maxScore: 20,
        feedback: "Baik, sudah menjelaskan 2 fungsi statistik. Perlu melengkapi 1 fungsi statistik lagi agar nilai maksimal.",
        matchedKeywords: mentionedStats
      };
    } else if (mentionedStats.length >= 1) {
      return {
        score: 10,
        maxScore: 20,
        feedback: "Hanya menyebutkan/menjelaskan 1 fungsi statistik. Soal meminta minimal 3 jenis fungsi.",
        matchedKeywords: mentionedStats
      };
    }
  }

  // Khusus Soal No. 5: Logika AND, OR, NOT
  if (questionId === 5) {
    const hasAnd = cleanedText.includes("and");
    const hasOr = cleanedText.includes("or");
    const hasNot = cleanedText.includes("not");
    const mentionsTrueFalse = cleanedText.includes("true") || cleanedText.includes("false") || cleanedText.includes("benar") || cleanedText.includes("salah");
    const mentionsAllOrAny = cleanedText.includes("semua") || cleanedText.includes("salah satu") || cleanedText.includes("minimal") || cleanedText.includes("balik");

    const logicCount = [hasAnd, hasOr, hasNot].filter(Boolean).length;

    if (logicCount === 3 && mentionsTrueFalse && mentionsAllOrAny) {
      return {
        score: 20,
        maxScore: 20,
        feedback: "Sangat Tepat! Menjelaskan cara kerja AND (semua benar), OR (salah satu benar), dan NOT (membalikkan) serta kondisi TRUE/FALSE secara akurat.",
        matchedKeywords: ["and", "or", "not", "true/false"]
      };
    } else if (logicCount >= 2 && mentionsTrueFalse) {
      return {
        score: 15,
        maxScore: 20,
        feedback: "Baik, penjelasan konsep logika sudah cukup jelas, lengkapi penjelasan ketiga fungsinya.",
        matchedKeywords: ["and", "or", "not"].filter((k) => cleanedText.includes(k))
      };
    } else if (logicCount >= 1) {
      return {
        score: 10,
        maxScore: 20,
        feedback: "Penjelasan fungsi logika belum lengkap untuk ketiga fungsi (AND, OR, NOT).",
        matchedKeywords: ["and", "or", "not"].filter((k) => cleanedText.includes(k))
      };
    }
  }

  // Soal Konseptual No. 1 & 2
  const matched = q.keywords.filter((kw) => cleanedText.includes(kw.toLowerCase()));
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
