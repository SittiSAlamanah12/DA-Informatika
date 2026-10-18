import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { GoogleDriveService, DriveFileItem } from '../services/googleDriveService';
import { ExamSubmission } from '../types/exam';
import { 
  Cloud, 
  UploadCloud, 
  FolderCheck, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  LogOut, 
  FileSpreadsheet, 
  FileJson,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface Props {
  submissions: ExamSubmission[];
}

export const GoogleDriveSyncPanel: React.FC<Props> = ({ submissions }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirmation dialog state for Drive mutation (Mandatory by Workspace integration guidelines)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'CSV' | 'JSON';
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    // Auth state listener
    const unsubscribe = GoogleDriveService.initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        fetchDriveFiles();
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchDriveFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const files = await GoogleDriveService.listAssessmentBackups();
      setDriveFiles(files);
    } catch (err) {
      console.warn('Error fetching Drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await GoogleDriveService.signInWithGoogle();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        await fetchDriveFiles();
        setStatusMessage({
          type: 'success',
          text: `Berhasil terhubung dengan Google Drive akun: ${result.user.email}`
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal masuk dengan Google. Periksa koneksi dan izin popup.'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await GoogleDriveService.signOutUser();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setStatusMessage(null);
  };

  // Trigger confirmation dialog before mutating Drive
  const requestBackupCsv = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'CSV',
      title: 'Cadangkan Rekap Nilai ke Google Drive?',
      description: `Sistem akan membuat berkas spreadsheet CSV rekap nilai ${submissions.length} siswa ke folder "Asesmen Informatika SMP" di Google Drive Anda.`
    });
  };

  const requestBackupJson = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'JSON',
      title: 'Cadangkan Database Lengkap (JSON) ke Google Drive?',
      description: `Sistem akan mengunggah cadangan lengkap seluruh data pengerjaan ujian, jawaban essay, dan riwayat audit pelanggaran ke Google Drive Anda.`
    });
  };

  const executeConfirmedBackup = async () => {
    if (!confirmDialog) return;
    const backupType = confirmDialog.type;
    setConfirmDialog(null);
    setIsUploading(true);
    setStatusMessage(null);

    try {
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const folderId = await GoogleDriveService.getOrCreateFolder('Asesmen Informatika SMP');

      let uploadedItem: DriveFileItem;

      if (backupType === 'CSV') {
        const csv = GoogleDriveService.generateCsvContent(submissions);
        const fileName = `Rekap_Nilai_Asesmen_Informatika_Kelas_VII_${dateStr}.csv`;
        uploadedItem = await GoogleDriveService.uploadFileToDrive(fileName, csv, 'text/csv', folderId);
      } else {
        const jsonStr = JSON.stringify(submissions, null, 2);
        const fileName = `Database_Asesmen_Informatika_Kelas_VII_${dateStr}.json`;
        uploadedItem = await GoogleDriveService.uploadFileToDrive(fileName, jsonStr, 'application/json', folderId);
      }

      setStatusMessage({
        type: 'success',
        text: `Berkas "${uploadedItem.name}" berhasil diunggah ke Google Drive di folder "Asesmen Informatika SMP"!`
      });

      await fetchDriveFiles();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal mencadangkan berkas ke Google Drive.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Integrasi Cloud Storage
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Google Drive Sync & Backup
              </h2>
              <p className="text-xs text-slate-400">
                Sinkronisasikan rekap nilai siswa dan basis data asesmen langsung ke Google Drive guru.
              </p>
            </div>
          </div>

          {/* Account Status / Sign In Button */}
          {user ? (
            <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-sm">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-8 h-8 rounded-full border border-slate-600"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">
                  {user.displayName || 'Guru Pengampu'}
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition"
                title="Putuskan Hubungan Google Drive"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              {/* Official Google Sign-In Material Button Pattern */}
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-md transition flex items-center space-x-2.5 active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoggingIn ? 'Menghubungkan...' : 'Hubungkan dengan Google'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`mt-4 p-3 rounded-xl border flex items-center space-x-2 text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!user ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
            <Cloud className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Hubungkan Google Drive Guru</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dengan menghubungkan akun Google, Anda dapat mencadangkan seluruh nilai siswa, laporan ujian, dan riwayat audit pelanggaran ke Google Drive secara aman dan otomatis.
          </p>
          <div className="pt-2">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/20 transition"
            >
              Masuk dengan Akun Google
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Backup Rekap Nilai CSV */}
            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 space-y-3 transition shadow-md">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase">
                  Excel / Sheets
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cadangkan Rekap Nilai Siswa (CSV)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Unggah rekap nilai {submissions.length} siswa lengkap dengan status kelulusan KKM 78 dan jumlah pelanggaran ke Google Drive.
                </p>
              </div>
              <button
                type="button"
                disabled={isUploading}
                onClick={requestBackupCsv}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isUploading ? 'Sedang Mengunggah...' : 'Unggah Rekap Nilai ke Drive'}</span>
              </button>
            </div>

            {/* Backup Full Database JSON */}
            <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 space-y-3 transition shadow-md">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <FileJson className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold uppercase">
                  Full Database
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cadangkan Database Lengkap (JSON)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Cadangkan seluruh data butir jawaban PG, teks jawaban essay, evaluasi nilai guru, serta log deteksi kecurangan ke Google Drive.
                </p>
              </div>
              <button
                type="button"
                disabled={isUploading}
                onClick={requestBackupJson}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isUploading ? 'Sedang Mengunggah...' : 'Unggah Cadangan Penuh (JSON)'}</span>
              </button>
            </div>
          </div>

          {/* Table of Backups in Google Drive */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <FolderCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Berkas Asesmen Tersimpan di Google Drive
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Folder: "Asesmen Informatika SMP"
                  </span>
                </div>
              </div>

              <button
                onClick={fetchDriveFiles}
                disabled={isLoadingFiles}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Segarkan Daftar Berkas Drive"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoadingFiles ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Memuat daftar berkas dari Google Drive...
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Belum ada berkas cadangan di Google Drive. Klik tombol cadangkan di atas untuk membuat cadangan pertama Anda.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {driveFiles.map((file) => (
                  <div key={file.id} className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-800/30 px-2 rounded-xl transition">
                    <div className="flex items-center space-x-3">
                      {file.mimeType.includes('csv') || file.mimeType.includes('spreadsheet') ? (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <FileJson className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-200 block">{file.name}</span>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                          {file.createdTime && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{new Date(file.createdTime).toLocaleString('id-ID')}</span>
                            </span>
                          )}
                          <span>•</span>
                          <span className="font-mono text-slate-400">ID: {file.id.slice(0, 10)}...</span>
                        </div>
                      </div>
                    </div>

                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition"
                      >
                        <span>Buka di Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION DIALOG FOR WORKSPACE DRIVE MUTATION */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <Cloud className="w-6 h-6 flex-shrink-0 text-amber-400" />
              <h3 className="text-base font-bold text-white">{confirmDialog.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-[11px] text-slate-400 space-y-1">
              <div>• Akun Target: <span className="font-mono text-slate-200">{user?.email}</span></div>
              <div>• Folder: <span className="text-amber-300 font-semibold">Asesmen Informatika SMP</span></div>
              <div>• Aksi: <span className="text-slate-200">Membuat dan mengunggah berkas baru</span></div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeConfirmedBackup}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ya, Cadangkan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
