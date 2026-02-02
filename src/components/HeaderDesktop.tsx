import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { clearAuth } from '../utils/auth';
import { showLogoutToast } from '../utils/LogoutToast';

type MenuKey = 'projects' | null;

export default function HeaderDesktop() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<MenuKey>(null);
  const isProjectsOpen = open === 'projects';

  const { isLoggedIn, userName } = useAuth();
  const greeting = `${userName || 'USER'}님, 안녕하세요!`;

  const handleLogout = () => {
    clearAuth();
    showLogoutToast();
    setOpen(null);
    navigate('/', { replace: true });
  };

  return (
    <nav className="hidden items-center gap-1 md:flex">
      <Link
        to="/about"
        onClick={() => setOpen(null)}
        className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
      >
        ABOUT
      </Link>

      {/* Projects Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(isProjectsOpen ? null : 'projects')}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
          aria-expanded={isProjectsOpen}
          aria-haspopup="menu"
        >
          COLLECTIONS <span className="ml-1 text-slate-400">▾</span>
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
              { label: 'NOW OPEN', href: '/projects?status=active' },
              { label: 'COMING SOON', href: '/projects?status=upcoming' },
              { label: 'CLOSED', href: '/projects?status=closed' },
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
        to="/resources"
        onClick={() => setOpen(null)}
        className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
      >
        FREE RESOURCES
      </Link>

      <Link
        to="/settlements"
        onClick={() => setOpen(null)}
        className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
      >
        PAYOUTS
      </Link>

      <Link
        to="/forms"
        onClick={() => setOpen(null)}
        className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
      >
        APPLY
      </Link>

      <Link
        to="/contact"
        onClick={() => setOpen(null)}
        className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
      >
        CONTACT
      </Link>

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
        className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
      >
        MYPAGE
      </button>

      <div className="ml-2 flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <button
              type="button"
              onClick={() => {
                setOpen(null);
                navigate('/mypage');
              }}
              className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/15"
              aria-label="마이페이지로 이동"
            >
              {greeting}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            to="/login"
            onClick={() => setOpen(null)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            LOGIN
          </Link>
        )}
      </div>
    </nav>
  );
}
