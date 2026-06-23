import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { deleteReport, fetchReports } from '../../utils/api';
import type { Report } from '../../utils/mockData';
import { Menu, Search, FileText, Plus, Trash2, Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import WargaSidebar from '../../components/WargaSidebar';

export default function ReportHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchReports()
      .then(setReports)
      .catch((error) => console.error(error));
  }, [user]);

  const allReports = reports;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredReports = allReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'semua' || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteReport = async (report: Report) => {
    if (!user) return;
    if (report.userId !== user.id) {
      toast.error('Anda tidak memiliki izin untuk menghapus laporan ini');
      return;
    }

    const confirmed = window.confirm(`Hapus laporan "${report.title}"? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteReport(report.id, user.id);
      setReports((prev) => prev.filter((item) => item.id !== report.id));
      toast.success('Laporan berhasil dihapus');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Gagal menghapus laporan';
      toast.error(message);
    }
  };

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
      <WargaSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="font-bold text-gray-900">Riwayat Laporan</h1>
                <p className="text-xs text-gray-500">Semua laporan warga desa</p>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari laporan..."
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="semua">Semua Status</option>
                <option value="menunggu">Menunggu</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
              <button
                onClick={() => navigate('/warga/buat-laporan')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Laporan Baru
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">
                {filteredReports.length} Laporan
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/warga/laporan/${report.id}`)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          {report.photos.length > 0 && (
                            <img
                              src={report.photos[0]}
                              alt={report.title}
                              className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">{report.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{report.description}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span className="px-2 py-1 bg-gray-100 rounded">{report.category}</span>
                              <span>•</span>
                              <span>{report.location}</span>
                              <span>•</span>
                              <span>{new Date(report.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                        {report.userId === user?.id && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/warga/laporan/${report.id}/edit`);
                            }}
                            className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                            title="Edit Laporan"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                        {report.userId === user?.id && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReport(report);
                            }}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                            title="Hapus Laporan"
                          >
                            <Trash2 className="w-4 h-4" />
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-6 font-medium">Tidak ada laporan ditemukan</p>
                  <button
                    onClick={() => navigate('/warga/buat-laporan')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    Buat Laporan Pertama
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
