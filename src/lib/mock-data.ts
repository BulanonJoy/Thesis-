// Data service – connects to the C# ASP.NET Core backend via api-service.ts
import * as api from './api-service';

export type UserRole = 'admin' | 'uploader' | 'approver' | 'faculty' | 'student';

// ── Frontend interfaces ───────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_approved: boolean;
  is_active: boolean;
  department?: string | null;
  student_id?: string | null;
  created_at: string;
  last_login?: string | null;
}

export interface Thesis {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  authors: string;
  mainAuthorName?: string | null;
  coAuthorName?: string | null;
  advisors?: string | null;
  department: string;
  field_of_research: string;
  year: number;
  pdf_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  approved_at?: string | null;
  rejection_reason?: string | null;
  view_count: number;
  download_count: number;
  apaCitation?: string | null;
  ieeeCitation?: string | null;
  acsCitation?: string | null;
  doi?: string | null;
  mainAuthorEmail?: string | null;
  coAuthorEmail?: string | null;
  research_type?: string | null;
}

export interface PasswordResetRequest {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
}

// ── Converters (API camelCase → frontend snake_case) ─────────────────────────

function convertUserFromApi(u: api.User): User {
  const directName = typeof u.name === "string" ? u.name.trim() : "";
  const firstName = typeof u.firstName === "string" ? u.firstName.trim() : "";
  const lastName = typeof u.lastName === "string" ? u.lastName.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const emailFallback = u.email?.split("@")[0]?.trim() || "User";

  return {
    id:          u.id,
    email:       u.email,
    name:        directName || fullName || emailFallback,
    role:        u.role,
    is_approved: u.isApproved,
    is_active:   u.isActive,
    department:  u.department,
    student_id:  u.studentId,
    created_at:  u.createdAt,
    last_login:  u.lastLogin,
  };
}

function convertThesisFromApi(t: api.Thesis): Thesis {
  const authorNames = t.authors.split(",").map((name) => name.trim()).filter(Boolean);
  return {
    id:               t.id,
    title:            t.title,
    abstract:         t.abstract,
    keywords:         t.keywords,
    authors:          t.authors,
    mainAuthorName:   t.mainAuthorName ?? authorNames[0] ?? null,
    coAuthorName:     t.coAuthorName ?? authorNames[1] ?? null,
    advisors:         t.advisors,
    department:       t.department,
    field_of_research: t.fieldOfResearch,
    year:             t.year,
    pdf_url:          t.pdfUrl,
    status:           t.status,
    uploaded_by:      t.uploadedBy,
    approved_by:      t.approvedBy,
    created_at:       t.createdAt,
    updated_at:       t.updatedAt,
    approved_at:      t.approvedAt,
    rejection_reason: t.rejectionReason,
    view_count:       t.viewCount,
    download_count:   t.downloadCount,
    apaCitation:      t.apaCitation ?? null,
    ieeeCitation:     (t as any).ieeeCitation ?? null,
    acsCitation:      (t as any).acsCitation ?? null,
    doi:              (t as any).doi ?? null,
    mainAuthorEmail:  t.mainAuthorEmail ?? null,
    coAuthorEmail:    t.coAuthorEmail ?? null,
    research_type:    t.researchType ?? null,
  };
}

function convertPasswordResetFromApi(r: api.PasswordResetRequest): PasswordResetRequest {
  return {
    id:           r.id,
    email:        r.email,
    status:       r.status,
    requested_at: r.requestedAt,
    processed_at: r.processedAt,
    processed_by: r.processedBy,
  };
}

// ── Init (no-op with API backend) ─────────────────────────────────────────────
export function initializeMockData() {
  // Backend handles data initialisation
}

// ── Authentication ────────────────────────────────────────────────────────────

export async function mockSignIn(email: string, password: string): Promise<User> {
  const apiUser = await api.apiSignIn(email, password);
  return convertUserFromApi(apiUser);
}

export function mockSignOut() {
  api.apiSignOut();
}

export function getCurrentUser(): User | null {
  const apiUser = api.getCurrentUser();
  return apiUser ? convertUserFromApi(apiUser) : null;
}

export function getStoredUserId(): string | null {
  return api.getStoredUserId();
}

export async function mockSignUp(
  email: string,
  password: string,
  name: string,
  role: UserRole,
  department?: string,
  studentId?: string
): Promise<User> {
  const apiUser = await api.apiSignUp(email, password, name, role, department, studentId);
  return convertUserFromApi(apiUser);
}

// ── User Management ───────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
  const apiUsers = await api.apiGetAllUsers();
  return apiUsers.map(convertUserFromApi);
}

export async function getUserById(userId: string): Promise<User> {
  const apiUser = await api.apiGetUserById(userId);
  return convertUserFromApi(apiUser);
}

