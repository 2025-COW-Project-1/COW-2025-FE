export type MoneyItem = {
  label: string;
  amount: number;
  unitPrice?: number;
  quantity?: number;
};

export type ExpenseGroup = {
  title: string;
  items: MoneyItem[];
};

export type SettlementReport = {
  id: string;
  term: string;
  projectTitle: string;
  sales: MoneyItem[];
  expenseGroups: ExpenseGroup[];
  footerNote?: string;
  instaHandle?: string;
};
