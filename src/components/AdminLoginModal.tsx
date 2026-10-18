import React, { useState } from 'react';
import { Lock, KeyRound, AlertTriangle, X, ShieldCheck } from 'lucide-react';
import { ApiService } from '../services/apiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const isValid = await ApiService.verifyAdminPin(pin);
      if (isValid) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg('PIN Guru tidak sesuai! Akses ditolak.');
      }
    } catch (err) {
      setErrorMsg('Gagal memverifikasi PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-indigo-700/60 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Login Portal Guru</h3>
          <p className="text-xs text-slate-400">
            Khusus guru pengampu mata pelajaran Informatika untuk mengelola nilai & log ujian.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-lg flex items-center space-x-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Masukkan PIN Guru:
            </label>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN Keamanan Guru"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              * Masukkan PIN otorisasi guru pengampu yang sah.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Memverifikasi...' : 'Masuk Dashboard Admin'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
