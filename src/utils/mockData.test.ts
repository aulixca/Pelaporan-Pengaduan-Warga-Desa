import { describe, expect, it, beforeEach } from 'vitest';
import { getReports, saveReport, deleteReportById, getCategories, initializeMockData } from './mockData';

function resetLocalStorage() {
  localStorage.clear();
}

describe('mockData utilities', () => {
  beforeEach(() => {
    resetLocalStorage();
    initializeMockData();
  });

  it('should initialize and return reports', () => {
    const reports = getReports();
    expect(reports).toHaveLength(5);
    expect(reports[0]).toHaveProperty('title', 'Jalan Berlubang di RT 05');
  });

  it('should save and update a report', () => {
    const reports = getReports();
    const report = { ...reports[0], title: 'Uji Update' };

    saveReport(report);
    const updatedReports = getReports();
    expect(updatedReports.find((r) => r.id === report.id)?.title).toBe('Uji Update');
  });

  it('should delete a report by id', () => {
    const reports = getReports();
    const reportId = reports[0].id;

    deleteReportById(reportId);
    const updatedReports = getReports();
    expect(updatedReports.find((r) => r.id === reportId)).toBeUndefined();
  });

  it('should return categories after initialization', () => {
    const categories = getCategories();
    expect(categories).toHaveLength(7);
    expect(categories[0]).toHaveProperty('name', 'Infrastruktur');
  });
});
