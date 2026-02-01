import { useState } from 'react';
import { Link } from 'react-router-dom';

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? 'access_token';
const LOGIN_ID_KEY = 'admin_login_id';

export default function HeaderMobile() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProjectsOpen, setMobileProjectsOpen] = useState(false);

  const loginId = localStorage.getItem(LOGIN_ID_KEY);
  const displayName = loginId ? `${loginId}님, 안녕하세요!` : '로그인 후 이용해주세요.';
  
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LOGIN_ID_KEY);
    setMobileOpen(false);
    setMobileProjectsOpen(false);
  };

  return (
    <>
      {/* Mobile top buttons */}
      <div className="md:hidden fixed top-3 right-4 z-90 flex items-center gap-2">
        <Link
          to="/admin/login"
          className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white">
          LOGIN
        </Link>

        <button
          type="button"
          onClick={() => {
            setMobileOpen((v) => !v);
            setMobileProjectsOpen(false);
          }}
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
          aria-label="Open menu">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
            <path
              d="M1 1h16M1 6h16M1 11h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Mobile Drawer (always mounted for animation) */}
      <div className="md:hidden">
        {/* overlay */}
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            setMobileProjectsOpen(false);
          }}          
          className={[
            'fixed inset-0 z-60 transition-opacity duration-200',
            mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          ].join(' ')}
          aria-label="Close menu backdrop"/>

        {/* drawer */}
        <aside
          className={[
            'fixed left-0 top-0 z-70 h-screen w-[18rem] bg-white shadow-2xl flex flex-col',
            'transition-transform duration-200 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pl-9 pr-5 py-5">
            <div className="font-heading text-lg text-primary">MENU</div>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setMobileProjectsOpen(false);
              }}              
              aria-label="Close menu panel"
              className="text-2xl font-bold text-slate-700"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 px-5 py-5 space-y-2 bg-white overflow-y-auto">
            {/* MYPAGE */}
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-800 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={loginId ? '/mypage' : '/admin/login'}
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileProjectsOpen(false);
                  }}
                  className="flex-1 hover:opacity-90">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">MYPAGE</div>
                  <div className="mt-1 text-base font-bold text-slate-800">{displayName}</div>
                </Link>

                {loginId && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    로그아웃
                  </button>
                )}
              </div>
            </div>


            {/* HOME */}
            <Link
              to="/"
              onClick={() => {
                setMobileOpen(false);
                setMobileProjectsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                HOME
              </Link>

            {/* ABOUT */}
            <Link
              to="/about"
              onClick={() => {
                setMobileOpen(false);
                setMobileProjectsOpen(false);
              }}              
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">
              ABOUT
            </Link>

            {/* COLLECTIONS (toggle) */}
            <button
            type="button"
            aria-expanded={mobileProjectsOpen}
            onClick={() => setMobileProjectsOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">

              COLLECTIONS
              <span
                className={[
                  'text-slate-400 transition-transform',
                  mobileProjectsOpen ? 'rotate-90' : 'rotate-0',
                ].join(' ')}>
                ›
              </span>
            </button>

            {/* Sub list */}
            <div
              className={[
                'ml-2 overflow-hidden transition-all duration-200',
                mobileProjectsOpen ? 'max-h-40 mt-2' : 'max-h-0 mt-0',
              ].join(' ')}>

              <div
                className={[
                  'space-y-1 rounded-xl border bg-slate-50',
                  mobileProjectsOpen
                    ? 'border-slate-200 p-2 opacity-100'
                    : 'border-transparent p-0 opacity-0',
                ].join(' ')}>

                {[
                  { label: 'ALL', href: '/projects' },
                  { label: 'NOW OPEN', href: '/projects?status=OPEN' },
                  { label: 'COMING SOON', href: '/projects?status=PREPARING' },
                  { label: 'CLOSED', href: '/projects?status=CLOSED' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => {
                      setMobileOpen(false);
                      setMobileProjectsOpen(false);
                    }}                    
                    className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Other menus */}
            {[
              { label: 'FREE RESOURCES', href: '/resources' },
              { label: 'APPLY', href: '/forms' },
              { label: 'CONTACT', href: '/contact' },
              { label: 'PAYOUTS', href: '/settlements' },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => {
                  setMobileOpen(false);
                  setMobileProjectsOpen(false);
                }}                
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
