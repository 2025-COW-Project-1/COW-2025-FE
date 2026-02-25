export type MoneyItem = {
  id?: string | number;
  label: string;
  amount: number;
  unitPrice?: number;
  quantity?: number;
  category?: string;
};

export type ExpenseGroup = {
  title: string;
  items: MoneyItem[];
};

export type PayoutReport = {
  id: string;
  term: string;
  projectTitle: string;
  sales: MoneyItem[];
  expenseGroups: ExpenseGroup[];
  footerNote?: string;
  instaHandle?: string;
};
