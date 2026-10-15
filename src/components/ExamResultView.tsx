import React, { useState } from 'react';
import { ExamSubmission } from '../types/exam';
import { 
  MULTIPLE_CHOICE_QUESTIONS, 
  ESSAY_QUESTIONS, 
  EXAM_METADATA 
} from '../data/examData';
import { 
  CheckCircle, 
  XCircle, 
  Award, 
  Clock, 
  ShieldAlert, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Printer,
  Sparkles,
  Check
} from 'lucide-react';

interface Props {
  submission: ExamSubmission;
  onReturnHome: () => void;
}

export const ExamResultView: React.FC<Props> = ({ submission, onReturnHome }) => {
  const [showDetailPg, setShowDetailPg] = useState<boolean>(true);
  const [showDetailEssay, setShowDetailEssay] = useState<boolean>(true);
  const [showViolations, setShowViolations] = useState<boolean>(false);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} menit ${s} detik`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-slate-800/80 pb-6">
            <div className="text-center sm:text-left space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Hasil Asesmen Harian Siswa
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {submission.studentName}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-mono">
                  Kelas {submission.studentClass}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-mono">
                  No/NIS: {submission.studentNumber}
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Durasi: {formatSeconds(submission.durationSeconds)}</span>
                </span>
              </div>
            </div>

            {/* Final Grade Badge */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center border shadow-xl ${
                  submission.isPassed
                    ? 'bg-gradient-to-br from-emerald-950 to-teal-900/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-gradient-to-br from-rose-950 to-red-900/60 border-rose-500/50 text-rose-300'
                }`}>
                  <span className="text-[10px] font-semibold tracking-wider uppercase opacity-80">Nilai Akhir</span>
                  <span className="text-4xl font-black font-mono tracking-tight">{submission.finalScore}</span>
                  <span className="text-[10px] opacity-70">KKM: {EXAM_METADATA.kkm}</span>
                </div>
                {submission.isPassed && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg">
                    <Award className="w-4 h-4" />
                  </div>
                )}
              </div>
              <span className={`mt-2 text-xs font-bold px-3 py-1 rounded-full border ${
                submission.isPassed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {submission.isPassed ? 'TUNTAS / LULUS' : 'PERLU REMIDIAL'}
              </span>
            </div>
          </div>

          {/* Breakdown Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6">
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Pilihan Ganda (60%)</span>
                <span className="text-2xl font-bold text-blue-400 font-mono">{submission.pgScore}</span>
                <span className="text-[11px] text-slate-400 block">
                  {submission.pgCorrectCount} dari 10 Benar
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                PG
              </div>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Uraian / Essay (40%)</span>
                <span className="text-2xl font-bold text-teal-400 font-mono">{submission.essayScore}</span>
                <span className="text-[11px] text-teal-300 block flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-teal-400 inline" />
                  <span>Dinilai Otomatis</span>
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                ES
              </div>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Catatan Integritas</span>
                <span className={`text-2xl font-bold font-mono ${
                  submission.violationCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {submission.violationCount}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {submission.violationCount === 0 ? 'Disiplin & Tertib' : 'Pelanggaran Tab/Layar'}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                submission.violationCount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Teacher Review / Notes Banner if available */}
          {submission.teacherNotes && (
            <div className="mt-5 p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/40 text-xs text-indigo-200">
              <strong className="text-indigo-300 block mb-1">Catatan Koreksi dari Guru Pengampu:</strong>
              <p className="italic">{submission.teacherNotes}</p>
            </div>
          )}
        </div>

        {/* Violations Log Collapsible if any */}
        {submission.violations.length > 0 && (
          <div className="bg-slate-900 border border-rose-900/40 rounded-2xl overflow-hidden shadow-lg">
            <button
              onClick={() => setShowViolations(!showViolations)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                <ShieldAlert className="w-4 h-4" />
                <span>Rincian Log Pelanggaran Anti-Kecurangan ({submission.violations.length} Kejadian)</span>
              </div>
              {showViolations ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {showViolations && (
              <div className="p-5 border-t border-slate-800 space-y-2 bg-slate-950/60 text-xs">
                {submission.violations.map((v, i) => (
                  <div key={v.id || i} className="p-3 bg-rose-950/20 border border-rose-800/30 rounded-xl flex items-start space-x-3 text-slate-300">
                    <span className="font-mono text-rose-400 font-bold">{v.formattedTime}</span>
                    <div className="flex-1">
                      <span className="font-semibold text-rose-200 block">{v.message}</span>
                      {v.questionNumber && (
                        <span className="text-[11px] text-slate-400">Saat mengerjakan soal nomor {v.questionNumber}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEW SOAL PILIHAN GANDA (10 Soal) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <button
            onClick={() => setShowDetailPg(!showDetailPg)}
            className="w-full flex items-center justify-between text-left pb-3 border-b border-slate-800"
          >
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>Rincian Evaluasi Pilihan Ganda (10 Soal)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-normal">
                  {submission.pgCorrectCount}/10 Benar
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kunci jawaban dan pembahasan konsep lembar kerja
              </p>
            </div>
            {showDetailPg ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showDetailPg && (
            <div className="divide-y divide-slate-800/80 mt-4 space-y-4 pt-2">
              {MULTIPLE_CHOICE_QUESTIONS.map((q, idx) => {
                const studentAns = submission.answers.pg[q.id];
                const isCorrect = studentAns === q.correctAnswer;

                return (
                  <div key={q.id} className="pt-4 first:pt-0 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-2.5">
                        <span className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                          isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="text-sm font-medium text-slate-200">
                          {q.question}
                        </div>
                      </div>
                      {isCorrect ? (
                        <div className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold flex-shrink-0">
                          <CheckCircle className="w-4 h-4" />
                          <span>Benar (+10)</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-rose-400 text-xs font-semibold flex-shrink-0">
                          <XCircle className="w-4 h-4" />
                          <span>Salah (0)</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pl-8">
                      <div className={`p-2.5 rounded-lg border ${
                        studentAns
                          ? isCorrect
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                            : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400'
                      }`}>
                        <span className="block text-[10px] uppercase font-semibold text-slate-400">Jawaban Anda:</span>
                        <span className="font-bold">
                          {studentAns ? `${studentAns}. ${q.options.find(o => o.key === studentAns)?.text || ''}` : '(Tidak Dijawab)'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg border bg-blue-950/30 border-blue-500/30 text-blue-200">
                        <span className="block text-[10px] uppercase font-semibold text-blue-400">Kunci Jawaban:</span>
                        <span className="font-bold">
                          {q.correctAnswer}. {q.options.find(o => o.key === q.correctAnswer)?.text || ''}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-800/40 rounded-xl p-3 text-xs text-slate-300 ml-8 border border-slate-700/40">
                      <span className="text-blue-400 font-semibold block text-[11px]">Pembahasan:</span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* REVIEW SOAL ESSAY (5 Soal) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <button
            onClick={() => setShowDetailEssay(!showDetailEssay)}
            className="w-full flex items-center justify-between text-left pb-3 border-b border-slate-800"
          >
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>Rincian Evaluasi Jawaban Uraian (5 Soal Essay)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-normal">
                  Skor: {submission.essayScore}/100
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Penilaian otomatis sistem berdasarkan rubrik konsep dan pembuktian hitungan
              </p>
            </div>
            {showDetailEssay ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showDetailEssay && (
            <div className="divide-y divide-slate-800/80 mt-4 space-y-5 pt-2">
              {ESSAY_QUESTIONS.map((q, idx) => {
                const studentText = submission.answers.essay[q.id] || '';
                const evaluation = submission.essayEvaluations.find((e) => e.questionId === q.id);

                return (
                  <div key={q.id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-2.5">
                        <span className="w-6 h-6 rounded-md bg-teal-600/20 text-teal-400 border border-teal-500/30 flex-shrink-0 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <div className="text-sm font-medium text-slate-200 whitespace-pre-line">
                          {q.question}
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-teal-950/60 border border-teal-500/40 text-teal-300 font-mono font-bold text-xs flex-shrink-0">
                        Skor: {evaluation ? evaluation.finalScore : 0} / {q.maxScore}
                      </div>
                    </div>

                    <div className="pl-8 space-y-2">
                      <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 text-xs">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">
                          Jawaban Anda:
                        </span>
                        <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                          {studentText.trim() ? studentText : <span className="italic text-slate-500">(Tidak ada jawaban yang diketik)</span>}
                        </p>
                      </div>

                      <div className="bg-teal-950/30 rounded-xl p-3 border border-teal-700/30 text-xs text-teal-200">
                        <div className="flex items-center space-x-1.5 font-semibold text-teal-400 mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Umpan Balik & Analisis Otomatis:</span>
                        </div>
                        <p>{evaluation?.autoFeedback || 'Tidak ada evaluasi otomatis.'}</p>
                      </div>

                      <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40 text-xs text-slate-300">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">
                          Kunci Jawaban Model / Pedoman Penskoran:
                        </span>
                        <p className="text-slate-300 whitespace-pre-line">{q.sampleAnswer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-8">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF Rekap</span>
          </button>

          <button
            type="button"
            onClick={onReturnHome}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Kembali ke Halaman Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
