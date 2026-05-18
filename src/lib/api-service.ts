import api from '@/api/api.js';
import type { AxiosRequestConfig } from 'axios';

// ── Token management ──────────────────────────────────────────────────────────
const AUTH_TOKEN_KEY = 'authToken';
const LEGACY_AUTH_TOKEN_KEY = 'auth_token';
const CURRENT_USER_KEY = 'current_user';
const USER_ID_KEY = 'userId';
export const UPLOAD_FORM_DRAFT_KEY_PREFIX = 'upload_form_draft_';
const UPLOAD_FORM_DRAFT_KEY = 'thesisUploadDraft';

let authToken: string | null = localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

function getJwtPayload(token: string): { exp?: number } | null {
  const segments = token.split('.');
  if (segments.length < 2) return null;

  try {
    return JSON.parse(base64UrlDecode(segments[1])) as { exp?: number };
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(token: string): number | null {
  const payload = getJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000;
}

export function isTokenExpired(token: string): boolean {
  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) return true;
  return Date.now() >= expiryMs;
}

function clearUploadFormDrafts(): void {
  localStorage.removeItem(UPLOAD_FORM_DRAFT_KEY);
  const keysToClear: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(UPLOAD_FORM_DRAFT_KEY_PREFIX)) {
      keysToClear.push(key);
    }
  }
  keysToClear.forEach((key) => localStorage.removeItem(key));
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  const token = authToken || localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
  if (!token) return null;

  if (isTokenExpired(token)) {
    apiSignOut();
    return null;
  }

  return token;
}

export function getStoredUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
async function apiRequest<T>(
  endpoint: string,
  options: (AxiosRequestConfig & { body?: string }) = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Convert fetch-style 'body' to axios-style 'data'
  const axiosOptions: AxiosRequestConfig = {
    ...options,
    headers,
  };
  if ('body' in options && options.body) {
    axiosOptions.data = options.body;
    delete axiosOptions.body;
  }

  // Ensure HTTP method is correct and normalized for axios
  if (!axiosOptions.method) {
    axiosOptions.method = axiosOptions.data ? 'post' : 'get';
  }
  if (typeof axiosOptions.method === 'string') {
    axiosOptions.method = axiosOptions.method.toLowerCase() as any;
  }

  try {
    const response = await api.request<T>({
      url: endpoint,
      ...axiosOptions,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    return response.data as T;
  } catch (error) {
    const axiosError = error as { response?: { status?: number; data?: any } };
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    if (status === 401 && !endpoint.startsWith('/auth/')) {
      apiSignOut();
      if (window.location.pathname.startsWith('/dashboard')) {
        window.location.replace('/login');
      }
    }

    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }
}

// ── Types matching the C# DTOs ────────────────────────────────────────────────
export type UserRole = 'admin' | 'uploader' | 'approver' | 'faculty' | 'student';

/** Matches UserDto in AuthDTOs.cs */
export interface User {
  id: string;          // UserId as string
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  isApproved: boolean;
  isActive: boolean;
  department?: string | null;
  studentId?: string | null;
  createdAt: string;
  lastLogin?: string | null;
}

/** Matches ThesisDto in ThesisDTOs.cs */
export interface Thesis {
  id: string;           // ThesisId as string
  title: string;
  abstract: string;
  keywords: string[];
  authors: string;
  mainAuthorName?: string | null;
  coAuthorName?: string | null;
  advisors?: string | null;
  department: string;
  fieldOfResearch: string;
  year: number;
  pdfUrl: string | null;
  status: 'pending' | 'approved' | 'rejected';
  uploadedBy: string | null;
  approvedBy: string | null;
  createdAt: string;    // UploadedAt
  updatedAt: string;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  viewCount: number;
  downloadCount: number;
  apaCitation?: string | null;
  mainAuthorEmail?: string | null;
  coAuthorEmail?: string | null;
  researchType?: string | null;
}

export interface PasswordResetRequest {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt: string | null;
  processedBy: string | null;
}

// ── Authentication ────────────────────────────────────────────────────────────

export async function apiSignIn(email: string, password: string): Promise<User> {
  const response = await apiRequest<{ token: string; user: User }>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(response.token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
  localStorage.setItem(USER_ID_KEY, response.user.id);
  return response.user;
}

export async function apiSignUp(
  email: string,
  password: string,
  name: string,
  role: UserRole,
  department?: string,
  studentId?: string
): Promise<User> {
  const response = await apiRequest<{ token: string; user: User }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role, department, studentId }),
  });
  setAuthToken(response.token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
  localStorage.setItem(USER_ID_KEY, response.user.id);
  return response.user;
}

export function apiSignOut(): void {
  setAuthToken(null);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(USER_ID_KEY);
  clearUploadFormDrafts();
}

