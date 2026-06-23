const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/laporan-api';

export type UserRole = 'warga' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nik?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  nik: string;
  phone: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  nik?: string;
  phone?: string;
  isActive?: boolean;
}

export interface PasswordResetRequestResponse {
  success: boolean;
  message: string;
  resetCode?: string;
  expiresAt?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.error || 'API request failed');
  }
  return json as T;
}

export async function loginApi(email: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth.php?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await handleResponse<{ success: boolean; user: AuthUser }>(response);
  return json.user;
}

export async function registerApi(payload: RegisterPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth.php?action=register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await handleResponse<{ success: boolean; user: AuthUser }>(response);
  return json.user;
}

export async function requestPasswordResetApi(email: string): Promise<PasswordResetRequestResponse> {
  const response = await fetch(`${API_BASE_URL}/auth.php?action=forgot-password-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return handleResponse<PasswordResetRequestResponse>(response);
}

export async function resetPasswordApi(email: string, resetCode: string, newPassword: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/auth.php?action=forgot-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, resetCode, newPassword }),
  });

  await handleResponse<{ success: boolean }>(response);
  return true;
}

export async function fetchUsersApi(actorId: string): Promise<AuthUser[]> {
  const response = await fetch(`${API_BASE_URL}/users.php?actorId=${encodeURIComponent(actorId)}`);
  return handleResponse<AuthUser[]>(response);
}

export async function createUserApi(actorId: string, payload: CreateUserPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorId, ...payload }),
  });

  const json = await handleResponse<{ success: boolean; user: AuthUser }>(response);
  return json.user;
}

export async function updateUserApi(
  actorId: string,
  userId: string,
  payload: Partial<Omit<AuthUser, 'id'>>,
): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/users.php?id=${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorId, ...payload }),
  });

  const json = await handleResponse<{ success: boolean; user: AuthUser }>(response);
  return json.user;
}

export async function changePasswordApi(
  actorId: string,
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  const response = await fetch(
    `${API_BASE_URL}/users.php?id=${encodeURIComponent(userId)}&action=password`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorId, currentPassword, newPassword }),
    },
  );

  await handleResponse<{ success: boolean }>(response);
  return true;
}

export async function adminResetPasswordApi(actorId: string, userId: string, newPassword: string): Promise<boolean> {
  const response = await fetch(
    `${API_BASE_URL}/users.php?id=${encodeURIComponent(userId)}&action=admin-reset-password`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorId, newPassword }),
    },
  );

  await handleResponse<{ success: boolean }>(response);
  return true;
}
