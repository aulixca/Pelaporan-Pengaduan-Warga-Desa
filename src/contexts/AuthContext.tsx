import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  adminResetPasswordApi,
  changePasswordApi,
  createUserApi,
  fetchUsersApi,
  loginApi,
  registerApi,
  requestPasswordResetApi,
  resetPasswordApi,
  updateUserApi,
  type AuthUser,
  type CreateUserPayload,
} from '../utils/authApi';

export interface User extends AuthUser {}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  nik: string;
  phone: string;
}

export interface CreateAccountData extends CreateUserPayload {}

interface PasswordResetRequestResult {
  success: boolean;
  message: string;
  resetCode?: string;
  expiresAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updatedData: Partial<User>) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<PasswordResetRequestResult>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<boolean>;
  listUsers: () => Promise<User[]>;
  createUser: (data: CreateAccountData) => Promise<boolean>;
  updateUserByAdmin: (targetUserId: string, updatedData: Partial<User>) => Promise<boolean>;
  resetUserPasswordByAdmin: (targetUserId: string, newPassword: string) => Promise<boolean>;
}

interface LocalUserRecord extends User {
  password: string;
}

interface LocalResetCodeRecord {
  code: string;
  expiresAt: number;
}

const USERS_STORAGE_KEY = 'users';
const CURRENT_USER_STORAGE_KEY = 'currentUser';
const RESET_CODES_STORAGE_KEY = 'passwordResetCodes';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseStoredUsers(): LocalUserRecord[] {
  return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
}

