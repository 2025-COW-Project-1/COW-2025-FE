import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { clearAuth } from '../utils/auth';
import { showLogoutToast } from '../utils/LogoutToast';

export default function HeaderMobile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProjectsOpen, setMobileProjectsOpen] = useState(false);

  const { isLoggedIn } = useAuth();

  const pathname = location.pathname;

  const isActive = useMemo(
    () => ({
      home: pathname === '/',
      about: pathname.startsWith('/about'),
      projects: pathname.startsWith('/projects'),
      notices: pathname.startsWith('/notices'),
      payouts: pathname.startsWith('/payouts'),
      apply: pathname.startsWith('/apply'),
      feedback: pathname.startsWith('/feedback'),
      cart: pathname.startsWith('/cart'),
      orderLookup: pathname.startsWith('/orders'),
    }),
    [pathname],
  );

  const menuBase =
    'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors';
  const menuActive = 'bg-primary/10 text-primary';
  const menuIdle = 'text-slate-800 hover:bg-slate-100';

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
            <Link
              to="/"
              onClick={closeAll}
              className={`${menuBase} ${isActive.home ? menuActive : menuIdle}`}
            >
              HOME
            </Link>

            <Link
              to="/about"
              onClick={closeAll}
              className={`${menuBase} ${isActive.about ? menuActive : menuIdle}`}
            >
              ABOUT
            </Link>

            <button
              type="button"
              aria-expanded={mobileProjectsOpen}
              onClick={() => setMobileProjectsOpen((v) => !v)}
              className={`${menuBase} ${
                isActive.projects ? menuActive : menuIdle
              }`}
            >
              PROJECTS
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

            <Link
              to="/notices"
              onClick={closeAll}
              className={`${menuBase} ${isActive.notices ? menuActive : menuIdle}`}
            >
              NOTICES
            </Link>

            <Link
              to="/cart"
              onClick={closeAll}
              className={`${menuBase} ${isActive.cart ? menuActive : menuIdle}`}
            >
              CART
            </Link>

            <Link
              to="/orders/lookup"
              onClick={closeAll}
              className={`${menuBase} ${isActive.orderLookup ? menuActive : menuIdle}`}
            >
              ORDER LOOKUP
            </Link>

            {[
              { label: 'APPLY', href: '/apply', active: isActive.apply },
              {
                label: 'FEEDBACK',
                href: '/feedback',
                active: isActive.feedback,
              },
              {
                label: 'PAYOUTS',
                href: '/payouts',
                active: isActive.payouts,
              },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeAll}
                className={`${menuBase} ${item.active ? menuActive : menuIdle}`}
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