export function getCurrentUser(): User | null {
  if (!getAuthToken()) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }

  const json = localStorage.getItem(CURRENT_USER_KEY);
  if (!json) return null;
  try {
    return JSON.parse(json) as User;
  } catch {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
}

// ── User Management ───────────────────────────────────────────────────────────

export async function apiGetAllUsers(): Promise<User[]> {
  return apiRequest<User[]>('/user');
}

export async function apiGetUserById(id: string): Promise<User> {
  return apiRequest<User>(`/user/${id}`);
}

export async function apiUpdateUserStatus(
  userId: string,
  updates: { isApproved?: boolean; isActive?: boolean }
): Promise<void> {
  await apiRequest(`/user/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// ── Thesis Management ─────────────────────────────────────────────────────────

export async function apiGetAllTheses(): Promise<Thesis[]> {
  return apiRequest<Thesis[]>('/thesis');
}

export interface SearchThesesParams {
  query?: string | null;
  department?: string | null;
  fieldOfResearch?: string | null;
  researchType?: string | null;
  year?: number | null;
  status?: 'pending' | 'approved' | 'rejected' | null;
}

export async function apiSearchTheses(params: SearchThesesParams = {}): Promise<Thesis[]> {
  const query = new URLSearchParams();
  const normalizedQuery = params.query?.trim();

  if (normalizedQuery) query.set('query', normalizedQuery);
  if (params.department) query.set('department', params.department);
  if (params.fieldOfResearch) query.set('fieldOfResearch', params.fieldOfResearch);
  if (params.researchType) query.set('researchType', params.researchType);
  if (typeof params.year === 'number') query.set('year', String(params.year));
  if (params.status) query.set('status', params.status);

  const qs = query.toString();
  return apiRequest<Thesis[]>(`/thesis/search${qs ? `?${qs}` : ''}`);
}

export async function apiGetThesisById(id: string): Promise<Thesis | null> {
  try {
    return await apiRequest<Thesis>(`/thesis/${id}`);
  } catch {
    return null;
  }
}

export async function apiCreateThesis(thesis: {
  title: string;
  abstract: string;
  keywords: string[];
  authors: string;
  mainAuthorName: string;
  coAuthorName: string;
  advisors?: string | null;
  department: string;
  fieldOfResearch?: string | null;
  year: number;
  pdfUrl: string | null;
  pdfData?: string;
  uploadedBy: string;
  mainAuthorEmail: string;
  coAuthorEmail?: string | null;
  researchType?: string | null;
}): Promise<Thesis> {
  return apiRequest<Thesis>('/thesis', {
    method: 'POST',
    body: JSON.stringify(thesis),
  });
}

export async function apiUpdateThesis(
  id: string,
  updates: Partial<Thesis> & { rejectionReason?: string }
): Promise<Thesis> {
  return apiRequest<Thesis>(`/thesis/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function apiDeleteThesis(id: string): Promise<void> {
  await apiRequest(`/thesis/${id}`, { method: 'DELETE' });
}

export async function apiUploadPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const response = await apiRequest<{ fileId: string }>('/thesis/upload-pdf', {
          method: 'POST',
          body: JSON.stringify({ fileData: base64 }),
        });
        resolve(response.fileId);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function apiGetPDFUrl(fileId: string): Promise<string | null> {
  try {
    const response = await apiRequest<{ data: string }>(`/thesis/file/${fileId}`);
    return response.data;
  } catch {
    return null;
  }
}

export async function apiGetThesisPdfById(thesisId: string): Promise<string | null> {
  try {
    const response = await apiRequest<{ data: string | null }>(`/thesis/${encodeURIComponent(thesisId)}/pdf`);
    return response?.data ?? null;
  } catch {
    return null;
  }
}

// ── Password Reset ────────────────────────────────────────────────────────────

export async function apiCreatePasswordResetRequest(
  email: string
): Promise<PasswordResetRequest> {
  return apiRequest<PasswordResetRequest>('/password-reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function apiGetAllPasswordResetRequests(): Promise<PasswordResetRequest[]> {
  return apiRequest<PasswordResetRequest[]>('/password-reset');
}

export async function apiUpdatePasswordResetRequest(
  id: string,
  updates: { status: string; processedBy: string }
): Promise<PasswordResetRequest> {
  return apiRequest<PasswordResetRequest>(`/password-reset/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function apiDeletePasswordResetRequest(id: string): Promise<void> {
  await apiRequest(`/password-reset/${id}`, { method: 'DELETE' });
}

export async function apiCheckPasswordResetStatus(
  email: string
): Promise<{ id: string; email: string; status: string }> {
  return apiRequest<{ id: string; email: string; status: string }>(`/auth/verify-email?email=${encodeURIComponent(email)}`, {
    method: 'GET',
  });
}

export async function apiResetPassword(
  email: string,
  newPassword: string
): Promise<void> {
  await apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword }),
  });
}
