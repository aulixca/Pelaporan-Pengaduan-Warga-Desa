import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import logoKabupaten from '../imports/logo_kab_pkl.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate('/');
    } else {
      setError('Email atau password salah');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row">
      {/* ==================== SISI KIRI (50%) ==================== */}
      <div className="w-full lg:w-1/2 h-1/3 lg:h-full bg-gradient-to-br from-slate-950 via-blue-900 to-slate-800 relative overflow-hidden flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Decorative Shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 border-4 border-white/20 rounded-2xl rotate-12 hidden lg:block"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 border-4 border-white/20 rounded-full hidden lg:block"></div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-6 lg:px-12"
        >
          {/* Logo Kabupaten Pekalongan */}
          <div className="mb-6 lg:mb-8 flex justify-center">
            <div className="w-32 h-32 lg:w-56 lg:h-56 bg-white rounded-2xl lg:rounded-3xl shadow-2xl flex items-center justify-center p-4 lg:p-8">
              <img
                src={logoKabupaten}
                alt="Logo Kabupaten Pekalongan"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Teks Branding */}
          <h1 className="text-2xl lg:text-5xl font-bold text-white mb-2 lg:mb-4">
            Kabupaten Pekalongan
          </h1>
          <div className="h-1 w-24 lg:w-32 bg-gradient-to-r from-white/80 via-white to-white/80 mx-auto mb-3 lg:mb-6"></div>
          <h2 className="text-xl lg:text-3xl font-semibold text-slate-100">
            Pelaporan Pengaduan
          </h2>
          <h2 className="text-xl lg:text-3xl font-semibold text-slate-100 mb-3 lg:mb-6">
            Warga Desa
          </h2>
          <p className="text-sm lg:text-lg text-slate-200 max-w-md mx-auto hidden lg:block">
            Platform digital modern untuk menyampaikan aspirasi dan keluhan masyarakat
          </p>
        </motion.div>
      </div>

      {/* ==================== SISI KANAN (50%) ==================== */}
      <div className="w-full lg:w-1/2 h-2/3 lg:h-full bg-slate-50 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Card Form Login */}
          <div className="bg-white/95 rounded-[2rem] shadow-soft p-6 lg:p-10 border border-slate-200 backdrop-blur-sm">
            <div className="mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Login</h2>
              <p className="text-sm lg:text-base text-gray-600">Masuk ke akun Anda untuk melanjutkan</p>
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

            <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
              {/* Email/Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email / Username
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 lg:py-3.5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none bg-slate-50 text-slate-900"
                    placeholder="Masukkan email Anda"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 lg:py-3.5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none bg-slate-50 text-slate-900"
                    placeholder="Masukkan password Anda"
                    required
                  />
                </div>
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Lupa password?
                  </button>
                </div>
              </div>

              {/* Button Login */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white py-3.5 lg:py-4 rounded-2xl font-bold text-base lg:text-lg hover:from-blue-700 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Login'}
              </motion.button>
            </form>

            {/* Link Register */}
            <div className="mt-6 lg:mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Belum punya akun?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                >
                  Daftar Sekarang
                </button>
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
