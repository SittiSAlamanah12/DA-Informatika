import React, { useState } from 'react';
import { ShieldAlert, BookOpen, Clock, AlertTriangle, CheckCircle, Lock, GraduationCap, ChevronRight } from 'lucide-react';
import { EXAM_METADATA } from '../data/examData';

interface Props {
  onStartExam: (studentData: { name: string; studentClass: string; studentNumber: string }) => void;
  onOpenAdminLogin: () => void;
}

export const StudentRegisterModal: React.FC<Props> = ({ onStartExam, onOpenAdminLogin }) => {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('VII Academic');
  const [studentNumber, setStudentNumber] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const classOptions = [
    'VII Academic',
    'VII Cambridge',
    'VII Cambridge (7.3)',
    'VII Tahfidz',
    'VII Tahfidz Timur Tengah'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama lengkap siswa wajib diisi!');
      return;
    }
    if (!studentNumber.trim()) {
      setErrorMsg('Nomor Absen / NIS wajib diisi!');
      return;
    }
    if (!hasAgreed) {
      setErrorMsg('Anda harus menyetujui pakta integritas dan aturan ujian sebelum memulai.');
      return;
    }

    setErrorMsg('');
    onStartExam({
      name: name.trim(),
      studentClass,
      studentNumber: studentNumber.trim()
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2 border-b border-indigo-800/40 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">Sistem CBT Asesmen Sekolah</span>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">SMP Arrohmah Putri IIBS</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAdminLogin}
          className="flex items-center space-x-2 text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white px-3.5 py-2 rounded-lg border border-slate-700 transition shadow-sm"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Mode Guru / Admin</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Exam Info & Security Notice */}
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mata Pelajaran: {EXAM_METADATA.subject} ({EXAM_METADATA.grade})</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {EXAM_METADATA.title} 1
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              {EXAM_METADATA.chapter}
            </p>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
              <span className="text-xs text-slate-400 block mb-1">Pilihan Ganda</span>
              <span className="text-xl font-bold text-blue-400">{EXAM_METADATA.totalPg} Soal</span>
              <span className="text-[10px] text-slate-500 block">Bobot 60%</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
              <span className="text-xs text-slate-400 block mb-1">Soal Uraian (Essay)</span>
              <span className="text-xl font-bold text-emerald-400">{EXAM_METADATA.totalEssay} Soal</span>
              <span className="text-[10px] text-slate-500 block">Bobot 40%</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
              <span className="text-xs text-slate-400 block mb-1">Durasi Waktu</span>
              <span className="text-xl font-bold text-amber-400">{EXAM_METADATA.durationMinutes} Menit</span>
              <span className="text-[10px] text-slate-500 block">KKM: {EXAM_METADATA.kkm}</span>
            </div>
          </div>

          {/* Security Alert Box */}
          <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-4 text-xs space-y-2.5 text-amber-200">
            <div className="flex items-center space-x-2 font-semibold text-amber-400">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>Sistem Proteksi Keamanan Ujian (Anti-Cheating) Aktif:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Layar akan <strong className="text-amber-200">terkunci penuh (Fullscreen)</strong> secara otomatis saat ujian dimulai.</li>
              <li>Dilarang <strong className="text-amber-200">berpindah tab browser, membuka Google, AI, atau aplikasi lain</strong>. Setiap pergantian jendela akan dicatat ke log pelanggaran sistem server.</li>
              <li>Fitur <strong className="text-amber-200">Copy, Paste, Klik Kanan, dan Pintasan Keyboard</strong> dinonaktifkan demi integritas ujian.</li>
              <li>Jika terdeteksi melanggar sebanyak <strong className="text-amber-200">{EXAM_METADATA.maxViolationsAllowed} kali</strong>, ujian akan diselesaikan paksa secara otomatis.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Student Registration Form */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-indigo-800/50 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
          <div className="border-b border-slate-800 pb-4 mb-5">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Identitas Peserta Ujian</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Masukkan data diri dengan benar sebelum memulai pengerjaan soal.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-950/50 border border-rose-500/50 rounded-lg flex items-center space-x-2 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nama Lengkap Siswa <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Muhammad Budi Pratama"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kelas <span className="text-rose-400">*</span>
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                >
                  {classOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-900 text-white py-1">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  No. Absen / NIS <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="Contoh: 14 atau 20240701"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
            </div>

            {/* Pakta Integritas Checkbox */}
            <div className="pt-2">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800"
                />
                <span className="text-xs text-slate-300 leading-snug group-hover:text-white transition">
                  Saya menyatakan akan mengerjakan asesmen ini secara jujur dan mandiri, serta bersedia mematuhi penguncian layar dan deteksi anti-kecurangan.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition transform active:scale-[0.99]"
            >
              <span>Mulai Ujian Sekarang (Kunci Layar)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs text-slate-500 py-3 border-t border-slate-800/60">
        Asesmen Formatif & Sumatif Kurikulum Merdeka SMP — Modul Informatika Bab 1 Berpikir Komputasional
      </footer>
    </div>
  );
};
