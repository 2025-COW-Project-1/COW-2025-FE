// src/api/settlements.ts
import { api } from './client';
import { settlementReports } from '../data/settlements';
import type {
  SettlementReport,
  MoneyItem,
  ExpenseGroup,
} from '../types/settlements';

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.DEV;

export function sumItems(items: MoneyItem[]) {
  return items.reduce((acc, it) => acc + it.amount, 0);
}

export function sumExpenses(groups: ExpenseGroup[]) {
  return groups.reduce((acc, g) => acc + sumItems(g.items), 0);
}

export function calcReport(r: SettlementReport) {
  const salesTotal = sumItems(r.sales);
  const expenseTotal = sumExpenses(r.expenseGroups);
  const profit = salesTotal - expenseTotal;
  const profitRate = salesTotal === 0 ? 0 : (profit / salesTotal) * 100;
  return { salesTotal, expenseTotal, profit, profitRate };
}

export const settlementsApi = {
  async list(): Promise<SettlementReport[]> {
    if (USE_MOCK) return settlementReports;

    // ✅ 백엔드 정산 API가 생기면 여기만 맞추면 됨
    // 예: GET /api/settlements -> SettlementReport[] 혹은 {items:[...]}
    const raw = await api<unknown>('/api/settlements');
    return normalizeReportsResponse(raw).map(mapReportDto);
  },
};

/** 백엔드 응답이 배열이거나 {items/data/results} 형태여도 처리 */
type SettlementReportDto = Record<string, unknown>;

function normalizeReportsResponse(raw: unknown): SettlementReportDto[] {
  if (Array.isArray(raw)) return raw as SettlementReportDto[];
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    const items = r.items ?? r.data ?? r.results;
    if (Array.isArray(items)) return items as SettlementReportDto[];
  }
  return [];
}

/** DTO -> Report (백엔드 확정되면 여기 키만 정리하면 끝) */
function mapReportDto(dto: SettlementReportDto): SettlementReport {
  const id = toStr(dto.id ?? dto.reportId) ?? `r_${Date.now()}`;
  const term = toStr(dto.term ?? dto.semester) ?? 'unknown';
  const projectTitle =
    toStr(dto.projectTitle ?? dto.projectName ?? dto.title) ?? '정산';

  const sales = toArray(dto.sales).map(mapItem);
  const expenseGroups = toArray(dto.expenseGroups ?? dto.expenses).map(
    mapGroup
  );

  return {
    id,
    term,
    projectTitle,
    sales,
    expenseGroups,
    footerNote: toStr(dto.footerNote ?? dto.note) ?? undefined,
    instaHandle: toStr(dto.instaHandle ?? dto.handle) ?? undefined,
  };
}

function mapItem(v: unknown): MoneyItem {
  const r = (v ?? {}) as Record<string, unknown>;
  return {
    label: toStr(r.label ?? r.name ?? r.title) ?? '항목',
    amount: toNum(r.amount ?? r.value ?? r.price) ?? 0,
  };
}

function mapGroup(v: unknown): ExpenseGroup {
  const r = (v ?? {}) as Record<string, unknown>;
  return {
    title: toStr(r.title ?? r.name) ?? '지출',
    items: toArray(r.items ?? r.lines).map(mapItem),
  };
}

function toArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function toStr(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return null;
}
function toNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export type { SettlementReport };