export async function updateUserStatus(
  userId: string,
  updates: Partial<Pick<User, 'is_approved' | 'is_active'>>
): Promise<void> {
  await api.apiUpdateUserStatus(userId, {
    isApproved: updates.is_approved,
    isActive:   updates.is_active,
  });
}

// ── Thesis Management ─────────────────────────────────────────────────────────

export async function getAllTheses(): Promise<Thesis[]> {
  const apiTheses = await api.apiGetAllTheses();
  return apiTheses.map(convertThesisFromApi);
}

export async function searchTheses(
  filters: api.SearchThesesParams
): Promise<Thesis[]> {
  const apiTheses = await api.apiSearchTheses(filters);
  return apiTheses.map(convertThesisFromApi);
}

export async function getThesisById(id: string): Promise<Thesis | null> {
  const apiThesis = await api.apiGetThesisById(id);
  return apiThesis ? convertThesisFromApi(apiThesis) : null;
}

export async function createThesis(
  thesis: Omit<Thesis, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'download_count'>
): Promise<Thesis> {
  const apiThesis = await api.apiCreateThesis({
    title:           thesis.title,
    abstract:        thesis.abstract,
    keywords:        thesis.keywords,
    authors:         thesis.authors,
    mainAuthorName:  thesis.mainAuthorName ?? thesis.authors.split(",")[0]?.trim() ?? "",
    coAuthorName:    thesis.coAuthorName ?? thesis.authors.split(",")[1]?.trim() ?? "",
    advisors:        thesis.advisors,
    department:      thesis.department,
    fieldOfResearch: thesis.field_of_research,
    year:            thesis.year,
    pdfUrl:          thesis.pdf_url,
    uploadedBy:      thesis.uploaded_by ?? '',
    mainAuthorEmail: thesis.mainAuthorEmail ?? '',
    coAuthorEmail:   thesis.coAuthorEmail ?? null,
    researchType:    thesis.research_type ?? null,
  });
  return convertThesisFromApi(apiThesis);
}

export async function updateThesis(
  id: string,
  updates: Partial<Thesis>
): Promise<Thesis> {
  const apiThesis = await api.apiUpdateThesis(id, {
    title:          updates.title,
    abstract:       updates.abstract,
    keywords:       updates.keywords,
    authors:        updates.authors,
    advisors:       updates.advisors,
    department:     updates.department,
    fieldOfResearch: updates.field_of_research,
    year:           updates.year,
    status:         updates.status,
    approvedBy:     updates.approved_by ?? undefined,
    rejectionReason: updates.rejection_reason,
    mainAuthorEmail: updates.mainAuthorEmail,
    coAuthorEmail: updates.coAuthorEmail,
    researchType:   updates.research_type ?? undefined,
  } as Partial<api.Thesis> & { rejectionReason?: string });
  return convertThesisFromApi(apiThesis);
}

export async function deleteThesis(id: string): Promise<void> {
  await api.apiDeleteThesis(id);
}

// ── PDF ───────────────────────────────────────────────────────────────────────

export async function uploadPDF(file: File): Promise<string> {
  return api.apiUploadPDF(file);
}

export function getPDFUrl(fileId: string): string | null {
  return null; // Handled by backend FilePath
}

// Async version — calls the backend to fetch base64 PDF data
export async function getPDFUrlAsync(fileId: string): Promise<string | null> {
  return api.apiGetPDFUrl(fileId);
}

export async function getThesisPDFByIdAsync(thesisId: string): Promise<string | null> {
  return api.apiGetThesisPdfById(thesisId);
}

// ── Password Reset ────────────────────────────────────────────────────────────

export async function createPasswordResetRequest(
  email: string
): Promise<PasswordResetRequest> {
  const r = await api.apiCreatePasswordResetRequest(email);
  return convertPasswordResetFromApi(r);
}

export async function getAllPasswordResetRequests(): Promise<PasswordResetRequest[]> {
  const requests = await api.apiGetAllPasswordResetRequests();
  return requests.map(convertPasswordResetFromApi);
}

export async function updatePasswordResetRequest(
  id: string,
  updates: Partial<Pick<PasswordResetRequest, 'status' | 'processed_at' | 'processed_by'>>
): Promise<void> {
  await api.apiUpdatePasswordResetRequest(id, {
    status:      updates.status || 'pending',
    processedBy: updates.processed_by || '',
  });
}

export async function deletePasswordResetRequest(id: string): Promise<void> {
  await api.apiDeletePasswordResetRequest(id);
}

export async function checkPasswordResetStatus(
  email: string
): Promise<{ id: string; email: string; status: string }> {
  return api.apiCheckPasswordResetStatus(email);
}

export async function resetPassword(
  email: string,
  newPassword: string
): Promise<void> {
  await api.apiResetPassword(email, newPassword);
}
