import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { adminApi } from '../api/admin';

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? 'access_token';

const NAV_ITEMS = [
  { key: 'edit', label: '회원정보', href: '/admin#edit' },
  { key: 'about', label: '소개', href: '/admin#about?tab=main' },
  { key: 'links', label: '링크', href: '/admin#links' },
  { key: 'projects', label: '프로젝트/상품', href: '/admin/projects' },
  { key: 'orders', label: '주문', href: '/admin/orders' },
  { key: 'notices', label: '공지사항', href: '/admin/notices' },
  { key: 'settlements', label: '정산', href: '/admin#settlements' },
];

export default function AdminHeaderMobile() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <div className="mx-auto flex items-center justify-between px-4 py-3 md:hidden">
        <Link to="/admin" className="font-heading text-lg text-white">
          명지공방 관리자
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-700 text-slate-200"
          aria-label="Open admin menu"
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
            <path
              d="M1 1h16M1 6h16M1 11h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={[
            'fixed inset-0 z-40 bg-black/40 transition-opacity duration-200',
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          ].join(' ')}
          aria-label="Close admin menu backdrop"
        />

        <aside
          className={[
            'fixed left-0 top-0 z-50 h-screen w-60 bg-slate-950 p-6 text-slate-100 shadow-2xl',
            'transition-transform duration-200 ease-out',
            open ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div className="flex items-center justify-between">
            <div className="font-heading text-lg">ADMIN MENU</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-2xl text-slate-400"
              aria-label="Close admin menu"
            >
              ×
            </button>
          </div>

          <nav className="mt-6 space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setFeedbackOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              aria-expanded={feedbackOpen}
            >
              피드백
              <span
                className={[
                  'text-slate-400 transition-transform',
                  feedbackOpen ? 'rotate-90' : 'rotate-0',
                ].join(' ')}
              >
                ?
              </span>
            </button>

            <div
              className={[
                'ml-2 overflow-hidden transition-all duration-200',
                feedbackOpen ? 'mt-1 max-h-40' : 'mt-0 max-h-0',
              ].join(' ')}
            >
              <div
                className={[
                  'space-y-1 rounded-xl border border-slate-800 bg-slate-900/40 p-2',
                  feedbackOpen ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
              >
                <Link
                  to="/admin#form"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                >
                  폼 수정
                </Link>
                <Link
                  to="/admin#feedback"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                >
                  목록
                </Link>
              </div>
            </div>
          </nav>

          <button
            type="button"
            onClick={async () => {
              try {
                await adminApi.logout();
              } finally {
                localStorage.removeItem(TOKEN_KEY);
                navigate('/');
              }
            }}
            className="mt-6 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            LOGOUT
          </button>
        </aside>
      </div>
    </>
  );
}
