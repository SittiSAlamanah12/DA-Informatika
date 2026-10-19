import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ExamSubmission, ExamStats, EssayEvaluation, ActiveExamStudent, LiveRealtimeNotification } from '../types/exam';
import { 
  MULTIPLE_CHOICE_QUESTIONS, 
  ESSAY_QUESTIONS, 
  EXAM_METADATA 
} from '../data/examData';
import { ApiService } from '../services/apiService';
import { 
  Users, 
  Award, 
  ShieldAlert, 
  TrendingUp, 
  Download, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  RefreshCw, 
  BookOpen, 
  AlertTriangle,
  Sparkles,
  Save,
  Cloud,
  X,
  Radio,
  Volume2,
  VolumeX,
  Activity,
  Bell
} from 'lucide-react';
import { GoogleDriveSyncPanel } from './GoogleDriveSyncPanel';

interface Props {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'REKAP' | 'BANK_SOAL' | 'AUDIT_PELANGGARAN' | 'GOOGLE_DRIVE'>('REKAP');
  
  // Realtime Live Sync State
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(true);
  const [activeStudents, setActiveStudents] = useState<ActiveExamStudent[]>([]);
  const [recentSubmittedId, setRecentSubmittedId] = useState<string | null>(null);
  const [liveNotifications, setLiveNotifications] = useState<LiveRealtimeNotification[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString('id-ID'));
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'SCORE_DESC' | 'SCORE_ASC' | 'NAME' | 'VIOLATIONS' | 'DATE'>('DATE');

