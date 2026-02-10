import type { SettlementReport } from '../types/settlements';
import { settlementReports } from '../data/settlements';

const STORAGE_KEY = 'cow_admin_settlements_v1';

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadAdminSettlements(): SettlementReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return settlementReports;
    const parsed = JSON.parse(raw) as SettlementReport[];
    return Array.isArray(parsed) ? parsed : settlementReports;
  } catch {
    return settlementReports;
  }
}

export function saveAdminSettlements(next: SettlementReport[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function createSettlementReport(): SettlementReport {
  return {
    id: createId('settlement'),
    term: '',
    projectTitle: '',
    sales: [],
    expenseGroups: [],
  };
}
