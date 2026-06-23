import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { fetchReports } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Clock, CheckCircle, XCircle, Menu, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import type { Report } from '../../utils/mockData';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const stats = {
    total: reports.length,
    menunggu: reports.filter(r => r.status === 'menunggu').length,
    diproses: reports.filter(r => r.status === 'diproses').length,
    selesai: reports.filter(r => r.status === 'selesai').length,
    ditolak: reports.filter(r => r.status === 'ditolak').length,
  };

  const categoryData = reports.reduce((acc: any, report) => {
    const existing = acc.find((item: any) => item.name === report.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: report.category, value: 1 });
    }
    return acc;
  }, []);

  const statusData = [
    { name: 'Menunggu', value: stats.menunggu, color: '#f59e0b' },
    { name: 'Diproses', value: stats.diproses, color: '#3b82f6' },
    { name: 'Selesai', value: stats.selesai, color: '#10b981' },
    { name: 'Ditolak', value: stats.ditolak, color: '#ef4444' },
  ];

  const recentReports = reports.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'menunggu': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'diproses': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'selesai': return 'bg-green-100 text-green-800 border-green-200';
      case 'ditolak': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'menunggu': return 'Menunggu';
      case 'diproses': return 'Diproses';
      case 'selesai': return 'Selesai';
      case 'ditolak': return 'Ditolak';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <nav className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 sticky top-0 z-30 shadow-lg">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-blue-800 rounded-lg transition-all text-white"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="font-bold text-white">Admin Dashboard</h1>
                  <p className="text-xs text-blue-200">Sistem Pengaduan Desa</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-blue-200">Administrator</p>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto w-full"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang, {user?.name}</h2>
            <p className="text-gray-600">Ringkasan sistem pelaporan pengaduan warga</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold">{stats.total}</span>
              </div>
              <p className="font-medium">Total Laporan</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold">{stats.menunggu}</span>
              </div>
              <p className="font-medium">Menunggu</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold">{stats.diproses}</span>
              </div>
              <p className="font-medium">Diproses</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold">{stats.selesai}</span>
              </div>
              <p className="font-medium">Selesai</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold">{stats.ditolak}</span>
              </div>
              <p className="font-medium">Ditolak</p>
            </motion.div>
          </div>


          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Statistik Status Laporan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Laporan per Kategori</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Laporan Terbaru</h3>
                  <button
                    onClick={() => navigate('/admin/laporan')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Lihat Semua
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => navigate(`/admin/laporan/${report.id}`)}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{report.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-1 mb-2">{report.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="font-medium">{report.userName}</span>
                            <span>•</span>
                            <span>{report.category}</span>
                            <span>•</span>
                            <span>{new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(report.status)}`}>
                            {getStatusText(report.status)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/laporan/${report.id}?action=follow-up`);
                            }}
                            className="px-2.5 py-1.5 bg-orange-500 text-white rounded text-xs font-semibold hover:bg-orange-600 transition-all flex items-center gap-1 whitespace-nowrap"
                            title="Tindak Lanjut"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Tingkat Penyelesaian</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Selesai</span>
                      <span className="font-semibold text-gray-900">
                        {stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.total > 0 ? (stats.selesai / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Diproses</span>
                      <span className="font-semibold text-gray-900">
                        {stats.total > 0 ? Math.round((stats.diproses / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.total > 0 ? (stats.diproses / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Menunggu</span>
                      <span className="font-semibold text-gray-900">
                        {stats.total > 0 ? Math.round((stats.menunggu / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.total > 0 ? (stats.menunggu / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-4">Aksi Cepat</h3>
                <div className="space-y-2">
                  {stats.menunggu > 0 && (
                    <button
                      onClick={() => navigate('/admin/laporan')}
                      className="w-full text-left px-4 py-3 bg-yellow-100 border border-yellow-200 rounded-lg hover:bg-yellow-200 transition-all text-yellow-900 font-medium shadow-sm flex items-center justify-between"
                    >
                      <span>⚠️ {stats.menunggu} Laporan Menunggu</span>
                      <span className="text-xs">Verifikasi →</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/admin/laporan')}
                    className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-blue-50 transition-all text-gray-700 hover:text-blue-700 font-medium shadow-sm"
                  >
                    📊 Lihat Semua Laporan
                  </button>
                  <button
                    onClick={() => navigate('/admin/kategori')}
                    className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-blue-50 transition-all text-gray-700 hover:text-blue-700 font-medium shadow-sm"
                  >
                    🏷️ Kelola Kategori
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Panduan Admin</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <p>Verifikasi laporan masuk dari menu <strong>Semua Laporan</strong></p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <p>Update status dan progres penanganan secara berkala</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <p>Gunakan <strong>Filter</strong> untuk mencari laporan spesifik</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <p>Export laporan untuk dokumentasi dan pelaporan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
