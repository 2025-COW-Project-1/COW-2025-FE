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
              <div className="relative h-[96px] overflow-hidden rounded-3xl border border-primary/10 bg-white/80 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)] backdrop-blur md:h-[104px]">
                <div
                  className="flex h-full"
                  style={{
                    width: `${slides.length * 100}%`,
                    transform: `translateX(-${(slideIndex / slides.length) * 100}%)`,
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
                        className="flex h-full w-full shrink-0 flex-col justify-center px-4 py-3"
                        style={{ width: `${100 / slides.length}%` }}
                      >
                        <div className="flex flex-nowrap items-center justify-between gap-2">
                          <div className="flex min-w-0 shrink items-center gap-2 text-xs font-semibold text-slate-500">
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                              공지
                            </span>
                            <span className="truncate">
                              최신 공지사항
                              {label && ` · ${label}`}
                            </span>
                          </div>
                          <span className="shrink-0 text-xs font-semibold text-slate-400">
                            눌러서 확인 →
                          </span>
                        </div>
                        <p
                          className="mt-1.5 line-clamp-2 min-h-[2.5em] text-center text-base font-bold leading-tight text-slate-900 md:text-xl"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
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
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="font-heading text-lg text-primary">
                명지공방 MJU Craft Studio
              </div>
              <p className="mt-2 max-w-md text-xs text-slate-500">
                명지대학교 학생들의 창작 활동과 프로젝트를 연결하는 공방형
                커뮤니티입니다. 공방 안팎의 다양한 작업과 이야기를 이곳에서
                만나보세요.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs md:grid-cols-3">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Studio
                </h2>
                <ul className="mt-3 space-y-1">
                  <li>
                    <Link
                      to="/about"
                      className="text-slate-600 hover:text-primary"
                    >
                      소개
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/projects"
                      className="text-slate-600 hover:text-primary"
                    >
                      컬렉션
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/notices"
                      className="text-slate-600 hover:text-primary"
                    >
                      공지사항
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Recruit
                </h2>
                <ul className="mt-3 space-y-1">
                  <li>
                    <Link
                      to="/apply"
                      className="text-slate-600 hover:text-primary"
                    >
                      모집 안내
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settlements"
                      className="text-slate-600 hover:text-primary"
                    >
                      정산 안내
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Contact
                </h2>
                <ul className="mt-3 space-y-1">
                  <li>
                    <Link
                      to="/contact"
                      className="text-slate-600 hover:text-primary"
                    >
                      문의하기
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Admin
                </h2>
                <ul className="mt-3 space-y-1">
                  <li>
                    <Link
                      to="/login"
                      className="text-slate-500 hover:text-primary"
                    >
                      관리자 로그인
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-400 md:flex-row md:items-center">
            <p>
              © {new Date().getFullYear()} MJU Craft Studio. All rights
              reserved.
            </p>
            <p>
              Designed &amp; built by{' '}
              <span className="font-semibold text-slate-500">
                COW, 명지대학교 IT 서비스 개발 중앙 동아리
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
