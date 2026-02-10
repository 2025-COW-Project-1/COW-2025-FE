import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import { noticesApi, type NoticeResponse } from '../api/notices';
import { formatYmd, parseDateLike } from '../utils/date';

export default function SiteLayout() {
  const [notices, setNotices] = useState<NoticeResponse[]>([]);
  const [noticeReady, setNoticeReady] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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

        setNotices(sorted);
      } catch {
        if (!active) return;
        setNotices([]);
      } finally {
        if (active) setNoticeReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }
    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  const slides = useMemo(() => {
    if (notices.length <= 1) return notices;
    return [...notices, notices[0]];
  }, [notices]);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (prefersReducedMotion) return;

    const id = window.setInterval(() => {
      setSlideIndex((prev) => prev + 1);
    }, 4500);

    return () => window.clearInterval(id);
  }, [slides.length, prefersReducedMotion]);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (slideIndex !== notices.length) return;

    const handle = window.setTimeout(() => {
      setEnableTransition(false);
      setSlideIndex(0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => setEnableTransition(true));
      });
    }, 520);

    return () => window.clearTimeout(handle);
  }, [slideIndex, notices.length, slides.length]);

  const currentNotice = notices[slideIndex] ?? null;

  const location = useLocation();
  const isHome = location.pathname === '/';

  const showBanner =
    isHome &&
    noticeReady &&
    slides.length > 0 &&
    Boolean(currentNotice?.id) &&
    Boolean(currentNotice?.title?.trim());

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-slate-900 font-body">
      <Header />

      <main className="flex-1 pt-16">
        {showBanner && (
          <div className="border-b border-slate-200 bg-lineart-to-r from-primary/10 via-white to-primary/5">
            <div className="mx-auto max-w-6xl px-4 py-3">
              <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-white/80 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)] backdrop-blur">
                <div
                  className="flex"
                  style={{
                    transform: `translateX(-${slideIndex * 100}%)`,
                    transition: enableTransition
                      ? 'transform 800ms cubic-bezier(0.16, 1, 0.3, 1)'
                      : 'none',
                  }}
                >
                  {slides.map((notice, idx) => {
                    const date = parseDateLike(
                      notice.updatedAt ?? notice.createdAt,
                    );
                    const label = date ? formatYmd(date) : '';
                    return (
                      <Link
                        key={`${notice.id ?? 'notice'}-${idx}`}
                        to={`/notices/${notice.id}`}
                        className="block w-full shrink-0 px-4 py-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                              공지
                            </span>
                            <span>최신 공지사항</span>
                            {label && (
                              <span className="text-[11px] text-slate-400">
                                {label}
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-semibold text-slate-400">
                            눌러서 확인 →
                          </span>
                        </div>

                        <p className="mt-0 pb-2 text-center text-base font-bold text-slate-900 md:text-xl">
                          {notice.title}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
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
