import type { Category, Report } from './mockData';
import { getReports, getCategories, saveReport, deleteReportById, } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/laporan-api';

async function handleResponse<T = any>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'API request failed');
  }
  return json as T;
}

function isLikelyUserSubmittedReport(report: Report): boolean {
  // App currently creates new reports with Date.now() as ID.
  return /^\d{10,}$/.test(report.id);
}

async function syncLocalOnlyReports(serverReports: Report[]): Promise<Report[]> {
  const localReports = getReports();
  const serverIds = new Set(serverReports.map((report) => report.id));
  const localOnlyCandidates = localReports.filter(
    (report) => !serverIds.has(report.id) && isLikelyUserSubmittedReport(report),
  );

  if (localOnlyCandidates.length === 0) {
    return serverReports;
  }

  let syncedAny = false;

  for (const report of localOnlyCandidates) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      await handleResponse<{ success: boolean; id: string }>(response);
      syncedAny = true;
      serverIds.add(report.id);
    } catch (error) {
      console.warn('Failed to sync local-only report:', report.id, error);
    }
  }

  if (!syncedAny) {
    return serverReports;
  }

  try {
    const refreshResponse = await fetch(`${API_BASE_URL}/reports.php`);
    return await handleResponse<Report[]>(refreshResponse);
  } catch (error) {
    console.warn('Failed to refresh reports after syncing local-only items:', error);
    return serverReports;
  }
}

export async function fetchReports(): Promise<Report[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/reports.php`);
    const serverReports = await handleResponse<Report[]>(response);
    return syncLocalOnlyReports(serverReports.map((report) => ({
      ...report,
      alasan_penolakan: report.alasan_penolakan ?? report.adminNote ?? '',
    })));
  } catch (error) {
    console.warn('Fetch reports failed, using local fallback:', error);
    return getReports();
  }
}

export async function fetchReportById(id: string): Promise<Report> {
  try {
    const response = await fetch(`${API_BASE_URL}/reports.php?id=${encodeURIComponent(id)}`);
    const report = await handleResponse<Report>(response);
    return {
      ...report,
      alasan_penolakan: report.alasan_penolakan ?? report.adminNote ?? '',
    };
  } catch (error) {
    console.warn('Fetch report by id failed, using local fallback:', error);
    const report = getReports().find((item) => item.id === id);
    if (!report) {
      throw new Error('Report not found');
    }
    return report;
  }
}

export async function createReport(report: Report): Promise<{ success: boolean; id: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/reports.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });
    const result = await handleResponse<{ success: boolean; id: string }>(response);
    // Keep local cache in sync for fast UI refresh and offline read.
    saveReport(report);
    return result;
  } catch (error) {
    console.warn('Create report failed, keeping local draft only:', error);
    saveReport(report);
    throw new Error('Laporan belum terkirim ke server. Data tersimpan lokal, silakan cek koneksi API lalu kirim ulang.');
  }
}

export async function updateReport(report: Report, actorId?: string): Promise<{ success: boolean }> {
  const query = actorId
    ? `${API_BASE_URL}/reports.php?id=${encodeURIComponent(report.id)}&actorId=${encodeURIComponent(actorId)}`
    : `${API_BASE_URL}/reports.php?id=${encodeURIComponent(report.id)}`;

  const response = await fetch(query, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(report),
  });
  const result = await handleResponse<{ success: boolean }>(response);
  saveReport(report);
  return result;
}

export async function deleteReport(reportId: string, actorId: string): Promise<{ success: boolean }> {
  const response = await fetch(
    `${API_BASE_URL}/reports.php?id=${encodeURIComponent(reportId)}&actorId=${encodeURIComponent(actorId)}`,
    {
      method: 'DELETE',
    },
  );

  const result = await handleResponse<{ success: boolean }>(response);
  deleteReportById(reportId);
  return result;
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories.php`);
    return handleResponse(response);
  } catch (error) {
    console.warn('Fetch categories failed, using local fallback:', error);
    return getCategories();
  }
}
