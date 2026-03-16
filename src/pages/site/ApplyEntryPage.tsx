import { Link } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { FilePenLine, FileSearch, Trophy } from 'lucide-react';

const ACTIONS = [
  {
    to: '/apply/new',
    title: '지원하기',
    description: '현재 모집 중인 지원서 양식을 작성합니다.',
    icon: FilePenLine,
    accent: 'from-sky-500 to-indigo-500',
  },
  {
    to: '/apply/manage',
    title: '지원서 조회/수정',
    description:
      '지원서 작성 시 입력한 학번/비밀번호로 지원서를 확인하고 수정합니다.',
    icon: FileSearch,
    accent: 'from-emerald-500 to-cyan-500',
  },
  {
    to: '/apply/result',
    title: '결과 조회',
    description:
      '지원서 작성 시 입력한 학번/비밀번호로 미발표/합격/불합격 여부를 확인합니다.',
    icon: Trophy,
    accent: 'from-amber-500 to-orange-500',
  },
];

export default function ApplyEntryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-heading text-3xl text-primary hover:opacity-90"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              지원하기
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            원하는 기능을 선택해 진행해주세요.
          </p>
        </div>
      </Reveal>

      <Reveal delayMs={80} className="mt-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-5 py-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-300/40"
            >
              <div
                className={[
                  'mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-md',
                  action.accent,
                ].join(' ')}
              >
                <action.icon className="h-5 w-5" />
              </div>

              <p className="text-lg font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-primary">
                {action.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {action.description}
              </p>

              <div
                className={[
                  'pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-linear-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                  action.accent,
                ].join(' ')}
              />
            </Link>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
