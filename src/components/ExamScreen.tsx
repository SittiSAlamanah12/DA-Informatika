import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MULTIPLE_CHOICE_QUESTIONS, 
  ESSAY_QUESTIONS, 
  EXAM_METADATA, 
  autoGradeEssay 
} from '../data/examData';
import { 
  ExamSubmission, 
  StudentAnswers, 
  ViolationLog, 
  EssayEvaluation 
} from '../types/exam';
import { ApiService } from '../services/apiService';
import { 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Menu, 
  X, 
  Send, 
  HelpCircle,
  FileText
} from 'lucide-react';

interface Props {
  student: {
    name: string;
    studentClass: string;
    studentNumber: string;
  };
  onFinishExam: (submission: ExamSubmission) => void;
}

export const ExamScreen: React.FC<Props> = ({ student, onFinishExam }) => {
  // Navigation & Answers State
  const [currentSection, setCurrentSection] = useState<'PG' | 'ESSAY'>('PG');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
  const [answers, setAnswers] = useState<StudentAnswers>({
    pg: {},
    essay: {},
    markedDoubtful: {}
  });

  // Time & Session
  const [timeLeft, setTimeLeft] = useState<number>(EXAM_METADATA.durationMinutes * 60);
  const startedAtRef = useRef<string>(new Date().toISOString());
  const submissionIdRef = useRef<string>(`sub-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`);

  // Anti-cheating & Violations
  const [violations, setViolations] = useState<ViolationLog[]>([]);
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
  const [latestViolationMessage, setLatestViolationMessage] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [showNavDrawer, setShowNavDrawer] = useState<boolean>(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sound / Audio alert synthesizer (without external assets)
  const playAlertSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // Audio context might be restricted
    }
  }, []);

  // Record a violation event to local state and send to server
  const recordViolation = useCallback((type: ViolationLog['type'], message: string) => {
    const now = new Date();
    const formatted = now.toLocaleTimeString('id-ID', { hour12: false });
    const currentQNum = currentSection === 'PG' ? currentQuestionIndex + 1 : currentQuestionIndex + 11;

    const newViolation: ViolationLog = {
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now.toISOString(),
      formattedTime: formatted,
      type,
      message,
      questionNumber: currentQNum
    };

    setViolations((prev) => {
      const updated = [...prev, newViolation];
      // Sync with server immediately
      ApiService.logViolation(
        submissionIdRef.current,
        student.name,
        student.studentClass,
        newViolation
      );

      // Check max violations exceeded
      if (updated.length >= EXAM_METADATA.maxViolationsAllowed) {
        // Trigger auto submit
        triggerSubmission('AUTO_SUBMITTED_VIOLATIONS');
      }

      return updated;
    });

    setLatestViolationMessage(message);
    setShowViolationModal(true);
    playAlertSound();
  }, [currentSection, currentQuestionIndex, student]);

  // Request Fullscreen on mount
  const enterFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    }
  }, []);

  useEffect(() => {
    enterFullscreen();

    // Fullscreen change listener
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        recordViolation('FULLSCREEN_EXIT', 'Peserta keluar dari mode layar penuh (Fullscreen Exit)!');
      }
    };

    // Tab switch / visibility listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordViolation('TAB_SWITCH', 'Peserta terdeteksi berpindah tab browser atau meminimalkan aplikasi ujian!');
      }
    };

    // Window blur listener (switching to another app or floating window)
    const handleWindowBlur = () => {
      // Only trigger if not already hidden to avoid double penalty
      if (document.visibilityState === 'visible') {
        recordViolation('WINDOW_BLUR', 'Peserta terdeteksi beralih fokus ke jendela atau aplikasi lain di luar browser!');
      }
    };

    // Prevent key combinations (Ctrl+C, Ctrl+V, F12, Alt+Tab warning, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'a' || e.key === 's')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'v')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        recordViolation('COPY_PASTE_ATTEMPT', `Pintasan keyboard dilarang (${e.key.toUpperCase()}) terdeteksi!`);
      }
    };

    // Context menu disable
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [enterFullscreen, recordViolation]);

  // Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerSubmission('AUTO_SUBMITTED_TIMEOUT');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Submit and Calculate Scores
  const triggerSubmission = async (status: ExamSubmission['status'] = 'SUBMITTED') => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const finishedAt = new Date().toISOString();
    const durationSeconds = Math.max(
      1,
      Math.floor((new Date(finishedAt).getTime() - new Date(startedAtRef.current).getTime()) / 1000)
    );

    // 1. Calculate Multiple Choice Score
    let pgCorrectCount = 0;
    MULTIPLE_CHOICE_QUESTIONS.forEach((q) => {
      if (answers.pg[q.id] === q.correctAnswer) {
        pgCorrectCount++;
      }
    });
    // PG score (0 - 100)
    const pgScore = Math.round((pgCorrectCount / MULTIPLE_CHOICE_QUESTIONS.length) * 100);

    // 2. Auto-grade Essay questions with rubric
    const essayEvaluations: EssayEvaluation[] = ESSAY_QUESTIONS.map((q) => {
      const studentText = answers.essay[q.id] || '';
      const result = autoGradeEssay(q.id, studentText);
      return {
        questionId: q.id,
        autoScore: result.score,
        finalScore: result.score,
        maxScore: q.maxScore,
        autoFeedback: result.feedback
      };
    });

    const totalEssayEarned = essayEvaluations.reduce((sum, item) => sum + item.finalScore, 0);
    const totalEssayMax = ESSAY_QUESTIONS.reduce((sum, item) => sum + item.maxScore, 0);
    const essayScore = Math.round((totalEssayEarned / totalEssayMax) * 100);

    // 3. Weighted Final Score: 60% PG + 40% Essay
    const weightedScore = Math.round((pgScore * 0.6) + (essayScore * 0.4));
    const isPassed = weightedScore >= EXAM_METADATA.kkm;

    const submission: ExamSubmission = {
      id: submissionIdRef.current,
      studentName: student.name,
      studentClass: student.studentClass,
      studentNumber: student.studentNumber,
      startedAt: startedAtRef.current,
      finishedAt,
      durationSeconds,
      answers,
      pgCorrectCount,
      pgScore,
      essayScore,
      finalScore: weightedScore,
      isPassed,
      essayEvaluations,
      violations,
      violationCount: violations.length,
      status,
      reviewedByTeacher: false
    };

    // Save to server & local persistence
    await ApiService.saveSubmission(submission);

    // Exit fullscreen cleanly
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    onFinishExam(submission);
  };

  // Multiple Choice Handlers
  const handleSelectOption = (qId: number, key: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({
      ...prev,
      pg: { ...prev.pg, [qId]: key }
    }));
  };

  const handleToggleDoubtful = (qId: number) => {
    setAnswers((prev) => ({
      ...prev,
      markedDoubtful: {
        ...prev.markedDoubtful,
        [qId]: !prev.markedDoubtful?.[qId]
      }
    }));
  };

  // Essay Handler
  const handleEssayChange = (qId: number, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      essay: { ...prev.essay, [qId]: text }
    }));
  };

  // Question navigation helpers
  const currentPgQuestion = MULTIPLE_CHOICE_QUESTIONS[currentQuestionIndex];
  const currentEssayQuestion = ESSAY_QUESTIONS[currentQuestionIndex];

  const totalAnsweredCount =
    Object.keys(answers.pg).length +
    Object.values(answers.essay).filter((txt) => txt.trim().length > 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none relative overflow-x-hidden">
      {/* Top Warning Banner if Screen is NOT Fullscreen */}
      {!isFullscreen && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 animate-pulse shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>PERINGATAN: Anda sedang berada di luar mode layar penuh! Segera kunci kembali layar untuk melanjutkan ujian.</span>
          </div>
          <button
            onClick={enterFullscreen}
            className="bg-white text-rose-700 hover:bg-rose-50 px-3 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Kembali ke Layar Penuh</span>
          </button>
        </div>
      )}

      {/* Primary Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-blue-400 font-medium">Asesmen Harian Informatika • Kelas VII</div>
            <div className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span>{student.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {student.studentClass} ({student.studentNumber})
              </span>
            </div>
          </div>
        </div>

        {/* Center: Timer & Violations Counter */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Violations Badge */}
          <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 ${
            violations.length === 0
              ? 'bg-slate-800/80 border-slate-700 text-slate-300'
              : 'bg-rose-950/60 border-rose-600 text-rose-300 animate-pulse'
          }`}>
            <ShieldAlert className={`w-4 h-4 ${violations.length > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Pelanggaran:</span>
            <span className="font-mono font-bold text-sm">{violations.length}</span>
            <span className="text-slate-400 text-[10px]">/{EXAM_METADATA.maxViolationsAllowed}</span>
          </div>

          {/* Timer Clock */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-2 ${
            timeLeft < 300 
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-bounce' 
              : 'bg-blue-950/60 border-blue-600 text-blue-300'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="text-sm sm:text-base">{formatTime(timeLeft)}</span>
          </div>

          {/* Toggle Question List Drawer */}
          <button
            onClick={() => setShowNavDrawer(!showNavDrawer)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Daftar Soal"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6 relative">
        {/* Left: Current Question Box */}
        <main className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            {/* Question Top Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
                  {currentSection === 'PG' ? 'Pilihan Ganda' : 'Uraian / Essay'}
                </span>
                <span className="text-sm font-semibold text-slate-300">
                  Nomor {currentSection === 'PG' ? currentQuestionIndex + 1 : currentQuestionIndex + 11} dari 15
                </span>
              </div>

              {currentSection === 'PG' && currentPgQuestion && (
                <button
                  type="button"
                  onClick={() => handleToggleDoubtful(currentPgQuestion.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center space-x-1.5 transition ${
                    answers.markedDoubtful?.[currentPgQuestion.id]
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Ragu-Ragu</span>
                </button>
              )}
            </div>

            {/* Question Content */}
            {currentSection === 'PG' && currentPgQuestion && (
              <div className="space-y-6">
                <div className="text-base sm:text-lg font-medium text-slate-100 whitespace-pre-line leading-relaxed">
                  {currentPgQuestion.question}
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentPgQuestion.options.map((opt) => {
                    const isSelected = answers.pg[currentPgQuestion.id] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectOption(currentPgQuestion.id, opt.key)}
                        className={`w-full text-left p-4 rounded-xl border transition flex items-center space-x-4 ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {opt.key}
                        </div>
                        <span className="text-sm sm:text-base leading-snug">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentSection === 'ESSAY' && currentEssayQuestion && (
              <div className="space-y-6">
                <div className="text-base sm:text-lg font-medium text-slate-100 whitespace-pre-line leading-relaxed">
                  {currentEssayQuestion.question}
                </div>

                {/* Optional Table Data rendering for questions 3, 4, 5 */}
                {currentEssayQuestion.tableData && (
                  <div className="my-4 overflow-x-auto rounded-xl border border-indigo-700/40 bg-slate-800/80 p-3 shadow-inner">
                    {currentEssayQuestion.tableData.caption && (
                      <div className="text-xs font-semibold text-indigo-300 mb-2 uppercase tracking-wide">
                        {currentEssayQuestion.tableData.caption}
                      </div>
                    )}
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-indigo-900/60 text-indigo-200 border-b border-indigo-700/50">
                          {currentEssayQuestion.tableData.headers.map((h, i) => (
                            <th key={i} className="py-2.5 px-3 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/60">
                        {currentEssayQuestion.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-700/40 transition">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-2 px-3 text-slate-200 font-mono">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Essay Textarea */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-indigo-300">
                      Tuliskan Jawaban Uraian Anda:
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {(answers.essay[currentEssayQuestion.id] || '').length} karakter
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={answers.essay[currentEssayQuestion.id] || ''}
                    onChange={(e) => handleEssayChange(currentEssayQuestion.id, e.target.value)}
                    placeholder="Ketikkan analisis, rumus, dan penjelasan lengkap di sini..."
                    className="w-full bg-slate-800/90 border border-slate-700 focus:border-blue-500 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-sans"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    * Jawaban akan dinilai otomatis berdasarkan rubrik pemahaman konsep dan kata kunci utama.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bottom Controls */}
          <div className="border-t border-slate-800 pt-5 mt-8 flex items-center justify-between flex-wrap gap-3">
            {/* Previous Button */}
            <button
              type="button"
              disabled={currentSection === 'PG' && currentQuestionIndex === 0}
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex((prev) => prev - 1);
                } else if (currentSection === 'ESSAY') {
                  setCurrentSection('PG');
                  setCurrentQuestionIndex(MULTIPLE_CHOICE_QUESTIONS.length - 1);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold flex items-center space-x-2 border border-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Next or Submit Button */}
            {currentSection === 'ESSAY' && currentQuestionIndex === ESSAY_QUESTIONS.length - 1 ? (
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition transform active:scale-95"
              >
                <span>Kumpulkan Asesmen</span>
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (currentSection === 'PG') {
                    if (currentQuestionIndex < MULTIPLE_CHOICE_QUESTIONS.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                    } else {
                      setCurrentSection('ESSAY');
                      setCurrentQuestionIndex(0);
                    }
                  } else {
                    if (currentQuestionIndex < ESSAY_QUESTIONS.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                    }
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-md shadow-blue-500/20 transition"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>

        {/* Right / Sidebar: Question Navigation Grid (Desktop & Mobile Drawer) */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-80 bg-slate-900 border-l border-slate-800 p-5 shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-72 lg:border lg:rounded-2xl lg:shadow-xl lg:z-0 ${
            showNavDrawer ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white">Lembar Navigasi Soal</h3>
            <button
              onClick={() => setShowNavDrawer(false)}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-400 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
              <span>Terjawab</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span>Ragu</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span>
              <span>Kosong</span>
            </div>
          </div>

          <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
            {/* Bagian Pilihan Ganda (10 Soal) */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Pilihan Ganda (10 Soal)
              </div>
              <div className="grid grid-cols-5 gap-2">
                {MULTIPLE_CHOICE_QUESTIONS.map((q, idx) => {
                  const isAnswered = !!answers.pg[q.id];
                  const isDoubtful = !!answers.markedDoubtful?.[q.id];
                  const isCurrent = currentSection === 'PG' && currentQuestionIndex === idx;

                  let bgColor = 'bg-slate-800 text-slate-400 border-slate-700';
                  if (isAnswered) bgColor = 'bg-blue-600 text-white border-blue-500';
                  if (isDoubtful) bgColor = 'bg-amber-500 text-slate-950 font-bold border-amber-400';

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentSection('PG');
                        setCurrentQuestionIndex(idx);
                        setShowNavDrawer(false);
                      }}
                      className={`h-9 rounded-lg font-mono font-bold text-xs flex items-center justify-center border transition relative ${bgColor} ${
                        isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                      {isAnswered && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bagian Essay (5 Soal) */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Uraian / Essay (5 Soal)
              </div>
              <div className="grid grid-cols-5 gap-2">
                {ESSAY_QUESTIONS.map((q, idx) => {
                  const hasAnswer = (answers.essay[q.id] || '').trim().length > 0;
                  const isCurrent = currentSection === 'ESSAY' && currentQuestionIndex === idx;

                  let bgColor = hasAnswer
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700';

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentSection('ESSAY');
                        setCurrentQuestionIndex(idx);
                        setShowNavDrawer(false);
                      }}
                      className={`h-9 rounded-lg font-mono font-bold text-xs flex items-center justify-center border transition relative ${bgColor} ${
                        isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : ''
                      }`}
                    >
                      {idx + 11}
                      {hasAnswer && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Submit button at sidebar bottom */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 mb-2 flex justify-between">
              <span>Progres Pengerjaan:</span>
              <span className="font-bold text-white">{totalAnsweredCount} / 15</span>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmSubmit(true)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Selesaikan Ujian
            </button>
          </div>
        </aside>
      </div>

      {/* POPUP PERINGATAN PELANGGARAN ANTI-KECURANGAN */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/40 flex items-center justify-center mx-auto animate-bounce">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-black text-rose-400 tracking-tight">
              PERINGATAN PELANGGARAN TERDETEKSI!
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {latestViolationMessage}
            </p>

            <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-200">
              <span className="block font-bold">
                Pelanggaran Ke-{violations.length} Dari Batas Maksimal {EXAM_METADATA.maxViolationsAllowed} Kali
              </span>
              <span className="text-[11px] text-slate-300 block mt-1">
                Waktu & aktivitas Anda telah dicatat ke dalam log pengawas guru secara real-time. Jika mencapai batas maksimal, ujian akan otomatis diselesaikan dan diserahkan.
              </span>
            </div>

            <button
              onClick={() => {
                setShowViolationModal(false);
                enterFullscreen();
              }}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition transform active:scale-95"
            >
              Saya Mengerti & Kembali Mengerjakan
            </button>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI PENGUMPULAN UJIAN */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-white">Konfirmasi Pengumpulan</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menyelesaikan dan mengumpulkan hasil ujian ini?
            </p>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Soal Pilihan Ganda:</span>
                <span className="font-bold text-white">
                  {Object.keys(answers.pg).length} / {MULTIPLE_CHOICE_QUESTIONS.length} Terjawab
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Soal Uraian (Essay):</span>
                <span className="font-bold text-white">
                  {Object.values(answers.essay).filter((t) => t.trim().length > 0).length} / {ESSAY_QUESTIONS.length} Terjawab
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Pelanggaran Tercatat:</span>
                <span className={`font-bold ${violations.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {violations.length} kali
                </span>
              </div>
            </div>

            {totalAnsweredCount < 15 && (
              <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-lg p-2.5">
                ⚠️ Perhatian: Anda masih memiliki {15 - totalAnsweredCount} soal yang belum diisi. Soal kosong akan mendapat nilai 0.
              </p>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => triggerSubmission('SUBMITTED')}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-1.5"
              >
                {isSubmitting ? (
                  <span>Menilai...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Ya, Kumpulkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
