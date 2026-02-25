import type { PayoutReport } from '../../types/payouts';

const report: PayoutReport = {
  id: '2025_1',
  term: '2025-1',
  projectTitle: '인하 — 명지의 여름을 채우다',

  sales: [
    { label: '리유저블 보틀(예약판매, 33개)', amount: 198_000 },
    { label: '2in1 보조배터리(예약판매, 53개)', amount: 371_000 },
    { label: '띵빵이 부채(예약판매, 24개)', amount: 12_000 },
    { label: '리유저블 보틀(현장판매, 12개)', amount: 72_000 },
    { label: '2in1 보조배터리(현장판매, 13개)', amount: 91_000 },
    { label: '띵빵이 부채(현장판매, 22개)', amount: 11_000 },
  ],

  expenseGroups: [
    {
      title: '물품 제작 비용',
      items: [
        { label: '리유저블 보틀(60개)', amount: 317_640 },
        { label: '2 in 1 보조배터리(70개)', amount: 378_840 },
        { label: '띵빵이 부채(48개)', amount: 43_340 },
      ],
    },
    {
      title: '홍보비',
      items: [
        { label: '홍보 포스터', amount: 32_000 },
        { label: '물품 전시 디오라마 제작', amount: 31_000 },
      ],
    },
  ],

  footerNote:
    '모든 금액은 현금가 기준이며, 카드 결제 시 부가세 10% 추가됩니다.',
  instaHandle: '@mju_craft',
};

export default report;
