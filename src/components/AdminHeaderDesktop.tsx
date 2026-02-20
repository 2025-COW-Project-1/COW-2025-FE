import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  { key: 'forms', label: '모집 Form', href: '/admin/forms' },
  { key: 'applications', label: '지원서', href: '/admin/applications' },
  // { key: 'settlements', label: '정산', href: '/admin#settlements' },
  { key: 'feedback', label: '피드백', href: '/admin#feedback' },
];

export default function AdminHeaderDesktop() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState<null | 'feedback'>(null);

  const rawActive = location.hash || '#edit';
  const [activePath = 'edit'] = rawActive.replace('#', '').split('?');
  const normalizedActive =
    activePath === 'about-main' || activePath === 'about-detail'
      ? 'about'
      : activePath;

  const activeKey =
    location.pathname.startsWith('/admin/projects') ||
    location.pathname.startsWith('/admin/items')
      ? 'projects'
      : location.pathname.startsWith('/admin/orders')
        ? 'orders'
        : location.pathname.startsWith('/admin/notices')
          ? 'notices'
          : location.pathname.startsWith('/admin/forms')
            ? 'forms'
            : location.pathname.startsWith('/admin/applications')
              ? 'applications'
              : normalizedActive;

  return (
    <div className="mx-auto hidden max-w-none grid-cols-[1fr_auto_1fr] items-center px-6 py-4 md:grid">
      <Link
        to="/admin"
        className="justify-self-start font-heading text-2xl text-white"
      >
        명지공방 관리자
      </Link>

      <nav className="flex flex-wrap items-center gap-1 justify-self-center">
        {NAV_ITEMS.map((item) => {
          const isActive = activeKey === item.key;
          if (item.key === 'feedback') {
            return (
              <div key="feedback" className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpen(open === 'feedback' ? null : 'feedback')
                  }
                  className={[
                    'rounded-full px-3 py-1 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-white text-slate-900'
                      : 'text-slate-300 hover:bg-slate-800',
                  ].join(' ')}
                  aria-expanded={open === 'feedback'}
                  aria-haspopup="menu"
                >
                  피드백 <span className="ml-1 text-slate-400">▾</span>
                </button>

                {open === 'feedback' && (
                  <>
                    <button
                      type="button"
                      aria-label="close dropdown"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setOpen(null)}
                    />
                    <div
                      className="absolute left-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-lg"
                      role="menu"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(null);
                          navigate('/admin#form');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800"
                        role="menuitem"
                      >
                        폼 수정
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(null);
                          navigate('/admin#feedback');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800"
                        role="menuitem"
                      >
                        목록
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              to={item.href}
              className={[
                'rounded-full px-3 py-1 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-white text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800',
              ].join(' ')}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="justify-self-end">
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
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}
