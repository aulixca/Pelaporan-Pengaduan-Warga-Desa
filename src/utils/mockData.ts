export interface Report {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: 'menunggu' | 'diproses' | 'selesai' | 'ditolak';
  photos: string[];
  createdAt: string;
  updatedAt: string;
  progress: ReportProgress[];
  adminNote?: string;
  alasan_penolakan?: string;
}

export interface ReportProgress {
  id: string;
  status: string;
  note: string;
  createdAt: string;
  createdBy: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { id: '1', name: 'Infrastruktur', icon: 'Construction', color: '#3b82f6' },
  { id: '2', name: 'Kebersihan', icon: 'Trash2', color: '#10b981' },
  { id: '3', name: 'Keamanan', icon: 'Shield', color: '#ef4444' },
  { id: '4', name: 'Pelayanan', icon: 'Users', color: '#f59e0b' },
  { id: '5', name: 'Kesehatan', icon: 'Heart', color: '#ec4899' },
  { id: '6', name: 'Pendidikan', icon: 'GraduationCap', color: '#8b5cf6' },
  { id: '7', name: 'Lainnya', icon: 'MoreHorizontal', color: '#6b7280' },
];

function normalizeReport(report: Report): Report {
  const rejectionReason = (report.alasan_penolakan ?? report.adminNote ?? '').toString().trim();

  return {
    ...report,
    adminNote: rejectionReason || report.adminNote || '',
    alasan_penolakan: rejectionReason,
  };
}

