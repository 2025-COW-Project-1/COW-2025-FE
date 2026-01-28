import { Link } from 'react-router-dom';
import HeaderDesktop from './HeaderDesktop';
import HeaderMobile from './HeaderMobile';

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-slate-200/60 bg-white/75 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            to="/"
            className="font-heading text-xl tracking-tight text-primary">
            명지공방
          </Link>

          <HeaderDesktop />
          <HeaderMobile />
        </div>
      </div>
    </header>
  );
}
