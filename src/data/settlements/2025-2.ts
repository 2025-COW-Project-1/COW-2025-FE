// src/data/settlements/2025-2.ts
import type { SettlementReport } from '../../types/settlements';

const report: SettlementReport = {
  id: '2025_2',
  term: '2025-2',
  projectTitle: '감바람 — 명지에 가을바람을 불다',

  // 매출(총계 3,071,713)
  sales: [
    { label: '스티커(73개)', amount: 219_000 },
    { label: '뱃지(73개)', amount: 328_500 },
    { label: '인형(112개)', amount: 2_352_000 },
    { label: '인형 패키징(73개)', amount: 73_000 },
    { label: '준등기(3개)', amount: 6_000 },
    { label: '택배(31개)', amount: 93_000 },
    { label: '기타 수입', amount: 213 },
  ],

  // 지출(총계 3,214,900)
  expenseGroups: [
    {
      title: '제작비',
      items: [
        { label: '인형 샘플 제작비', amount: 450_000 },
        { label: '인형 샘플 물류비', amount: 70_000 },
        { label: '행운카드', amount: 26_710 },
        { label: '인형', amount: 1_824_000 },
        { label: '스티커', amount: 150_000 },
        { label: '뱃지', amount: 225_000 },
      ],
    },
    {
      title: '부가세',
      items: [
        { label: '번개장터 수수료', amount: 22_500 },
        { label: '인형 제작 부가세', amount: 182_400 },
        { label: '인형 샘플 제작 부가세', amount: 45_000 },
      ],
    },
    {
      title: '포장비',
      items: [
        { label: '스티커/뱃지 포장비', amount: 10_300 },
        { label: '인형 포장비', amount: 92_920 },
      ],
    },
    {
      title: '홍보비',
      items: [
        { label: '홍보 포스터 인쇄비', amount: 10_120 },
        { label: '물품 전시 준비 비용', amount: 16_650 },
      ],
    },
    {
      title: '배송비',
      items: [
        { label: '준등기', amount: 5_400 },
        { label: '택배', amount: 83_900 },
      ],
    },
  ],

  footerNote:
    '모든 금액은 현금가 기준이며, 카드 결제 시 부가세 10% 추가됩니다.',
  instaHandle: '@mju_craft',
};

export default report;