function saveStoredUsers(users: LocalUserRecord[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function parseStoredResetCodes(): Record<string, LocalResetCodeRecord> {
  return JSON.parse(localStorage.getItem(RESET_CODES_STORAGE_KEY) || '{}');
}

function saveStoredResetCodes(data: Record<string, LocalResetCodeRecord>) {
  localStorage.setItem(RESET_CODES_STORAGE_KEY, JSON.stringify(data));
}

function stripPassword(user: LocalUserRecord): User {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('failed to fetch') || message.includes('networkerror') || message.includes('load failed');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const apiUser = await loginApi(email, password);
      setUser(apiUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(apiUser));
      return true;
    } catch (error) {
      if (!isNetworkError(error)) {
        return false;
      }

      const users = parseStoredUsers();
      const foundUser = users.find((u) => u.email === email && u.password === password && u.isActive !== false);
      if (!foundUser) return false;

      const safeUser = stripPassword(foundUser);
      setUser(safeUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(safeUser));
      return true;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const apiUser = await registerApi(data);
      setUser(apiUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(apiUser));
      return true;
    } catch (error) {
      if (!isNetworkError(error)) {
        return false;
      }

      const users = parseStoredUsers();
      if (users.some((u) => u.email === data.email)) {
        return false;
      }

      const nowIso = new Date().toISOString();
      const newUser: LocalUserRecord = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        password: data.password,
        nik: data.nik,
        phone: data.phone,
        role: 'warga',
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      users.push(newUser);
      saveStoredUsers(users);

      const safeUser = stripPassword(newUser);
      setUser(safeUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(safeUser));
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updated = await updateUserApi(user.id, user.id, updatedData);
      setUser(updated);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      if (!isNetworkError(error)) {
        return false;
      }

      const users = parseStoredUsers();
      const userIndex = users.findIndex((u) => u.id === user.id);
      if (userIndex < 0) return false;

      users[userIndex] = {
        ...users[userIndex],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      saveStoredUsers(users);

      const updatedUser: User = stripPassword(users[userIndex]);
      setUser(updatedUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return true;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await changePasswordApi(user.id, user.id, currentPassword, newPassword);
      return true;
    } catch (error) {
      if (!isNetworkError(error)) {
        return false;
      }

      const users = parseStoredUsers();
      const target = users.find((u) => u.id === user.id && u.password === currentPassword);
      if (!target) return false;

      target.password = newPassword;
      target.updatedAt = new Date().toISOString();
      saveStoredUsers(users);
      return true;
    }
  };

  const requestPasswordReset = async (email: string): Promise<PasswordResetRequestResult> => {
    try {
      return await requestPasswordResetApi(email);
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      const users = parseStoredUsers();
      const target = users.find((u) => u.email === email && u.isActive !== false);
      if (!target) {
        throw new Error('Email tidak terdaftar dalam sistem');
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAtEpoch = Date.now() + 15 * 60 * 1000;
      const existingCodes = parseStoredResetCodes();
      existingCodes[email] = { code: resetCode, expiresAt: expiresAtEpoch };
      saveStoredResetCodes(existingCodes);

      return {
        success: true,
        message: 'Kode reset berhasil dibuat.',
        resetCode,
        expiresAt: new Date(expiresAtEpoch).toISOString(),
      };
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string): Promise<boolean> => {
    try {
      return await resetPasswordApi(email, resetCode, newPassword);
    } catch (error) {
      if (!isNetworkError(error)) {
        return false;
      }

      const users = parseStoredUsers();
      const targetIndex = users.findIndex((u) => u.email === email && u.isActive !== false);
      if (targetIndex < 0) return false;

      const resetCodes = parseStoredResetCodes();
      const codeRecord = resetCodes[email];
      if (!codeRecord) return false;
      if (Date.now() > codeRecord.expiresAt) return false;
      if (codeRecord.code !== resetCode) return false;

      users[targetIndex].password = newPassword;
      users[targetIndex].updatedAt = new Date().toISOString();
      saveStoredUsers(users);

      delete resetCodes[email];
      saveStoredResetCodes(resetCodes);
      return true;
    }
  };

  const listUsers = async (): Promise<User[]> => {
    if (!user || user.role !== 'admin') return [];

    try {
      return await fetchUsersApi(user.id);
    } catch (error) {
      if (!isNetworkError(error)) {
        return [];
      }

      return parseStoredUsers().map(stripPassword);
    }
  };

  const createUser = async (data: CreateAccountData): Promise<boolean> => {
    if (!user || user.role !== 'admin') return false;

    try {
      await createUserApi(user.id, data);
      return true;
    } catch (error) {
      if (!isNetworkError(error)) {
        return false;
      }

      const users = parseStoredUsers();
      if (users.some((u) => u.email === data.email)) return false;

      const nowIso = new Date().toISOString();
      const newUser: LocalUserRecord = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        nik: data.nik || '',
        phone: data.phone || '',
        isActive: data.isActive ?? true,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      users.push(newUser);
      saveStoredUsers(users);
      return true;
    }
  };

  const updateUserByAdmin = async (targetUserId: string, updatedData: Partial<User>): Promise<boolean> => {
    if (!user || user.role !== 'admin') return false;

    try {
      const updated = await updateUserApi(user.id, targetUserId, updatedData);
      if (targetUserId === user.id) {
        setUser(updated);
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updated));
      }
      return true;
    } catch (error) {
      if (!isNetworkError(error)) {
        return false;
      }

      const users = parseStoredUsers();
      const targetIndex = users.findIndex((u) => u.id === targetUserId);
      if (targetIndex < 0) return false;

      users[targetIndex] = {
        ...users[targetIndex],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      saveStoredUsers(users);

      if (targetUserId === user.id) {
        const nextUser = stripPassword(users[targetIndex]);
        setUser(nextUser);
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(nextUser));
      }
      return true;
    }
  };

  const resetUserPasswordByAdmin = async (targetUserId: string, newPassword: string): Promise<boolean> => {
    if (!user || user.role !== 'admin') return false;

    try {
      return await adminResetPasswordApi(user.id, targetUserId, newPassword);
    } catch (error) {
      if (!isNetworkError(error)) {
        return false;
      }

      const users = parseStoredUsers();
      const target = users.find((u) => u.id === targetUserId);
      if (!target) return false;

      target.password = newPassword;
      target.updatedAt = new Date().toISOString();
      saveStoredUsers(users);
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        updateUser,
        updatePassword,
        requestPasswordReset,
        resetPassword,
        listUsers,
        createUser,
        updateUserByAdmin,
        resetUserPasswordByAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
