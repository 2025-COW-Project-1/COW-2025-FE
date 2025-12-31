// src/types/settlements.ts
export type MoneyItem = {
  label: string; // 예: "스티커(73개)"
  amount: number; // 원 단위
};

export type ExpenseGroup = {
  title: string; // 예: "제작비"
  items: MoneyItem[];
};

export type SettlementReport = {
  id: string;
  term: string; // "2025-2"
  projectTitle: string; // 예: "감바람 — 명지에 가을바람을 불다"

  sales: MoneyItem[]; // 매출 상세
  expenseGroups: ExpenseGroup[]; // 지출 상세(그룹)

  footerNote?: string;
  instaHandle?: string;
};
