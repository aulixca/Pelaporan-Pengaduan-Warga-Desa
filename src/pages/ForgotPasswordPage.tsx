import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import logoKabupaten from '../imports/logo_kab_pkl.png';

type ForgotStep = 'email' | 'reset';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { requestPasswordReset, resetPassword } = useAuth();

  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoResetCode, setDemoResetCode] = useState('');
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await requestPasswordReset(email.trim());
      setStep('reset');
      setResetCode('');
      setDemoResetCode(response.resetCode || '');
      toast.success(response.message || 'Permintaan reset password berhasil diproses');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memproses permintaan reset password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!resetCode.trim()) {
      setError('Kode reset harus diisi');
      setLoading(false);
      return;
    }

    if (!newPassword) {
      setError('Password baru harus diisi');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    const success = await resetPassword(email.trim(), resetCode.trim(), newPassword);
    if (success) {
      toast.success('Password berhasil direset. Silakan login dengan password baru.');
      setTimeout(() => {
        navigate('/login');
      }, 1300);
    } else {
      setError('Kode reset tidak valid atau sudah kadaluarsa');
    }

    setLoading(false);
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 h-1/3 lg:h-full bg-gradient-to-br from-slate-950 via-blue-900 to-slate-800 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-6 lg:px-12"
        >
          <div className="mb-6 lg:mb-8 flex justify-center">
            <div className="w-32 h-32 lg:w-56 lg:h-56 bg-white rounded-2xl lg:rounded-3xl shadow-2xl flex items-center justify-center p-4 lg:p-8">
              <img src={logoKabupaten} alt="Logo Kabupaten Pekalongan" className="w-full h-full object-contain" />
            </div>
          </div>

          <h1 className="text-2xl lg:text-5xl font-bold text-white mb-2 lg:mb-4">Kabupaten Pekalongan</h1>
          <div className="h-1 w-24 lg:w-32 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-3 lg:mb-6" />
          <h2 className="text-xl lg:text-3xl font-semibold text-slate-100">Pemulihan Password</h2>
          <h2 className="text-xl lg:text-3xl font-semibold text-slate-100 mb-3 lg:mb-6">Pelaporan Pengaduan Warga</h2>
          <p className="text-sm lg:text-lg text-slate-200 max-w-md mx-auto hidden lg:block">
            Verifikasi email lalu gunakan kode reset untuk membuat password baru
          </p>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 h-2/3 lg:h-full bg-slate-50 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-10 border border-gray-100">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Login
            </button>

            <div className="mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Lupa Password?</h2>
              <p className="text-sm lg:text-base text-gray-600">
                {step === 'email'
                  ? 'Masukkan email akun Anda untuk meminta kode reset'
                  : 'Masukkan kode reset dan password baru Anda'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </motion.div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-5 lg:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Terdaftar</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 lg:py-3.5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none text-gray-900 bg-slate-50"
                      placeholder="Masukkan email Anda"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3.5 lg:py-4 rounded-xl font-bold text-base lg:text-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Memproses...' : 'Kirim Kode Reset'}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-5 lg:space-y-6">
                {demoResetCode && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                    <p className="text-xs text-blue-900 font-medium">Kode reset demo:</p>
                    <p className="text-lg tracking-[0.3em] font-bold text-blue-700 mt-1">{demoResetCode}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kode Reset</label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\s+/g, ''))}
                      className="w-full pl-12 pr-4 py-3 lg:py-3.5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none text-gray-900 tracking-[0.18em] bg-slate-50"
                      placeholder="Masukkan kode reset"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password Baru</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 lg:py-3.5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none text-gray-900 bg-slate-50"
                      placeholder="Masukkan password baru"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 lg:py-3.5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none text-gray-900 bg-slate-50"
                      placeholder="Ulangi password baru"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3.5 lg:py-4 rounded-xl font-bold text-base lg:text-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Memproses...' : 'Reset Password'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setResetCode('');
                    setDemoResetCode('');
                    setError('');
                  }}
                  className="w-full px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all"
                >
                  Ubah Email
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
