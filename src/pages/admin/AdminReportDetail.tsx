import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { fetchReportById, updateReport } from '../../utils/api';
import type { Report, ReportProgress } from '../../utils/mockData';
import { Menu, MapPin, Calendar, Tag, User, CheckCircle, Clock, XCircle, Plus, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: 'menunggu',
    note: '',
    adminNote: '',
  });

  // Get query parameter to auto-open follow-up modal
  const searchParams = new URLSearchParams(window.location.search);
  const action = searchParams.get('action');

  useEffect(() => {
    if (!id) return;
    setLoadingPage(true);
    fetchReportById(id)
      .then((data) => {
        setReport(data);
        setUpdateForm({
          status: data.status,
          note: '',
          adminNote: data.alasan_penolakan || data.adminNote || '',
        });
        // Auto-open modal if action=follow-up
        if (action === 'follow-up') {
          setTimeout(() => setShowUpdateModal(true), 300);
        }
      })
      .catch((error) => {
        console.error(error);
        setReport(null);
      })
      .finally(() => {
        setLoadingPage(false);
      });
  }, [id, action]);

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
            onClick={() => navigate('/admin')}
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

  const handleUpdateStatus = async () => {
    if (!report) return;
    if (!updateForm.note.trim() && updateForm.status !== 'menunggu') {
      toast.error('Catatan progres wajib diisi');
      return;
    }

    if (updateForm.status === 'ditolak' && !updateForm.adminNote.trim()) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }

    const rejectionReason = (updateForm.status === 'ditolak'
      ? updateForm.adminNote
      : report.alasan_penolakan || report.adminNote || '').trim();

    const newProgress: ReportProgress = {
      id: Date.now().toString(),
      status: getStatusText(updateForm.status),
      note: updateForm.note,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Admin',
    };

    const updatedReport: Report = {
      ...report,
      status: updateForm.status as any,
      adminNote: rejectionReason || report.adminNote || '',
      alasan_penolakan: rejectionReason || report.alasan_penolakan || '',
      progress: [...report.progress, newProgress],
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateReport(updatedReport);
      setReport(updatedReport);
      setShowUpdateModal(false);
      setUpdateForm({ status: updatedReport.status, note: '', adminNote: updatedReport.adminNote || '' });
      toast.success('Status laporan berhasil diupdate!');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengupdate status. Mohon cek koneksi API.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <nav className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 sticky top-0 z-30 shadow-lg">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-blue-800 rounded-lg transition-all text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="font-bold text-white">Detail Laporan</h1>
                <p className="text-xs text-blue-200">#{report.id}</p>
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
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{report.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{report.userName}</span>
                  </div>
                  <span>•</span>
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
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium ${getStatusColor(report.status)}`}>
                  {report.status === 'menunggu' && <Clock className="w-5 h-5" />}
                  {report.status === 'diproses' && <Clock className="w-5 h-5" />}
                  {report.status === 'selesai' && <CheckCircle className="w-5 h-5" />}
                  {report.status === 'ditolak' && <XCircle className="w-5 h-5" />}
                  {getStatusText(report.status)}
                </div>
              </div>
              <button
                onClick={() => setShowUpdateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Tindak Lanjut
              </button>
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
            <h3 className="font-bold text-gray-900 mb-6">Riwayat Progres</h3>
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
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
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
        </motion.div>
        </div>
      </div>

      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Tindak Lanjut Laporan</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Update status dan tambahkan catatan progres penanganan</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Baru
                </label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="menunggu">Menunggu</option>
                  <option value="diproses">Diproses</option>
                  <option value="selesai">Selesai</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Progres <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={updateForm.note}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, note: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Jelaskan update progres penanganan..."
                  required
                />
              </div>

              {updateForm.status === 'ditolak' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Penolakan
                  </label>
                  <textarea
                    value={updateForm.adminNote}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, adminNote: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Jelaskan alasan penolakan laporan..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Update
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
