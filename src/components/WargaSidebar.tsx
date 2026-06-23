import { useNavigate, useLocation } from 'react-router';
import { Home, FileText, PlusCircle, Clock, User, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import logoKabupaten from '../imports/logo_kab_pkl.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WargaSidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      description: 'Ringkasan laporan dan kegiatan',
      path: '/warga',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      icon: PlusCircle,
      label: 'Buat Laporan',
      description: 'Laporkan pengaduan baru',
      path: '/warga/buat-laporan',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      icon: FileText,
      label: 'Riwayat Laporan',
      description: 'Lihat semua laporan',
      path: '/warga/riwayat',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      icon: Clock,
      label: 'Cek Status',
      description: 'Pantau status laporan',
      path: '/warga/riwayat',
      color: 'from-slate-500 to-blue-600',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-600',
    },
    {
      icon: User,
      label: 'Profil Saya',
      description: 'Kelola akun Anda',
      path: '/warga/profil',
      color: 'from-slate-500 to-blue-600',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-600',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-xl z-50 flex flex-col transition-all duration-300 ease-in-out"
      >
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-soft flex items-center justify-center">
                <img src={logoKabupaten} alt="Logo Kabupaten Pekalongan" className="w-11 h-11 object-contain" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Portal Warga</h2>
                <p className="text-xs text-gray-500">Pengaduan Desa</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500">Warga Desa</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <motion.button
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full text-left p-4 rounded-xl transition-all group ${
                    active
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : `${item.bgColor} hover:shadow-md`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        active ? 'bg-white/20' : 'bg-white'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${active ? 'text-white' : item.textColor}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold mb-0.5 ${active ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </p>
                      <p className={`text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-3 text-slate-700 font-semibold"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-slate-700" />
            </div>
            <span>Keluar</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
