import { api, withApiBase } from './client';
import { settlementReports } from '../data/settlements';
import type {
  SettlementReport,
  MoneyItem,
  ExpenseGroup,
} from '../types/settlements';

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.DEV;

export function getItemTotal(item: MoneyItem) {
  if (item.unitPrice !== undefined || item.quantity !== undefined) {
    const unitPrice = item.unitPrice ?? 0;
    const quantity = item.quantity ?? 0;
    return unitPrice * quantity;
  }
  return item.amount;
}

export function sumItems(items: MoneyItem[]) {
  return items.reduce((acc, it) => acc + getItemTotal(it), 0);
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
    if (USE_MOCK) {
      return settlementReports;
    }

    const raw = await api<unknown>(withApiBase('/settlements'));
    return normalizeReportsResponse(raw).map(mapReportDto);
  },
};

type SettlementReportDto = Record<string, unknown>;

function normalizeReportsResponse(raw: unknown): SettlementReportDto[] {
  if (Array.isArray(raw)) return raw as SettlementReportDto[];

  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    const items = r.items ?? r.results;
    if (Array.isArray(items)) return items as SettlementReportDto[];
  }

  return [];
}

function mapReportDto(dto: SettlementReportDto): SettlementReport {
  const id = toStr(dto.id ?? dto.reportId) ?? `r_${Date.now()}`;
  const term = toStr(dto.term ?? dto.semester) ?? 'unknown';
  const projectTitle =
    toStr(dto.projectTitle ?? dto.projectName ?? dto.title) ?? '정산';

  const sales = toArray(dto.sales).map(mapItem);
  const expenseGroups = toArray(dto.expenseGroups ?? dto.expenses).map(
    mapGroup,
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
  const label = toStr(r.label ?? r.name ?? r.title) ?? '항목';
  const rawAmount = toNum(r.amount ?? r.value ?? r.total) ?? 0;
  const unitPrice = toNum(r.unitPrice ?? r.unit_price ?? r.price) ?? undefined;
  const quantity = toNum(r.quantity ?? r.qty ?? r.count) ?? undefined;

  if (unitPrice !== undefined || quantity !== undefined) {
    const normalizedQuantity = quantity ?? (unitPrice !== undefined ? 1 : 0);
    const normalizedUnitPrice =
      unitPrice ??
      (normalizedQuantity ? rawAmount / normalizedQuantity : rawAmount);
    return {
      label,
      amount: normalizedUnitPrice * normalizedQuantity,
      unitPrice: normalizedUnitPrice,
      quantity: normalizedQuantity,
    };
  }

  return {
    label,
    amount: rawAmount,
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