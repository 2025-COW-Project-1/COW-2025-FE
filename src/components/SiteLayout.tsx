import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import { noticesApi, type NoticeResponse } from '../api/notices';
import { formatYmd, parseDateLike } from '../utils/date';

export default function SiteLayout() {
  const [latestNotice, setLatestNotice] = useState<NoticeResponse | null>(null);
  const [noticeReady, setNoticeReady] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const list = await noticesApi.list();
        if (!active) return;

        const sorted = [...(list ?? [])].sort((a, b) => {
          const da = parseDateLike(a.updatedAt ?? a.createdAt);
          const db = parseDateLike(b.updatedAt ?? b.createdAt);
          return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
        });

        const first = sorted[0];
        if (first && typeof first.title === 'string' && first.title.trim()) {
          setLatestNotice(first);
        } else {
          setLatestNotice(null);
        }
      } catch {
        if (!active) return;
        setLatestNotice(null);
      } finally {
        if (active) setNoticeReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const noticeLabel = useMemo(() => {
    if (!latestNotice) return '';
    const date = parseDateLike(
      latestNotice.updatedAt ?? latestNotice.createdAt
    );
    return date ? formatYmd(date) : '';
  }, [latestNotice]);

  const location = useLocation();
  const isHome = location.pathname === '/';

  const showBanner =
    isHome &&
    noticeReady &&
    Boolean(latestNotice?.id) &&
    Boolean(latestNotice?.title?.trim());

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-slate-900 font-body">
      <Header />

      <main className="flex-1 pt-16">
        {showBanner && latestNotice && (
          <div className="border-b border-slate-200 bg-lineart-to-r from-primary/10 via-white to-primary/5">
            <div className="mx-auto max-w-6xl px-4 py-3">
              <Link
                to={`/notices/${latestNotice.id}`}
                className="group relative block overflow-hidden rounded-3xl border border-primary/10 bg-white/80 px-4 py-2 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)] backdrop-blur transition hover:border-primary/30 hover:shadow-[0_14px_34px_-22px_rgba(15,23,42,0.45)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                      공지
                    </span>
                    <span>최신 공지사항</span>
                    {noticeLabel && (
                      <span className="text-[11px] text-slate-400">
                        {noticeLabel}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-slate-400 group-hover:text-primary">
                    눌러서 확인 →
                  </span>
                </div>

                <p className="mt-0 pb-2 text-center text-base font-bold text-slate-900 md:text-xl">
                  {latestNotice.title}
                </p>
              </Link>
            </div>
          </div>
        )}

        <Outlet />
      </main>

      <footer className="mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
          <div className="font-heading text-base text-primary">명지공방</div>
          <div className="mt-2">
            제작: 명지대학교 IT 서비스 개발 중앙 동아리 COW
          </div>
          <div className="mt-1">
            © {new Date().getFullYear()} MJU Craft Studio
          </div>
        </div>
      </footer>
    </div>
  );
}
