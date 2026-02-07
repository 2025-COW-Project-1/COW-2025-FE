import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { clearAuth } from '../utils/auth';
import { showLogoutToast } from '../utils/LogoutToast';

export default function HeaderMobile() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProjectsOpen, setMobileProjectsOpen] = useState(false);

  const { isLoggedIn, userName } = useAuth();

  const displayName = isLoggedIn ? (
    <>
      {userName || 'USER'}님,
      <br />
      안녕하세요!
    </>
  ) : (
    <>
      로그인 후
      <br />
      이용해주세요.
    </>
  );

  const closeAll = () => {
    setMobileOpen(false);
    setMobileProjectsOpen(false);
  };

  const handleLogout = () => {
    clearAuth();
    showLogoutToast();
    closeAll();
    navigate('/', { replace: true });
  };

  return (
    <>
      <div className="fixed right-4 top-3 z-90 flex items-center gap-2 md:hidden">
        {!isLoggedIn && (
          <Link
            to="/login"
            className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white"
          >
            LOGIN
          </Link>
        )}

        <button
          type="button"
          onClick={() => {
            setMobileOpen((v) => !v);
            setMobileProjectsOpen(false);
          }}
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
          aria-label="Open menu"
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
          onClick={closeAll}
          className={[
            'fixed inset-0 z-60 transition-opacity duration-200',
            mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          ].join(' ')}
          aria-label="Close menu backdrop"
        />

        <aside
          className={[
            'fixed left-0 top-0 z-70 flex h-screen w-60 flex-col bg-white shadow-2xl',
            'transition-transform duration-200 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div className="flex items-center justify-between border-b border-slate-200 py-5 pl-9 pr-5">
            <div className="font-heading text-lg text-primary">MENU</div>
            <button
              type="button"
              onClick={closeAll}
              aria-label="Close menu panel"
              className="text-2xl font-bold text-slate-700"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-white px-5 py-5">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-800 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={isLoggedIn ? '/mypage' : '/login'}
                  onClick={closeAll}
                  className="flex-1 text-left hover:opacity-90"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    MYPAGE
                  </div>
                  <div className="mt-1 text-base font-bold text-slate-800">
                    {displayName}
                  </div>
                </Link>
              </div>
            </div>

            <Link
              to="/"
              onClick={closeAll}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              HOME
            </Link>

            <Link
              to="/about"
              onClick={closeAll}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              ABOUT
            </Link>

            <button
              type="button"
              aria-expanded={mobileProjectsOpen}
              onClick={() => setMobileProjectsOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              COLLECTIONS
              <span
                className={[
                  'text-slate-400 transition-transform',
                  mobileProjectsOpen ? 'rotate-90' : 'rotate-0',
                ].join(' ')}
              >
                ›
              </span>
            </button>

            <div
              className={[
                'ml-2 overflow-hidden transition-all duration-200',
                mobileProjectsOpen ? 'mt-2 max-h-40' : 'mt-0 max-h-0',
              ].join(' ')}
            >
              <div
                className={[
                  'space-y-1 rounded-xl border bg-slate-50',
                  mobileProjectsOpen
                    ? 'border-slate-200 p-2 opacity-100'
                    : 'border-transparent p-0 opacity-0',
                ].join(' ')}
              >
                {[
                  { label: 'ALL', href: '/projects' },
                  { label: 'NOW OPEN', href: '/projects?status=OPEN' },
                  { label: 'COMING SOON', href: '/projects?status=PREPARING' },
                  { label: 'CLOSED', href: '/projects?status=CLOSED' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={closeAll}
                    className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {[
              { label: 'APPLY', href: '/forms' },
              { label: 'CONTACT', href: '/contact' },
              { label: 'PAYOUTS', href: '/settlements' },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeAll}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                LOGOUT
              </button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
