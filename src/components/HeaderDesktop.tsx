import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type MenuKey = 'projects' | 'order' | null;

export default function HeaderDesktop() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState<MenuKey>(null);
  const isProjectsOpen = open === 'projects';
  const isOrderOpen = open === 'order';
  const { isLoggedIn } = useAuth();

  const pathname = location.pathname;

  const isActive = useMemo(
    () => ({
      home: pathname === '/',
      about: pathname.startsWith('/about'),
      projects: pathname.startsWith('/projects'),
      notices: pathname.startsWith('/notices'),
      payouts: pathname.startsWith('/settlements'),
      apply: pathname.startsWith('/apply'),
      contact: pathname.startsWith('/contact'),
      order: pathname.startsWith('/cart') || pathname.startsWith('/orders'),
      mypage: pathname.startsWith('/mypage'),
    }),
    [pathname],
  );

  const navBase =
    'rounded-lg px-3 py-2 text-sm font-semibold transition-colors';
  const navActive = 'bg-primary/10 text-primary';
  const navIdle = 'text-slate-700 hover:bg-slate-100 hover:text-primary';

  return (
    <nav className="hidden items-center gap-1 md:flex justify-self-center">
      <Link
        to="/about"
        onClick={() => setOpen(null)}
        className={`${navBase} ${isActive.about ? navActive : navIdle}`}
      >
        ABOUT
      </Link>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(isProjectsOpen ? null : 'projects')}
          className={`${navBase} ${isActive.projects ? navActive : navIdle}`}
          aria-expanded={isProjectsOpen}
          aria-haspopup="menu"
        >
          PROJECTS <span className="ml-1 text-slate-400">▾</span>
        </button>

        {isProjectsOpen && (
          <button
            type="button"
            aria-label="close dropdown"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(null)}
          />
        )}

        <div
          className={[
            'absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg',
            'transition-all duration-200 ease-out',
            isProjectsOpen
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-1 opacity-0',
          ].join(' ')}
          role="menu"
        >
          <div className="py-2">
            {[
              { label: 'ALL', href: '/projects' },
              { label: 'NOW OPEN', href: '/projects?status=OPEN' },
              { label: 'COMING SOON', href: '/projects?status=PREPARING' },
              { label: 'CLOSED', href: '/projects?status=CLOSED' },
            ].map((x) => (
              <button
                key={x.href}
                type="button"
                onClick={() => {
                  setOpen(null);
                  navigate(x.href);
                }}
                className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                role="menuitem"
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Link
        to="/notices"
        onClick={() => setOpen(null)}
        className={`${navBase} ${isActive.notices ? navActive : navIdle}`}
      >
        NOTICES
      </Link>

      <Link
        to="/settlements"
        onClick={() => setOpen(null)}
        className={`${navBase} ${isActive.payouts ? navActive : navIdle}`}
      >
        PAYOUTS
      </Link>

      <Link
        to="/apply"
        onClick={() => setOpen(null)}
        className={`${navBase} ${isActive.apply ? navActive : navIdle}`}
      >
        APPLY
      </Link>

      <Link
        to="/contact"
        onClick={() => setOpen(null)}
        className={`${navBase} ${isActive.contact ? navActive : navIdle}`}
      >
        FEEDBACK
      </Link>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(isOrderOpen ? null : 'order')}
          className={`${navBase} ${isActive.order ? navActive : navIdle}`}
          aria-expanded={isOrderOpen}
          aria-haspopup="menu"
        >
          ORDER <span className="ml-1 text-slate-400">▾</span>
        </button>

        {isOrderOpen && (
          <button
            type="button"
            aria-label="close dropdown"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(null)}
          />
        )}

        <div
          className={[
            'absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg',
            'transition-all duration-200 ease-out',
            isOrderOpen
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-1 opacity-0',
          ].join(' ')}
          role="menu"
        >
          <div className="py-2">
            {[
              { label: 'CART', href: '/cart' },
              { label: 'ORDER LOOKUP', href: '/orders/lookup' },
            ].map((x) => (
              <button
                key={x.href}
                type="button"
                onClick={() => {
                  setOpen(null);
                  navigate(x.href);
                }}
                className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                role="menuitem"
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setOpen(null);
          if (!isLoggedIn) {
            alert('로그인 후 사용 가능합니다.');
            navigate('/login');
            return;
          }
          navigate('/mypage');
        }}
        className={`${navBase} ${isActive.mypage ? navActive : navIdle}`}
      >
        MYPAGE
      </button>
    </nav>
  );
}