export function initializeMockData() {
  if (!localStorage.getItem('users')) {
    const users = [
      {
        id: '1',
        name: 'Admin Desa',
        email: 'admin@desa.id',
        password: 'admin123',
        role: 'admin',
        phone: '081234567890',
        isActive: true,
        createdAt: '2026-05-01T07:30:00',
        updatedAt: '2026-05-01T07:30:00',
      },
      {
        id: '2',
        name: 'Budi Santoso',
        email: 'budi@email.com',
        password: 'budi123',
        role: 'warga',
        nik: '3201010101010001',
        phone: '081234567891',
        isActive: true,
        createdAt: '2026-05-01T07:45:00',
        updatedAt: '2026-05-01T07:45:00',
      },
      {
        id: '3',
        name: 'Siti Rahayu',
        email: 'siti@email.com',
        password: 'siti123',
        role: 'warga',
        nik: '3201010101010002',
        phone: '081234567892',
        isActive: true,
        createdAt: '2026-05-01T08:00:00',
        updatedAt: '2026-05-01T08:00:00',
      },
    ];
    localStorage.setItem('users', JSON.stringify(users));
  }

  if (!localStorage.getItem('reports')) {
    const reports: Report[] = [
      {
        id: '1',
        userId: '2',
        userName: 'Budi Santoso',
        title: 'Jalan Berlubang di RT 05',
        description: 'Jalan utama di RT 05 RW 03 terdapat lubang besar yang membahayakan pengendara, terutama saat hujan. Sudah ada beberapa kecelakaan kecil.',
        category: 'Infrastruktur',
        location: 'Jl. Merdeka RT 05 RW 03',
        status: 'diproses',
        photos: ['https://images.unsplash.com/photo-1625935217166-19e38541c0ee?w=400'],
        createdAt: '2026-05-01T08:30:00',
        updatedAt: '2026-05-02T10:00:00',
        progress: [
          {
            id: '1',
            status: 'Laporan Diterima',
            note: 'Laporan telah diterima dan dalam proses verifikasi',
            createdAt: '2026-05-01T08:30:00',
            createdBy: 'System',
          },
          {
            id: '2',
            status: 'Diverifikasi',
            note: 'Laporan telah diverifikasi oleh Admin Desa',
            createdAt: '2026-05-01T14:00:00',
            createdBy: 'Admin Desa',
          },
          {
            id: '3',
            status: 'Dalam Proses',
            note: 'Tim lapangan sudah ditugaskan untuk survey lokasi',
            createdAt: '2026-05-02T10:00:00',
            createdBy: 'Admin Desa',
          },
        ],
      },
      {
        id: '2',
        userId: '3',
        userName: 'Siti Rahayu',
        title: 'Sampah Menumpuk di Dekat Pasar',
        description: 'Tumpukan sampah yang tidak diangkut selama 3 hari di area pasar menyebabkan bau tidak sedap dan mengganggu aktivitas warga.',
        category: 'Kebersihan',
        location: 'Pasar Desa Blok A',
        status: 'selesai',
        photos: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400'],
        createdAt: '2026-04-28T10:15:00',
        updatedAt: '2026-04-30T16:00:00',
        progress: [
          {
            id: '1',
            status: 'Laporan Diterima',
            note: 'Laporan telah diterima',
            createdAt: '2026-04-28T10:15:00',
            createdBy: 'System',
          },
          {
            id: '2',
            status: 'Diverifikasi',
            note: 'Laporan diverifikasi dan akan segera ditindaklanjuti',
            createdAt: '2026-04-28T14:00:00',
            createdBy: 'Admin Desa',
          },
          {
            id: '3',
            status: 'Selesai',
            note: 'Sampah telah diangkut oleh tim kebersihan desa. Terima kasih atas laporannya.',
            createdAt: '2026-04-30T16:00:00',
            createdBy: 'Admin Desa',
          },
        ],
      },
      {
        id: '3',
        userId: '2',
        userName: 'Budi Santoso',
        title: 'Lampu Jalan Mati',
        description: 'Lampu penerangan jalan di RT 02 sudah mati sejak seminggu yang lalu, membuat area menjadi gelap dan rawan kejahatan.',
        category: 'Infrastruktur',
        location: 'Jl. Kartini RT 02 RW 01',
        status: 'menunggu',
        photos: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400'],
        createdAt: '2026-05-04T19:30:00',
        updatedAt: '2026-05-04T19:30:00',
        progress: [
          {
            id: '1',
            status: 'Laporan Diterima',
            note: 'Laporan telah diterima dan menunggu verifikasi',
            createdAt: '2026-05-04T19:30:00',
            createdBy: 'System',
          },
        ],
      },
      {
        id: '4',
        userId: '3',
        userName: 'Siti Rahayu',
        title: 'Pohon Tumbang Menghalangi Jalan',
        description: 'Pohon besar tumbang akibat angin kencang dan menghalangi akses jalan utama ke desa.',
        category: 'Infrastruktur',
        location: 'Jl. Pemuda depan Balai Desa',
        status: 'diproses',
        photos: ['https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400'],
        createdAt: '2026-05-03T06:00:00',
        updatedAt: '2026-05-03T11:00:00',
        progress: [
          {
            id: '1',
            status: 'Laporan Diterima',
            note: 'Laporan darurat diterima',
            createdAt: '2026-05-03T06:00:00',
            createdBy: 'System',
          },
          {
            id: '2',
            status: 'Dalam Proses',
            note: 'Tim darurat sudah ditugaskan untuk membersihkan pohon tumbang',
            createdAt: '2026-05-03T11:00:00',
            createdBy: 'Admin Desa',
          },
        ],
      },
      {
        id: '5',
        userId: '2',
        userName: 'Budi Santoso',
        title: 'Pelayanan Administrasi Lambat',
        description: 'Proses pembuatan KTP sudah 2 minggu belum selesai padahal dijanjikan 5 hari kerja.',
        category: 'Pelayanan',
        location: 'Kantor Desa',
        status: 'ditolak',
        photos: [],
        createdAt: '2026-04-25T09:00:00',
        updatedAt: '2026-04-26T10:00:00',
        adminNote: 'Mohon maaf, untuk keluhan pelayanan administrasi kependudukan dapat langsung ditujukan ke Dinas Kependudukan dan Catatan Sipil karena bukan kewenangan desa.',
        progress: [
          {
            id: '1',
            status: 'Laporan Diterima',
            note: 'Laporan telah diterima',
            createdAt: '2026-04-25T09:00:00',
            createdBy: 'System',
          },
          {
            id: '2',
            status: 'Ditolak',
            note: 'Laporan ditolak karena bukan kewenangan desa',
            createdAt: '2026-04-26T10:00:00',
            createdBy: 'Admin Desa',
          },
        ],
      },
    ];
    localStorage.setItem('reports', JSON.stringify(reports.map(normalizeReport)));
  }

  if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify(categories));
  }
}

export function getReports(): Report[] {
  const rawReports = JSON.parse(localStorage.getItem('reports') || '[]') as Report[];
  const normalizedReports = rawReports.map(normalizeReport);

  if (JSON.stringify(rawReports) !== JSON.stringify(normalizedReports)) {
    localStorage.setItem('reports', JSON.stringify(normalizedReports));
  }

  return normalizedReports;
}

export function saveReport(report: Report) {
  const normalizedReport = normalizeReport(report);
  const reports = getReports();
  const index = reports.findIndex(r => r.id === normalizedReport.id);
  if (index >= 0) {
    reports[index] = normalizedReport;
  } else {
    reports.push(normalizedReport);
  }
  localStorage.setItem('reports', JSON.stringify(reports.map(normalizeReport)));
}

export function deleteReportById(id: string) {
  const reports = getReports().filter((report) => report.id !== id);
  localStorage.setItem('reports', JSON.stringify(reports));
}

export function getCategories(): Category[] {
  return JSON.parse(localStorage.getItem('categories') || '[]');
}

export function saveCategories(cats: Category[]) {
  localStorage.setItem('categories', JSON.stringify(cats));
}
