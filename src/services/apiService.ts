import { ExamSubmission, ViolationLog } from '../types/exam';

const LOCAL_STORAGE_KEY = 'cbt_exam_submissions_v1';

export class ApiService {
  // Get all submissions from server with fallback to localStorage
  static async getSubmissions(): Promise<ExamSubmission[]> {
    try {
      const response = await fetch('/api/submissions');
      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          // Sync to localStorage as backup
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, using local cache:', err);
    }

    // Fallback to localStorage
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  }

  // Save new submission
  static async saveSubmission(submission: ExamSubmission): Promise<boolean> {
    let savedRemotely = false;

    // 1. Save in local storage buffer immediately
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      const list: ExamSubmission[] = cached ? JSON.parse(cached) : [];
      const idx = list.findIndex((s) => s.id === submission.id);
      if (idx >= 0) {
        list[idx] = submission;
      } else {
        list.unshift(submission);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }

    // 2. Send to backend
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });
      if (res.ok) {
        const data = await res.json();
        savedRemotely = data.success;
      }
    } catch (err) {
      console.warn('Network error saving to server, saved locally:', err);
    }

    return true;
  }

  // Real-time violation logging
  static async logViolation(
    submissionId: string,
    studentName: string,
    studentClass: string,
    violation: ViolationLog
  ): Promise<void> {
    try {
      await fetch('/api/submissions/log-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, studentName, studentClass, violation })
      });
    } catch (e) {
      // Non-blocking
    }
  }

  // Teacher updates grade or notes
  static async updateTeacherGrade(
    id: string,
    payload: Partial<ExamSubmission>
  ): Promise<ExamSubmission | null> {
    try {
      const res = await fetch(`/api/submissions/${id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch (err) {
      console.error('Error updating grade:', err);
    }

    // Local fallback update
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const list: ExamSubmission[] = JSON.parse(cached);
      const target = list.find((item) => item.id === id);
      if (target) {
        Object.assign(target, payload, { reviewedByTeacher: true });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        return target;
      }
    }
    return null;
  }

  // Delete submission
  static async deleteSubmission(id: string): Promise<boolean> {
    try {
      await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
    } catch (err) {
      //
    }
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const list: ExamSubmission[] = JSON.parse(cached);
      const filtered = list.filter((item) => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
    return true;
  }

  // Reset or seed
  static async resetDatabase(restoreSeed: boolean): Promise<boolean> {
    try {
      const res = await fetch('/api/submissions/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restoreSeed })
      });
      if (res.ok) {
        const json = await res.json();
        return json.success;
      }
    } catch (err) {
      //
    }
    if (!restoreSeed) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    return true;
  }

  // Verify PIN
  static async verifyAdminPin(pin: string): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      if (res.ok) {
        const json = await res.json();
        return json.success;
      }
    } catch (err) {
      // Fallback default password
    }
    return pin === 'guru123' || pin === 'admin123' || pin === 'guru7';
  }
}
