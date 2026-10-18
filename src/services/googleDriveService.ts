import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { ExamSubmission } from '../types/exam';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Provider with Drive scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');

// In-memory token caching (MANDATORY: DO NOT store in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
}

export class GoogleDriveService {
  // Listen to auth state changes
  static initAuth(
    onSuccess: (user: User, token: string) => void,
    onFailure: () => void
  ) {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user && cachedAccessToken) {
        onSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onFailure();
      }
    });
  }

  // Sign in with Google (Popup)
  static async signInWithGoogle(): Promise<{ user: User; accessToken: string } | null> {
    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Gagal memperoleh access token dari Google OAuth.');
      }
      cachedAccessToken = credential.accessToken;
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      throw err;
    } finally {
      isSigningIn = false;
    }
  }

  // Sign out
  static async signOutUser(): Promise<void> {
    await signOut(auth);
    cachedAccessToken = null;
  }

  // Get current in-memory token
  static async getAccessToken(): Promise<string | null> {
    return cachedAccessToken;
  }

  // Get or Create Folder in Google Drive
  static async getOrCreateFolder(folderName: string = 'Asesmen Informatika SMP'): Promise<string> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Akses Google Drive belum diotorisasi. Silakan Masuk dengan Google.');

    // Search for existing folder
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    )}&fields=files(id,name)`;

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'Gagal membuat folder di Google Drive');
    }

    const folderData = await createRes.json();
    return folderData.id;
  }

  // Upload file (CSV / Sheet) using Drive multipart upload
  static async uploadFileToDrive(
    fileName: string,
    content: string,
    mimeType: string = 'text/csv',
    folderId?: string
  ): Promise<DriveFileItem> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Token Google Drive tidak tersedia.');

    const metadata: any = {
      name: fileName,
      mimeType: mimeType
    };

    if (folderId) {
      metadata.parents = [folderId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
      content +
      closeDelimiter;

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,size',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Gagal mengunggah berkas ke Google Drive');
    }

    return await res.json();
  }

  // List existing assessment backups in Google Drive
  static async listAssessmentBackups(): Promise<DriveFileItem[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    const query = `trashed = false and (name contains 'Asesmen' or name contains 'Rekap_Nilai' or name contains 'Informatika')`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&orderBy=createdTime desc&pageSize=20&fields=files(id,name,mimeType,createdTime,webViewLink,iconLink,size)`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  }

  // Helper to generate CSV content from Submissions
  static generateCsvContent(submissions: ExamSubmission[]): string {
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

    return csv;
  }
}
