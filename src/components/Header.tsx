import { useNavigate, Link } from 'react-router-dom';
import HeaderDesktop from './HeaderDesktop';
import HeaderMobile from './HeaderMobile';
import { useAuth } from '../hooks/useAuth';
import { clearAuth } from '../utils/auth';
import { showLogoutToast } from '../utils/LogoutToast';

export default function Header() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-slate-200/60 bg-white/75 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-none grid-cols-[1fr_auto_1fr] items-center px-6">
          <Link
            to="/"
            className="justify-self-start font-heading text-2xl tracking-tight text-primary"
          >
            명지공방
          </Link>

          <HeaderDesktop />
          <HeaderMobile />

          <div className="justify-self-end hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  clearAuth();
                  showLogoutToast();
                  navigate('/', { replace: true });
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                LOGOUT
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                LOGIN/SIGNUP
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
