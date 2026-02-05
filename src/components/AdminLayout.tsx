import { Outlet } from 'react-router-dom';
import AdminHeaderDesktop from './AdminHeaderDesktop';
import AdminHeaderMobile from './AdminHeaderMobile';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-app-bg text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <AdminHeaderDesktop />
        <AdminHeaderMobile />
      </header>
      <main className="pt-1 md:pt-10">
        <Outlet />
      </main>
    </div>
  );
}
