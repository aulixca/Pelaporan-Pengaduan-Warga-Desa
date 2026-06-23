import { useEffect, useMemo, useState } from 'react';
import { useAuth, type CreateAccountData, type User as AccountUser } from '../../contexts/AuthContext';
import {
  Menu,
  User,
  Mail,
  Phone,
  Lock,
  Save,
  X,
  LogOut,
  Eye,
  EyeOff,
  Users,
  Search,
  Plus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Pencil,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import AdminSidebar from '../../components/AdminSidebar';

type RoleFilter = 'semua' | 'warga' | 'admin';

interface AccountFormState {
  name: string;
  email: string;
  phone: string;
  nik: string;
  role: 'warga' | 'admin';
  password: string;
  isActive: boolean;
}

const baseAccountForm: AccountFormState = {
  name: '',
  email: '',
  phone: '',
  nik: '',
  role: 'warga',
  password: '',
  isActive: true,
};

export default function AdminAccountPage() {
  const {
    user,
    logout,
    updateUser,
    updatePassword,
    listUsers,
    createUser,
    updateUserByAdmin,
    resetUserPasswordByAdmin,
  } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [accounts, setAccounts] = useState<AccountUser[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('semua');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountUser | null>(null);
  const [accountForm, setAccountForm] = useState<AccountFormState>(baseAccountForm);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<AccountUser | null>(null);
  const [adminResetForm, setAdminResetForm] = useState({ newPassword: '', confirmPassword: '' });

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const data = await listUsers();
      setAccounts(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data akun');
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAccounts();
    }
  }, [user]);

  const filteredAccounts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchRole = roleFilter === 'semua' || account.role === roleFilter;
      const matchKeyword =
        keyword === '' ||
        account.name.toLowerCase().includes(keyword) ||
        account.email.toLowerCase().includes(keyword) ||
        (account.phone || '').toLowerCase().includes(keyword) ||
        (account.nik || '').toLowerCase().includes(keyword);
      return matchRole && matchKeyword;
    });
  }, [accounts, roleFilter, searchQuery]);

  const resetAccountForm = () => {
    setAccountForm({ ...baseAccountForm });
    setEditingAccount(null);
    setShowAccountForm(false);
  };

  const openCreateForm = () => {
    setEditingAccount(null);
    setAccountForm({ ...baseAccountForm });
    setShowAccountForm(true);
  };

  const openEditForm = (account: AccountUser) => {
    setEditingAccount(account);
    setAccountForm({
      name: account.name,
      email: account.email,
      phone: account.phone || '',
      nik: account.nik || '',
      role: account.role,
      password: '',
      isActive: account.isActive !== false,
    });
    setShowAccountForm(true);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }
    if (!editForm.email.trim()) {
      toast.error('Email tidak boleh kosong');
      return;
    }

    const success = await updateUser({
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
    });

    if (success) {
      toast.success('Profil berhasil diperbarui');
      setIsEditMode(false);
      loadAccounts();
    } else {
      toast.error('Gagal memperbarui profil');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      toast.error('Password saat ini harus diisi');
      return;
    }
    if (!passwordForm.newPassword) {
      toast.error('Password baru harus diisi');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    const success = await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (success) {
      toast.success('Password berhasil diubah');
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error('Password saat ini salah');
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditMode(false);
  };

  const handleSaveAccount = async () => {
    if (!accountForm.name.trim()) {
      toast.error('Nama akun wajib diisi');
      return;
    }
    if (!accountForm.email.trim()) {
      toast.error('Email akun wajib diisi');
      return;
    }
    if (!editingAccount && accountForm.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    if (accountForm.role === 'warga' && accountForm.nik && accountForm.nik.length !== 16) {
      toast.error('NIK warga harus 16 digit');
      return;
    }

    let success = false;
    if (editingAccount) {
      success = await updateUserByAdmin(editingAccount.id, {
        name: accountForm.name.trim(),
        email: accountForm.email.trim(),
        phone: accountForm.phone.trim(),
        nik: accountForm.role === 'warga' ? accountForm.nik.trim() : '',
        role: accountForm.role,
        isActive: accountForm.isActive,
      });
    } else {
      const payload: CreateAccountData = {
        name: accountForm.name.trim(),
        email: accountForm.email.trim(),
        phone: accountForm.phone.trim(),
        nik: accountForm.role === 'warga' ? accountForm.nik.trim() : '',
        role: accountForm.role,
        password: accountForm.password,
        isActive: accountForm.isActive,
      };
      success = await createUser(payload);
    }

    if (!success) {
      toast.error(editingAccount ? 'Gagal memperbarui akun' : 'Gagal menambah akun');
      return;
    }

    toast.success(editingAccount ? 'Akun berhasil diperbarui' : 'Akun baru berhasil ditambahkan');
    resetAccountForm();
    loadAccounts();
  };

  const handleToggleStatus = async (account: AccountUser) => {
    if (account.id === user?.id && account.isActive !== false) {
      toast.error('Akun admin yang sedang dipakai tidak dapat dinonaktifkan');
      return;
    }

    const nextStatus = !(account.isActive !== false);
    const success = await updateUserByAdmin(account.id, { isActive: nextStatus });
    if (!success) {
      toast.error('Gagal mengubah status akun');
      return;
    }

    toast.success(nextStatus ? 'Akun berhasil diaktifkan' : 'Akun berhasil dinonaktifkan');
    loadAccounts();
  };

  const openResetModal = (account: AccountUser) => {
    setResetTarget(account);
    setAdminResetForm({ newPassword: '', confirmPassword: '' });
    setShowResetModal(true);
  };

  const handleAdminPasswordReset = async () => {
    if (!resetTarget) return;
    if (adminResetForm.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }
    if (adminResetForm.newPassword !== adminResetForm.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    const success = await resetUserPasswordByAdmin(resetTarget.id, adminResetForm.newPassword);
    if (!success) {
      toast.error('Gagal mereset password akun');
      return;
    }

    toast.success(`Password akun ${resetTarget.name} berhasil direset`);
    setShowResetModal(false);
    setResetTarget(null);
    setAdminResetForm({ newPassword: '', confirmPassword: '' });
  };

  const roleBadge = (role: AccountUser['role']) => {
    if (role === 'admin') {
      return <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">Admin</span>;
    }
    return <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Warga</span>;
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
                <h1 className="font-bold text-white">Kelola Akun</h1>
                <p className="text-xs text-blue-200">Profil admin, akun warga, dan akun admin lain</p>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {(user?.name?.charAt(0) || 'A').toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  Administrator
                </p>
              </div>

              {!isEditMode ? (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Nama Lengkap</p>
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{user?.email}</p>
                    </div>
                  </div>

                  {user?.phone && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">No. Telepon</p>
                        <p className="font-semibold text-gray-900">{user?.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Masukkan email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => handleEditChange('phone', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {!isEditMode ? (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                  >
                    Edit Profil
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Simpan
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Batal
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <Lock className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-bold text-gray-900">Ubah Password Saya</h3>
              </div>

              {!showChangePassword ? (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
                >
                  Ubah Password
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password Saat Ini</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none pr-10"
                        placeholder="Masukkan password saat ini"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPasswords.current ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password Baru</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none pr-10"
                        placeholder="Masukkan password baru"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPasswords.new ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none pr-10"
                        placeholder="Konfirmasi password baru"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPasswords.confirm ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleChangePassword}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Password
                    </button>
                    <button
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Manajemen Akun Warga & Admin
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Tambah, edit, nonaktifkan akun, dan reset password akun</p>
                </div>
                <button
                  onClick={openCreateForm}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Akun
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama, email, NIK, atau telepon..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="semua">Semua Role</option>
                  <option value="warga">Warga</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Nama</th>
                      <th className="px-4 py-3 text-left font-semibold">Kontak</th>
                      <th className="px-4 py-3 text-left font-semibold">Role</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loadingAccounts ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                          Memuat data akun...
                        </td>
                      </tr>
                    ) : filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                          Belum ada akun yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map((account) => (
                        <tr key={account.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 align-top">
                            <p className="font-semibold text-gray-900">{account.name}</p>
                            {account.nik && <p className="text-xs text-gray-500 mt-1">NIK: {account.nik}</p>}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <p className="text-gray-800">{account.email}</p>
                            <p className="text-xs text-gray-500 mt-1">{account.phone || '-'}</p>
                          </td>
                          <td className="px-4 py-3 align-top">{roleBadge(account.role)}</td>
                          <td className="px-4 py-3 align-top">
                            {account.isActive !== false ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold inline-flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Aktif
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Nonaktif
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => openEditForm(account)}
                                className="px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold hover:bg-blue-200 transition-all flex items-center gap-1"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                              </button>

                              <button
                                onClick={() => openResetModal(account)}
                                className="px-2.5 py-1.5 bg-orange-100 text-orange-700 rounded-md text-xs font-semibold hover:bg-orange-200 transition-all flex items-center gap-1"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                Reset Password
                              </button>

                              <button
                                onClick={() => handleToggleStatus(account)}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                  account.isActive !== false
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                }`}
                              >
                                {account.isActive !== false ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Keluar dari Akun
            </button>
          </motion.div>
        </div>
      </div>

      {showAccountForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingAccount ? `Edit Akun: ${editingAccount.name}` : 'Tambah Akun Baru'}
              </h3>
              <button
                onClick={resetAccountForm}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Masukkan nama"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                  <select
                    value={accountForm.role}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        role: e.target.value as 'warga' | 'admin',
                        nik: e.target.value === 'admin' ? '' : prev.nik,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="warga">Warga</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. Telepon</label>
                  <input
                    type="tel"
                    value={accountForm.phone}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              {accountForm.role === 'warga' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">NIK (opsional)</label>
                  <input
                    type="text"
                    value={accountForm.nik}
                    onChange={(e) =>
                      setAccountForm((prev) => ({ ...prev, nik: e.target.value.replace(/\D/g, '').slice(0, 16) }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="16 digit NIK"
                    maxLength={16}
                  />
                </div>
              )}

              {!editingAccount && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password Awal</label>
                  <input
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={accountForm.isActive}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4"
                />
                Akun aktif
              </label>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={resetAccountForm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAccount}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
              >
                {editingAccount ? 'Simpan Perubahan' : 'Tambah Akun'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && resetTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Reset Password Akun</h3>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetTarget(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Anda akan mereset password untuk akun <span className="font-semibold">{resetTarget.name}</span>.
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password Baru</label>
                <input
                  type="password"
                  value={adminResetForm.newPassword}
                  onChange={(e) => setAdminResetForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Konfirmasi Password</label>
                <input
                  type="password"
                  value={adminResetForm.confirmPassword}
                  onChange={(e) => setAdminResetForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetTarget(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleAdminPasswordReset}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
