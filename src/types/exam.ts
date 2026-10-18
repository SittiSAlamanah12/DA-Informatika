export type ClassGrade = 'VII Academic' | 'VII Cambridge' | 'VII Cambridge (7.3)' | 'VII Tahfidz' | 'VII Tahfidz Timur Tengah' | string;

export interface ViolationLog {
  id: string;
  timestamp: string; // ISO string
  formattedTime: string; // e.g. "08:14:23"
  type: 'TAB_SWITCH' | 'WINDOW_BLUR' | 'FULLSCREEN_EXIT' | 'DEVTOOLS_ATTEMPT' | 'COPY_PASTE_ATTEMPT';
  message: string;
  questionNumber?: number;
}

export interface StudentAnswers {
  pg: { [questionId: number]: 'A' | 'B' | 'C' | 'D' };
  essay: { [questionId: number]: string };
  markedDoubtful?: { [questionId: number]: boolean };
}

export interface EssayEvaluation {
  questionId: number;
  autoScore: number;
  finalScore: number;
  maxScore: number;
  autoFeedback: string;
  teacherFeedback?: string;
  isManuallyAdjusted?: boolean;
}

export interface ExamSubmission {
  id: string;
  studentName: string;
  studentClass: string;
  studentNumber: string; // NIS or Absen
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  
  answers: StudentAnswers;
  
  // Scoring
  pgCorrectCount: number;
  pgScore: number; // 0-100
  essayScore: number; // 0-100
  finalScore: number; // weighted 0-100
  isPassed: boolean;
  
  essayEvaluations: EssayEvaluation[];
  
  // Violations
  violations: ViolationLog[];
  violationCount: number;
  status: 'SUBMITTED' | 'AUTO_SUBMITTED_VIOLATIONS' | 'AUTO_SUBMITTED_TIMEOUT';
  
  reviewedByTeacher: boolean;
  teacherNotes?: string;
}

export interface ExamStats {
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  failCount: number;
  passPercentage: number;
  totalViolationsRecorded: number;
  studentsWithViolations: number;
}
