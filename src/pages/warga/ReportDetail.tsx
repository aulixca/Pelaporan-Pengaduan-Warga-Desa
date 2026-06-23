import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { deleteReport, fetchReportById } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Report } from '../../utils/mockData';
import { Menu, MapPin, Calendar, Tag, CheckCircle, Clock, XCircle, ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import WargaSidebar from '../../components/WargaSidebar';

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadingPage(true);
    fetchReportById(id)
      .then(setReport)
      .catch((error) => {
        console.error(error);
        setReport(null);
      })
      .finally(() => {
        setLoadingPage(false);
      });
  }, [id]);

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Memuat detail laporan...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Laporan tidak ditemukan</p>
          <button
            onClick={() => navigate('/warga')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

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
      case 'menunggu': return 'Menunggu Verifikasi';
      case 'diproses': return 'Sedang Diproses';
      case 'selesai': return 'Selesai';
      case 'ditolak': return 'Ditolak';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'menunggu': return <Clock className="w-5 h-5" />;
      case 'diproses': return <Clock className="w-5 h-5" />;
      case 'selesai': return <CheckCircle className="w-5 h-5" />;
      case 'ditolak': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const isOwner = report.userId === user?.id;

  const handleDelete = async () => {
    if (!report || !user) return;
    if (!isOwner) {
      toast.error('Anda tidak memiliki izin untuk menghapus laporan ini');
      return;
    }

    const confirmed = window.confirm(`Hapus laporan "${report.title}"? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteReport(report.id, user.id);
      toast.success('Laporan berhasil dihapus');
      navigate('/warga/riwayat');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Gagal menghapus laporan';
      toast.error(message);
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
                <h1 className="font-bold text-gray-900">Detail Laporan</h1>
                <p className="text-xs text-gray-500">#{report.id}</p>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(report.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{report.category}</span>
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium ${getStatusColor(report.status)}`}>
                {getStatusIcon(report.status)}
                {getStatusText(report.status)}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  Lokasi
                </h3>
                <p className="text-gray-700 ml-7">{report.location}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Deskripsi</h3>
                <p className="text-gray-700 leading-relaxed">{report.description}</p>
              </div>

              {report.photos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Foto Bukti</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.photos.map((photo, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative aspect-video rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {(report.alasan_penolakan || report.adminNote) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">Alasan Penolakan</h3>
                  <p className="text-red-800">{report.alasan_penolakan || report.adminNote}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h3 className="font-bold text-gray-900 mb-6">Tracking Progres</h3>
            <div className="space-y-4">
              {report.progress.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === report.progress.length - 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}>
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    {index < report.progress.length - 1 && (
                      <div className="w-0.5 h-full bg-green-300 mt-2 flex-1 min-h-[40px]" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-1">{item.status}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.note}</p>
                      <div className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} • {item.createdBy}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => navigate('/warga/riwayat')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <button
              onClick={() => navigate('/warga/buat-laporan')}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Laporan Baru
            </button>
            {isOwner && (
              <button
                onClick={() => navigate(`/warga/laporan/${report.id}/edit`)}
                className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
              >
                <Pencil className="w-5 h-5" />
                Edit
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Hapus
              </button>
            )}
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
