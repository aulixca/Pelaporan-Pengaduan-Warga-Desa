import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Phone, CreditCard, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import logoKabupaten from '../imports/logo_kab_pkl.png';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nik: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (formData.nik.length !== 16) {
      setError('NIK harus 16 digit');
      return;
    }

    setLoading(true);
    const success = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      nik: formData.nik,
      phone: formData.phone,
    });
    setLoading(false);

    if (success) {
      navigate('/');
    } else {
      setError('Email sudah terdaftar');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Sisi Kiri - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-blue-900 to-slate-800 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="absolute top-20 right-20 w-32 h-32 border-4 border-white/20 rounded-2xl rotate-12"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 border-4 border-white/20 rounded-full"></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <div className="w-40 h-40 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-6">
              <img
                src={logoKabupaten}
                alt="Logo Kabupaten Pekalongan"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-3">Registrasi Warga</h1>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-4"></div>
            <p className="text-xl text-slate-100">
              Sistem Pelaporan Pengaduan Warga Desa
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-[1.75rem] p-8 border border-white/20 max-w-md"
          >
            <h3 className="text-xl font-bold text-white mb-4">Keuntungan Mendaftar</h3>
            <ul className="space-y-3 text-white">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">✓</span>
                </div>
                <span className="text-sm">Laporkan pengaduan dengan cepat dan mudah</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">✓</span>
                </div>
                <span className="text-sm">Lacak progres penanganan secara real-time</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">✓</span>
                </div>
                <span className="text-sm">Riwayat laporan tersimpan dengan aman</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">✓</span>
                </div>
                <span className="text-sm">Notifikasi update status laporan</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Sisi Kanan - Form Register */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-slate-50"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl mb-4 shadow-lg p-3 border border-gray-200">
              <img
                src={logoKabupaten}
                alt="Logo Kabupaten Pekalongan"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Daftar Akun Baru</h1>
            <p className="text-gray-600">Sistem Pelaporan Pengaduan</p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/95 rounded-[2rem] shadow-soft p-8 border border-slate-200 backdrop-blur-sm"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrasi</h2>
              <p className="text-gray-600">Lengkapi data Anda untuk membuat akun</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none bg-slate-50"
                      placeholder="Nama lengkap"
                      required
                    />
                  </div>
                </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all bg-slate-50"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NIK
                </label>
                <div className="relative group">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => handleChange('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all bg-slate-50"
                    placeholder="16 digit NIK"
                    required
                    maxLength={16}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  No. Telepon
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all bg-slate-50"
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all bg-slate-50"
                    placeholder="Min. 6 karakter"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all bg-slate-50"
                    placeholder="Ulangi password"
                    required
                  />
                </div>
              </div>
            </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {loading ? 'Memproses...' : 'Daftar Sekarang'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-sky-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Sudah punya akun?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          </motion.div>

          <p className="text-center text-sm text-gray-500 mt-6">
            © 2026 Kabupaten Pekalongan. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