  // Selected Submission for Detail / Manual Grading Modal
  const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null);
  const [editingScores, setEditingScores] = useState<{ [qId: number]: number }>({});
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [savingGrade, setSavingGrade] = useState<boolean>(false);

  // Sound chime synthesizer on new submission or event
  const playSubmissionSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio context restricted or unavailable
    }
  }, [soundEnabled]);

  // Push floating notification toast
  const addNotification = useCallback((notif: LiveRealtimeNotification) => {
    setLiveNotifications((prev) => [notif, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setLiveNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 6000);
  }, []);

  // Load Submissions and Active Students
  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const [data, actives] = await Promise.all([
        ApiService.getSubmissions(),
        ApiService.getActiveStudents()
      ]);
      setSubmissions(data);
      setActiveStudents(actives);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Real-time EventSource Subscription + Fallback Polling
  useEffect(() => {
    loadSubmissions();

    // Subscribe to SSE Real-time stream
    const unsubscribe = ApiService.subscribeToRealtimeStream(
      (eventType: string, data: any) => {
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));

        if (eventType === 'CONNECTED') {
          setRealtimeConnected(true);
        }

        if (eventType === 'STUDENT_STARTED') {
          setActiveStudents((prev) => {
            const exists = prev.some((s) => s.submissionId === data.submissionId);
            if (exists) return prev;
            return [data, ...prev];
          });
          addNotification({
            id: `start-${Date.now()}-${Math.random()}`,
            type: 'STARTED',
            title: 'Siswa Mulai Mengerjakan',
            message: `${data.studentName} (${data.studentClass}) telah membuka lembar ujian.`,
            timestamp: new Date().toLocaleTimeString('id-ID'),
            studentName: data.studentName
          });
        }

        if (eventType === 'STUDENT_PROGRESS') {
          setActiveStudents((prev) => {
            const idx = prev.findIndex((s) => s.submissionId === data.submissionId);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...data };
              return copy;
            }
            return [data, ...prev];
          });
        }

        if (eventType === 'SUBMISSION_CREATED') {
          const newSub: ExamSubmission = data.submission;
          setSubmissions((prev) => {
            const exists = prev.some((s) => s.id === newSub.id);
            if (exists) {
              return prev.map((s) => (s.id === newSub.id ? newSub : s));
            }
            return [newSub, ...prev];
          });

          // Remove from active students
          setActiveStudents((prev) => prev.filter((s) => s.submissionId !== newSub.id));
          
          // Highlight this submission in table
          setRecentSubmittedId(newSub.id);
          setTimeout(() => setRecentSubmittedId(null), 8000);

          playSubmissionSound();
          addNotification({
            id: `sub-${Date.now()}-${Math.random()}`,
            type: 'SUBMISSION',
            title: '🔔 Hasil Ujian Masuk (Realtime)!',
            message: `${newSub.studentName} (${newSub.studentClass}) mengumpulkan ujian. Nilai: ${newSub.finalScore} (${newSub.isPassed ? 'TUNTAS KKM' : 'REMIDI'})`,
            timestamp: new Date().toLocaleTimeString('id-ID'),
            studentName: newSub.studentName,
            score: newSub.finalScore
          });
        }

        if (eventType === 'VIOLATION_LOGGED') {
          setSubmissions((prev) => {
            return prev.map((s) => {
              if (s.id === data.submissionId) {
                const violations = s.violations ? [...s.violations, data.violation] : [data.violation];
                return {
                  ...s,
                  violations,
                  violationCount: violations.length
                };
              }
              return s;
            });
          });

          addNotification({
            id: `viol-${Date.now()}-${Math.random()}`,
            type: 'VIOLATION',
            title: '⚠️ Pelanggaran Terdeteksi!',
            message: `${data.studentName} (${data.studentClass}): ${data.violation?.message || data.violation?.type}`,
            timestamp: new Date().toLocaleTimeString('id-ID'),
            studentName: data.studentName
          });
        }

        if (eventType === 'SUBMISSION_UPDATED') {
          setSubmissions((prev) => prev.map((s) => (s.id === data.submission.id ? data.submission : s)));
        }

        if (eventType === 'SUBMISSION_DELETED') {
          setSubmissions((prev) => prev.filter((s) => s.id !== data.id));
          setActiveStudents((prev) => prev.filter((s) => s.submissionId !== data.id));
        }

        if (eventType === 'SUBMISSIONS_RESET') {
          setSubmissions(data.data || []);
          setActiveStudents([]);
        }
      },
      (isConnected: boolean) => {
        setRealtimeConnected(isConnected);
      }
    );

    // Fallback polling every 8s in case SSE is interrupted or behind proxies
    const pollingInterval = setInterval(async () => {
      try {
        const [data, actives] = await Promise.all([
          ApiService.getSubmissions(),
          ApiService.getActiveStudents()
        ]);
        if (Array.isArray(data)) setSubmissions(data);
        if (Array.isArray(actives)) setActiveStudents(actives);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      } catch (e) {
        // Non-blocking
      }
    }, 8000);

    return () => {
      unsubscribe();
      clearInterval(pollingInterval);
    };
  }, [playSubmissionSound, addNotification]);

  // Compute Overall Stats
  const stats: ExamStats = useMemo(() => {
    if (submissions.length === 0) {
      return {
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passCount: 0,
        failCount: 0,
        passPercentage: 0,
        totalViolationsRecorded: 0,
        studentsWithViolations: 0
      };
    }

    const scores = submissions.map((s) => s.finalScore);
    const sum = scores.reduce((a, b) => a + b, 0);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passCount = submissions.filter((s) => s.isPassed).length;
    const failCount = submissions.length - passCount;
    const passPercentage = Math.round((passCount / submissions.length) * 100);

    let totalViolations = 0;
    let violationStudents = 0;
    submissions.forEach((s) => {
      totalViolations += s.violationCount || 0;
      if (s.violationCount > 0) violationStudents++;
    });

    return {
      totalSubmissions: submissions.length,
      averageScore: Math.round(sum / submissions.length),
      highestScore: highest,
      lowestScore: lowest,
      passCount,
      failCount,
      passPercentage,
      totalViolationsRecorded: totalViolations,
      studentsWithViolations: violationStudents
    };
  }, [submissions]);

  // Unique Classes in submissions
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.studentClass) set.add(s.studentClass);
    });
    return Array.from(set).sort();
  }, [submissions]);

  // Filtered & Sorted Submissions
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    // Filter by class
    if (selectedClass !== 'ALL') {
      result = result.filter((s) => s.studentClass === selectedClass);
    }

    // Filter by status
    if (selectedStatus === 'PASSED') {
      result = result.filter((s) => s.isPassed);
    } else if (selectedStatus === 'FAILED') {
      result = result.filter((s) => !s.isPassed);
    } else if (selectedStatus === 'VIOLATIONS') {
      result = result.filter((s) => s.violationCount > 0);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          (s.studentNumber && s.studentNumber.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'SCORE_DESC') return b.finalScore - a.finalScore;
      if (sortBy === 'SCORE_ASC') return a.finalScore - b.finalScore;
      if (sortBy === 'NAME') return a.studentName.localeCompare(b.studentName);
      if (sortBy === 'VIOLATIONS') return (b.violationCount || 0) - (a.violationCount || 0);
      // Date default (newest first)
      return new Date(b.finishedAt || b.startedAt).getTime() - new Date(a.finishedAt || a.startedAt).getTime();
    });

    return result;
  }, [submissions, selectedClass, selectedStatus, searchQuery, sortBy]);

  // Open Detail / Manual Grading Modal
  const handleOpenDetail = (sub: ExamSubmission) => {
    setSelectedSubmission(sub);
    const scoreMap: { [qId: number]: number } = {};
    sub.essayEvaluations?.forEach((ev) => {
      scoreMap[ev.questionId] = ev.finalScore;
    });
    setEditingScores(scoreMap);
    setTeacherNotes(sub.teacherNotes || '');
  };

  // Save Teacher Manual Grade Override
  const handleSaveTeacherGrade = async () => {
    if (!selectedSubmission) return;
    setSavingGrade(true);

    const updatedEvaluations: EssayEvaluation[] = selectedSubmission.essayEvaluations.map((ev) => {
      const manualScore = editingScores[ev.questionId] !== undefined ? editingScores[ev.questionId] : ev.finalScore;
      return {
        ...ev,
        finalScore: manualScore,
        isManuallyAdjusted: manualScore !== ev.autoScore
      };
    });

    const totalEssayEarned = updatedEvaluations.reduce((acc, item) => acc + item.finalScore, 0);
    const totalEssayMax = ESSAY_QUESTIONS.reduce((acc, item) => acc + item.maxScore, 0);
    const newEssayScore = Math.round((totalEssayEarned / totalEssayMax) * 100);

    // Recompute weighted final score (60% PG + 40% Essay)
    const newFinalScore = Math.round((selectedSubmission.pgScore * 0.6) + (newEssayScore * 0.4));
    const newIsPassed = newFinalScore >= EXAM_METADATA.kkm;

    const payload: Partial<ExamSubmission> = {
      essayEvaluations: updatedEvaluations,
      essayScore: newEssayScore,
      finalScore: newFinalScore,
      isPassed: newIsPassed,
      teacherNotes,
      reviewedByTeacher: true
    };

    const updated = await ApiService.updateTeacherGrade(selectedSubmission.id, payload);

    if (updated) {
      setSelectedSubmission(updated);
      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }

    setSavingGrade(false);
  };

  // Delete submission
  const handleDeleteSubmission = async (id: string, name: string) => {
    if (window.confirm(`Hapus data ujian siswa "${name}"?`)) {
      await ApiService.deleteSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
    }
  };

  // Reset database or seed
  const handleResetData = async (restoreSeed: boolean) => {
    const msg = restoreSeed
      ? 'Kembalikan data ke contoh awal untuk demo pengujian?'
      : 'HAPUS SEMUA data ujian siswa di database? Tindakan ini tidak dapat dibatalkan.';
    if (window.confirm(msg)) {
      await ApiService.resetDatabase(restoreSeed);
      await loadSubmissions();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-slate-900 border-b border-indigo-900/50 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Keluar ke Halaman Siswa"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase">
                Portal Pengawas Guru
              </span>
              <span className="text-xs text-slate-400">• Informatika Kelas VII</span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-white">
              Dashboard Pengelolaan Nilai & Log Kecurangan
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Live Realtime Indicator */}
          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${realtimeConnected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${realtimeConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className={`font-semibold hidden sm:inline ${realtimeConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {realtimeConnected ? 'Realtime Aktif' : 'Menghubungkan...'}
            </span>
            {activeStudents.length > 0 && (
              <>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-blue-400 font-mono text-[11px] font-bold animate-pulse">
                  {activeStudents.length} Mengisi
                </span>
              </>
            )}
          </div>

          {/* Sound Notification Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border transition ${
              soundEnabled
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30'
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Suara notifikasi aktif (klik untuk membisukan)' : 'Suara notifikasi nonaktif (klik untuk mengaktifkan)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={loadSubmissions}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title={`Segarkan Data (Sinkron: ${lastSyncTime})`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <a
            href="/api/export-csv"
            download="Rekap_Nilai_Asesmen_Informatika_Kelas_VII.csv"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </a>

          <button
            onClick={onLogout}
            className="px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-semibold transition"
          >
            Kunci & Keluar
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-slate-400 block mb-1">Total Peserta</span>
            <span className="text-2xl font-black text-white font-mono">{stats.totalSubmissions}</span>
            <span className="text-[10px] text-slate-500 block">Siswa Mengikuti</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-slate-400 block mb-1">Rata-Rata Nilai</span>
            <span className="text-2xl font-black text-blue-400 font-mono">{stats.averageScore}</span>
            <span className="text-[10px] text-slate-500 block">KKM Standar: {EXAM_METADATA.kkm}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-slate-400 block mb-1">Nilai Tertinggi</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{stats.highestScore}</span>
            <span className="text-[10px] text-slate-500 block">Terendah: {stats.lowestScore}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-slate-400 block mb-1">Ketuntasan (Lulus)</span>
            <span className="text-2xl font-black text-teal-400 font-mono">{stats.passPercentage}%</span>
            <span className="text-[10px] text-slate-500 block">{stats.passCount} dari {stats.totalSubmissions} Siswa</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-slate-400 block mb-1">Siswa Remidial</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{stats.failCount}</span>
            <span className="text-[10px] text-slate-500 block">Nilai di bawah {EXAM_METADATA.kkm}</span>
          </div>

          <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-rose-300 block mb-1">Indikasi Pelanggaran</span>
            <span className="text-2xl font-black text-rose-400 font-mono">{stats.totalViolationsRecorded}</span>
            <span className="text-[10px] text-rose-300/70 block">{stats.studentsWithViolations} Siswa Terdeteksi</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-4">
          <button
            onClick={() => setActiveTab('REKAP')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'REKAP'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rekap Nilai Siswa ({filteredSubmissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_PELANGGARAN')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'AUDIT_PELANGGARAN'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Audit Pelanggaran Anti-Kecurangan ({stats.totalViolationsRecorded})</span>
          </button>

          <button
            onClick={() => setActiveTab('BANK_SOAL')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'BANK_SOAL'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bank Soal & Kunci Jawaban</span>
          </button>

          <button
            onClick={() => setActiveTab('GOOGLE_DRIVE')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'GOOGLE_DRIVE'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Google Drive Sync</span>
          </button>
        </div>

        {/* TAB 1: REKAPITULASI NILAI */}
        {activeTab === 'REKAP' && (
          <div className="space-y-4">
            {/* Live Realtime Active Students Monitor */}
            {activeStudents.length > 0 ? (
              <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 rounded-2xl p-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-blue-900/40">
                  <div className="flex items-center space-x-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                      <span>Siswa Sedang Mengerjakan Ujian (Live Realtime)</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono font-bold">
                        {activeStudents.length} Siswa Aktif
                      </span>
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ● Data otomatis terupdate tiap kali siswa memilih/mengisi jawaban
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeStudents.map((st) => {
                    const progressPercent = Math.round((st.totalAnswered / 15) * 100);
                    return (
                      <div
                        key={st.submissionId}
                        className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 shadow-sm hover:border-blue-500/60 transition group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-white block group-hover:text-blue-300 transition">
                              {st.studentName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              No. Absen: {st.studentNumber || '-'}
                            </span>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                            {st.studentClass}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <span className="flex items-center space-x-1.5 text-slate-300 font-medium">
                              <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                              <span>
                                {st.currentSection === 'PG'
                                  ? `Soal PG No. ${st.currentQuestion}`
                                  : `Soal Essay No. ${Math.max(1, st.currentQuestion - 10)}`}
                              </span>
                            </span>
                            <span className="font-mono font-extrabold text-blue-400">
                              {st.totalAnswered} / 15 Soal ({progressPercent}%)
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400 transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>PG: {st.answeredPgCount}/10 • Essay: {st.answeredEssayCount}/5</span>
                            <span className="inline-flex items-center space-x-1 text-teal-400 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                              <span>Sedang Mengisi</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400 shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-slate-300 font-semibold">Sinkronisasi Realtime Terhubung</span>
                  <span className="text-slate-500 hidden md:inline">— Setiap siswa yang mulai mengerjakan atau mengirim jawaban akan muncul seketika tanpa perlu refresh halaman.</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">Update Terakhir: {lastSyncTime}</span>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama atau no absen/NIS siswa..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Filter Kelas */}
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Kelas</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>

                {/* Filter Status */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PASSED">Lulus (≥ {EXAM_METADATA.kkm})</option>
                  <option value="FAILED">Remidi (&lt; {EXAM_METADATA.kkm})</option>
                  <option value="VIOLATIONS">Ada Pelanggaran</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DATE">Terbaru</option>
                  <option value="SCORE_DESC">Nilai Tertinggi</option>
                  <option value="SCORE_ASC">Nilai Terendah</option>
                  <option value="VIOLATIONS">Pelanggaran Terbanyak</option>
                  <option value="NAME">Nama A-Z</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-700/80 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Kelas / No</th>
                      <th className="py-3 px-4 text-center">PG (60%)</th>
                      <th className="py-3 px-4 text-center">Essay (40%)</th>
                      <th className="py-3 px-4 text-center">Nilai Akhir</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Pelanggaran</th>
                      <th className="py-3 px-4 text-center">Koreksi Guru</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                          Tidak ada data siswa yang cocok dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((sub, idx) => {
                        const isRecent = sub.id === recentSubmittedId;
                        return (
                          <tr
                            key={sub.id}
                            className={`transition-all duration-500 ${
                              isRecent
                                ? 'bg-emerald-950/70 border-y border-emerald-500/60 shadow-inner'
                                : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-white block">{sub.studentName}</span>
                                {isRecent && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider animate-bounce shadow">
                                    Baru Masuk!
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">{sub.id}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-slate-300">
                                {sub.studentClass} ({sub.studentNumber || '-'})
                              </span>
                            </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-400">
                            {sub.pgScore}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-teal-400">
                            {sub.essayScore}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono text-base font-extrabold text-white">
                              {sub.finalScore}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              sub.isPassed
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}>
                              {sub.isPassed ? 'TUNTAS' : 'REMIDI'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {sub.violationCount > 0 ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                                <ShieldAlert className="w-3 h-3" />
                                <span>{sub.violationCount}x</span>
                              </span>
                            ) : (
                              <span className="text-emerald-400 text-xs font-mono">0 (Tertib)</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {sub.reviewedByTeacher ? (
                              <span className="text-[11px] text-teal-400 font-medium flex items-center justify-center space-x-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Ditinjau</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">Otomatis</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenDetail(sub)}
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition"
                              title="Periksa & Koreksi Nilai Essay"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubmission(sub.id, sub.studentName)}
                              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 transition"
                              title="Hapus Data Siswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Database Utilities */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-slate-500">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleResetData(true)}
                  className="text-slate-400 hover:text-slate-200 underline"
                >
                  Muat Ulang Contoh Data Awal (Demo)
                </button>
                <span>•</span>
                <button
                  onClick={() => handleResetData(false)}
                  className="text-rose-400 hover:text-rose-300 underline"
                >
                  Kosongkan Semua Data Database
                </button>
              </div>
              <div>
                Total {submissions.length} lembar jawaban tersimpan di server
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT LOG PELANGGARAN KECURANGAN */}
        {activeTab === 'AUDIT_PELANGGARAN' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center space-x-3 text-rose-400 mb-2">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <h3 className="text-base font-bold text-white">
                  Audit Trail Deteksi Pindah Tab & Penguncian Layar
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log sistem merekam setiap kali peserta berpindah tab, membuka jendela aplikasi lain, mematikan layar penuh (Fullscreen Exit), atau mencoba menggunakan tombol pintasan salin-tempel saat asesmen berlangsung.
              </p>
            </div>

            <div className="space-y-3">
              {submissions.filter((s) => s.violations && s.violations.length > 0).length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                  Tidak ada catatan pelanggaran yang terdeteksi. Seluruh siswa tertib mematuhi tata tertib penguncian layar.
                </div>
              ) : (
                submissions
                  .filter((s) => s.violations && s.violations.length > 0)
                  .map((sub) => (
                    <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{sub.studentName}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                            Kelas {sub.studentClass} ({sub.studentNumber})
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                          {sub.violations.length} Kejadian Pelanggaran
                        </span>
                      </div>

                      <div className="space-y-2">
                        {sub.violations.map((v, vIdx) => (
                          <div
                            key={v.id || vIdx}
                            className="bg-rose-950/20 border border-rose-800/30 rounded-xl p-3 text-xs flex items-start space-x-3"
                          >
                            <span className="font-mono text-rose-400 font-bold flex-shrink-0">
                              {v.formattedTime}
                            </span>
                            <div className="flex-1">
                              <span className="font-semibold text-rose-200 block">{v.message}</span>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Tipe: <span className="font-mono text-slate-300">{v.type}</span>
                                {v.questionNumber && ` • Terdeteksi pada butir soal nomor ${v.questionNumber}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BANK SOAL & KUNCI JAWABAN */}
        {activeTab === 'BANK_SOAL' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white mb-1">
                Katalog Bank Soal & Pedoman Penskoran Resmi
              </h2>
              <p className="text-xs text-slate-400">
                Mata Pelajaran Informatika Kelas VII • Bab 1 Berpikir Komputasional untuk Pengolahan Data Dasar
              </p>
            </div>

            {/* 10 Soal PG */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                10 Butir Soal Pilihan Ganda (Bobot 60%)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MULTIPLE_CHOICE_QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex items-start space-x-2">
                      <span className="w-5 h-5 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="font-semibold text-slate-200 whitespace-pre-line">{q.question}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pl-7">
                      {q.options.map((opt) => (
                        <div
                          key={opt.key}
                          className={`p-2 rounded-lg border ${
                            opt.key === q.correctAnswer
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-bold'
                              : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                          }`}
                        >
                          {opt.key}. {opt.text} {opt.key === q.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>

                    <div className="pl-7 pt-1 text-slate-400 text-[11px]">
                      <span className="text-blue-400 font-semibold">Penjelasan:</span> {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Soal Essay */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                5 Butir Soal Uraian / Essay (Bobot 40% - Maks. 20 Poin/Soal)
              </h3>
              <div className="space-y-4">
                {ESSAY_QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2.5">
                        <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-bold text-slate-100 text-sm whitespace-pre-line">{q.question}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-teal-950/60 border border-teal-500/40 text-teal-300 font-mono font-bold flex-shrink-0">
                        Maks {q.maxScore} Poin
                      </span>
                    </div>

                    {q.tableData && (
                      <div className="pl-8 overflow-x-auto">
                        <table className="text-left border-collapse text-xs bg-slate-800/60 rounded-xl p-2 border border-slate-700">
                          <thead>
                            <tr className="border-b border-slate-700 text-slate-300">
                              {q.tableData.headers.map((h, i) => (
                                <th key={i} className="py-1.5 px-3 font-semibold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {q.tableData.rows.map((r, rIdx) => (
                              <tr key={rIdx} className="border-b border-slate-800/60">
                                {r.map((cell, cIdx) => (
                                  <td key={cIdx} className="py-1 px-3 font-mono text-slate-300">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="pl-8 space-y-2">
                      <div className="bg-teal-950/30 rounded-xl p-3 border border-teal-700/30 text-teal-200">
                        <strong className="text-teal-400 block mb-1">Kunci / Model Jawaban:</strong>
                        <p className="whitespace-pre-line">{q.sampleAnswer}</p>
                      </div>
                      <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40 text-slate-300">
                        <strong className="text-slate-400 block mb-1">Kata Kunci Validasi Otomatis (Rubric):</strong>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {q.keywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-mono text-[10px]">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GOOGLE DRIVE SYNC & BACKUP */}
        {activeTab === 'GOOGLE_DRIVE' && (
          <GoogleDriveSyncPanel submissions={submissions} />
        )}
      </div>

      {/* MODAL DETAIL SISWA & KOREKSI ESSAY */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Inspeksi & Koreksi Lembar Jawaban Siswa
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {selectedSubmission.studentName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-200">
                    Kelas {selectedSubmission.studentClass}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-200">
                    No Absen: {selectedSubmission.studentNumber || '-'}
                  </span>
                  <span>ID: {selectedSubmission.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Summary Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block">Skor PG (60%)</span>
                <span className="text-2xl font-black text-blue-400 font-mono">
                  {selectedSubmission.pgScore}
                </span>
                <span className="text-[10px] text-slate-500 block">10 Soal</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Skor Essay (40%)</span>
                <span className="text-2xl font-black text-teal-400 font-mono">
                  {selectedSubmission.essayScore}
                </span>
                <span className="text-[10px] text-slate-500 block">5 Soal</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Nilai Akhir</span>
                <span className="text-2xl font-black text-white font-mono">
                  {selectedSubmission.finalScore}
                </span>
                <span className="text-[10px] text-slate-500 block">KKM: {EXAM_METADATA.kkm}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Pelanggaran</span>
                <span className={`text-2xl font-black font-mono ${
                  selectedSubmission.violationCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {selectedSubmission.violationCount}
                </span>
                <span className="text-[10px] text-slate-500 block">Log Sistem</span>
              </div>
            </div>

            {/* Section: Koreksi Jawaban Essay */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-teal-400 flex items-center space-x-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Koreksi & Penyesuaian Nilai Jawaban Essay (5 Soal)</span>
                </h4>
                <span className="text-xs text-slate-400">
                  Guru dapat mengubah skor (0-20) sesuai kebijakan penilaian
                </span>
              </div>

              <div className="space-y-4">
                {ESSAY_QUESTIONS.map((q, idx) => {
                  const studentText = selectedSubmission.answers.essay[q.id] || '';
                  const ev = selectedSubmission.essayEvaluations?.find((e) => e.questionId === q.id);
                  const currentScore = editingScores[q.id] !== undefined ? editingScores[q.id] : (ev?.finalScore || 0);

                  return (
                    <div key={q.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-2">
                          <span className="w-5 h-5 rounded bg-teal-600/30 text-teal-300 font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-200">{q.question}</span>
                        </div>

                        {/* Teacher Score Input */}
                        <div className="flex items-center space-x-2 flex-shrink-0 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
                          <span className="text-slate-400 text-[11px]">Skor:</span>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={currentScore}
                            onChange={(e) => {
                              const val = Math.min(20, Math.max(0, parseInt(e.target.value) || 0));
                              setEditingScores((prev) => ({ ...prev, [q.id]: val }));
                            }}
                            className="w-12 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-center font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                          <span className="text-slate-400 text-[11px]">/ 20</span>
                        </div>
                      </div>

                      {/* Student Answer Content */}
                      <div className="pl-7 space-y-2">
                        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                            Jawaban Siswa:
                          </span>
                          <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                            {studentText.trim() ? studentText : <span className="italic text-slate-500">(Tidak ada jawaban yang diketik)</span>}
                          </p>
                        </div>

                        <div className="bg-teal-950/20 rounded-xl p-2.5 border border-teal-800/30 text-teal-300 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                            <span>Saran Auto-Grade Sistem: {ev?.autoScore || 0} / 20</span>
                          </div>
                          <span className="text-[11px] text-slate-400">{ev?.autoFeedback}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Teacher Notes / Feedback textarea */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-300">
                Catatan Guru untuk Siswa:
              </label>
              <textarea
                rows={3}
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder="Tuliskan apresiasi atau instruksi remidial jika ada..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Modal Bottom Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingGrade}
                onClick={handleSaveTeacherGrade}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-500/20 transition flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingGrade ? 'Menyimpan...' : 'Simpan Revisi Nilai & Catatan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Floating Notification Toasts */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {liveNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start space-x-3 transition-all duration-300 backdrop-blur-md ${
              notif.type === 'SUBMISSION'
                ? 'bg-slate-900/95 border-emerald-500/60 shadow-emerald-950/60 text-white'
                : notif.type === 'VIOLATION'
                ? 'bg-slate-900/95 border-rose-500/60 shadow-rose-950/60 text-white'
                : 'bg-slate-900/95 border-blue-500/60 shadow-blue-950/60 text-white'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {notif.type === 'SUBMISSION' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {notif.type === 'VIOLATION' && <ShieldAlert className="w-5 h-5 text-rose-400" />}
              {notif.type === 'STARTED' && <Activity className="w-5 h-5 text-blue-400 animate-pulse" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100 truncate">{notif.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono ml-2 flex-shrink-0">{notif.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">{notif.message}</p>
            </div>
            <button
              onClick={() => setLiveNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
              className="text-slate-500 hover:text-white p-0.5 transition flex-shrink-0"
              title="Tutup Notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
