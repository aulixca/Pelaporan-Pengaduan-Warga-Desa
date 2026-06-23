import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCategories, fetchReportById, updateReport } from '../../utils/api';
import { getCategories, type Category, type Report } from '../../utils/mockData';
import { ArrowLeft, MapPin, Menu, Save, Upload, X } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import WargaSidebar from '../../components/WargaSidebar';

export default function EditReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories(getCategories()));
  }, []);

  useEffect(() => {
    if (!id) return;

    setLoadingPage(true);
    fetchReportById(id)
      .then((data) => {
        setReport(data);
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
        });
        setPhotos(data.photos || []);
      })
      .catch((error) => {
        console.error(error);
        setReport(null);
      })
      .finally(() => {
        setLoadingPage(false);
      });
  }, [id]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxSize = 50 * 1024 * 1024;

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} terlalu besar. Maksimal 50MB per file.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const canEdit = !!report && !!user && report.userId === user.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!report || !user) return;
    if (!canEdit) {
      toast.error('Hanya pemilik laporan yang dapat mengedit');
      return;
    }
    if (!formData.category) {
      toast.error('Pilih kategori laporan');
      return;
    }

    setLoading(true);
    const updatedReport: Report = {
      ...report,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      photos,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateReport(updatedReport, user.id);
      toast.success('Laporan berhasil diperbarui');
      navigate(`/warga/laporan/${report.id}`);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Gagal memperbarui laporan';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Memuat data laporan...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Laporan tidak ditemukan</p>
          <button
            onClick={() => navigate('/warga/riwayat')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 font-semibold">Anda tidak memiliki akses untuk mengedit laporan ini</p>
          <button
            onClick={() => navigate('/warga/riwayat')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Kembali ke Riwayat
          </button>
        </div>
      </div>
    );
  }

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
                <h1 className="font-bold text-gray-900">Edit Laporan</h1>
                <p className="text-xs text-gray-500">Perbarui laporan Anda</p>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Pengaduan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, category: cat.name }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.category === cat.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {cat.icon === 'Construction'
                          ? '🏗️'
                          : cat.icon === 'Trash2'
                            ? '🗑️'
                            : cat.icon === 'Shield'
                              ? '🛡️'
                              : cat.icon === 'Users'
                                ? '👥'
                                : cat.icon === 'Heart'
                                  ? '❤️'
                                  : cat.icon === 'GraduationCap'
                                    ? '🎓'
                                    : '📋'}
                      </div>
                      <p className="text-xs font-medium text-gray-700">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Laporan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto/Video Bukti</label>
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-all">
                        <Upload className="w-7 h-7 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Tambah foto/video</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4 hingga 50MB</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*,video/*" multiple onChange={handlePhotoUpload} />
                  </label>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/warga/laporan/${report.id}`)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Menyimpan...'
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
