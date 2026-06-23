import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { fetchReports } from '../../utils/api';
import type { Report } from '../../utils/mockData';
import { Menu, Search, Download, FileText, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const allReports = reports;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterCategory, setFilterCategory] = useState<string>('semua');
  const [sortBy, setSortBy] = useState<string>('terbaru');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categories = Array.from(new Set(allReports.map(r => r.category)));

  let filteredReports = allReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'semua' || report.status === filterStatus;
    const matchesCategory = filterCategory === 'semua' || report.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (sortBy === 'terbaru') {
    filteredReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'terlama') {
    filteredReports.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
      case 'menunggu': return 'Menunggu';
      case 'diproses': return 'Diproses';
      case 'selesai': return 'Selesai';
      case 'ditolak': return 'Ditolak';
      default: return status;
    }
  };

  const handleExport = () => {
    const exportRows = filteredReports.map((report) => ({
      ID: report.id,
      Tanggal: new Date(report.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      Pelapor: report.userName,
      'Judul Laporan': report.title,
      Kategori: report.category,
      Lokasi: report.location,
      Status: getStatusText(report.status),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows, {
      header: ['ID', 'Tanggal', 'Pelapor', 'Judul Laporan', 'Kategori', 'Lokasi', 'Status'],
    });

    const columnWidths = ['ID', 'Tanggal', 'Pelapor', 'Judul Laporan', 'Kategori', 'Lokasi', 'Status'].map((header) => {
      const maxLength = Math.max(
        header.length,
        ...exportRows.map((row) => String(row[header as keyof typeof row] ?? '').length),
      );

      return { wch: Math.max(maxLength, 12) };
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Pengaduan');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-pengaduan-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success('Laporan berhasil diekspor ke Excel!');
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
                <h1 className="font-bold text-white">Kelola Laporan</h1>
                <p className="text-xs text-blue-200">Semua laporan pengaduan warga</p>
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
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
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
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="semua">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
              </select>
              <button
                onClick={handleExport}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">
                {filteredReports.length} Laporan Ditemukan
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.5) }}
                    onClick={() => navigate(`/admin/laporan/${report.id}`)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 flex gap-4">
                        {report.photos.length > 0 && (
                          <img
                            src={report.photos[0]}
                            alt={report.title}
                            className="w-20 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">{report.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{report.description}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="font-medium text-blue-600">{report.userName}</span>
                            <span>•</span>
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/laporan/${report.id}?action=follow-up`);
                          }}
                          className="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Tindak Lanjut
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/laporan/${report.id}`);
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                        >
                          <Eye className="w-4 h-4" />
                          Detail
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Tidak ada laporan ditemukan</p>
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
